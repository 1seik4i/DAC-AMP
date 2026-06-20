import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PriorityCommandQueue, CommandPriority } from './command-queue';
import { DriverStateService } from './driver-state.service';
import { CommandId } from '../usb/packet';
import { UsbService } from '../usb/usb.service';

@Injectable()
export class DriverService implements OnModuleInit {
  private readonly logger = new Logger(DriverService.name);

  constructor(
    private readonly queue: PriorityCommandQueue,
    private readonly stateService: DriverStateService,
    private readonly usbService: UsbService,
  ) {}

  onModuleInit() {
    this.usbService.onStatusChange((connected) => {
      this.stateService.updateState({ connected });
      if (connected) {
        // Fetch initial state from device when connected
        this.syncDeviceState();
      }
    });

    // We also listen to raw packets if we need to update state based on incoming telemetry (e.g. GET_STATUS reply)
    this.usbService.onPacketReceived((packet) => {
      if (packet.commandId === CommandId.GET_STATUS) {
        // Parse payload into state updates
        // For this mock implementation, we assume parsing happens here.
        if (packet.payload.length >= 4) {
          const volume = packet.payload.readInt8(0);
          const sampleRate = packet.payload.readUInt32LE(1); // just an example structure
          this.stateService.updateState({ volume, sampleRate });
        }
      }
    });
  }

  private async syncDeviceState() {
    try {
      await this.queue.enqueue(CommandId.GET_STATUS, CommandPriority.HIGH);
      this.logger.log('Successfully synced initial device state.');
    } catch (err) {
      this.logger.error('Failed to sync device state on connect.', err);
    }
  }

  public async setVolume(volume: number) {
    // volume is 0-100 or -120 to 0 dB, let's assume -120 to 0. 
    // Wait, the frontend defaults to 80, so 0-100.
    const payload = Buffer.alloc(1);
    payload.writeUInt8(volume, 0);
    
    // Update local state optimistically
    this.stateService.updateState({ volume });

    try {
      await this.queue.enqueue(CommandId.SET_VOLUME, CommandPriority.LOW, payload);
    } catch (err) {
      this.logger.error(`Failed to set volume: ${err.message}`);
    }
  }

  public async setGainStage(gainStage: 'Low' | 'High') {
    const payload = Buffer.alloc(1);
    payload.writeUInt8(gainStage === 'High' ? 1 : 0, 0);
    
    this.stateService.updateState({ gainStage });

    try {
      await this.queue.enqueue(CommandId.SET_GAIN, CommandPriority.NORMAL, payload);
    } catch (err) {
      this.logger.error(`Failed to set gain: ${err.message}`);
    }
  }

  public async setEq(eq: number[]) {
    // 10 bands, each band is -12 to +12 dB. We can send as 10 signed bytes.
    if (eq.length !== 10) return;
    
    const payload = Buffer.alloc(10);
    for (let i = 0; i < 10; i++) {
      payload.writeInt8(eq[i], i);
    }

    this.stateService.updateState({ customEq: eq });

    try {
      await this.queue.enqueue(CommandId.SET_EQ, CommandPriority.LOW, payload);
    } catch (err) {
      this.logger.error(`Failed to set EQ: ${err.message}`);
    }
  }

  public async applyProfile(profileId: string, eq: number[], gainStage: 'Low' | 'High', volume: number) {
    // For a profile, we might bundle this into a SET_PROFILE command, or send multiple NORMAL priority commands.
    this.logger.log(`Applying profile ${profileId}`);
    
    this.stateService.updateState({ activeProfileId: profileId, customEq: eq, gainStage, volume });

    const eqPayload = Buffer.alloc(10);
    for (let i = 0; i < 10; i++) {
      eqPayload.writeInt8(eq[i], i);
    }

    try {
      // Send as sequential normal priority commands
      await this.queue.enqueue(CommandId.SET_EQ, CommandPriority.NORMAL, eqPayload);
      
      const gainPayload = Buffer.alloc(1);
      gainPayload.writeUInt8(gainStage === 'High' ? 1 : 0, 0);
      await this.queue.enqueue(CommandId.SET_GAIN, CommandPriority.NORMAL, gainPayload);
      
      const volPayload = Buffer.alloc(1);
      volPayload.writeUInt8(volume, 0);
      await this.queue.enqueue(CommandId.SET_VOLUME, CommandPriority.NORMAL, volPayload);
      
    } catch (err) {
      this.logger.error(`Failed to apply profile fully: ${err.message}`);
    }
  }
}
