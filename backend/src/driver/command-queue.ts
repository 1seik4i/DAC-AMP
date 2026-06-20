import { Injectable, Logger } from '@nestjs/common';
import { UsbService } from '../usb/usb.service';
import { PacketSerializer } from '../usb/packet-parser';
import { CommandId } from '../usb/packet';

export enum CommandPriority {
  LOW = 0,    // UI Sync, Equalizer, Volume
  NORMAL = 1, // Profile, Settings, Gain
  HIGH = 2,   // Firmware, Recovery, Reconnect
}

export interface QueuedCommand {
  id: string;
  commandId: CommandId;
  priority: CommandPriority;
  payload: Buffer;
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
  retriesLeft: number;
}

@Injectable()
export class PriorityCommandQueue {
  private readonly logger = new Logger(PriorityCommandQueue.name);
  
  private queue: QueuedCommand[] = [];
  private isProcessing = false;
  private sequenceIdCounter = 0;
  private pendingAck: { seqId: number, resolve: Function, reject: Function, timeoutId: NodeJS.Timeout } | null = null;

  constructor(private readonly usbService: UsbService) {
    // Listen for ACKs from UsbService
    this.usbService.onPacketReceived((packet) => {
      if (this.pendingAck && this.pendingAck.seqId === packet.sequenceId) {
        if (packet.commandId === CommandId.ACK) {
          clearTimeout(this.pendingAck.timeoutId);
          this.pendingAck.resolve(packet);
          this.pendingAck = null;
        } else if (packet.commandId === CommandId.NACK) {
          clearTimeout(this.pendingAck.timeoutId);
          this.pendingAck.reject(new Error('Received NACK from device'));
          this.pendingAck = null;
        }
      }
    });
  }

  async enqueue(commandId: CommandId, priority: CommandPriority, payload: Buffer = Buffer.alloc(0), retries = 3): Promise<any> {
    return new Promise((resolve, reject) => {
      // For debouncing/fusing, we could check if a same LOW priority command exists 
      // and update its payload instead of appending. (e.g. rapid volume changes).
      if (priority === CommandPriority.LOW && (commandId === CommandId.SET_VOLUME || commandId === CommandId.SET_EQ)) {
        const existingIdx = this.queue.findIndex(cmd => cmd.commandId === commandId && cmd.priority === priority);
        if (existingIdx !== -1) {
          // Fuse/Overwrite the existing command payload
          this.queue[existingIdx].payload = payload;
          this.queue[existingIdx].resolve = resolve;
          this.queue[existingIdx].reject = reject;
          return;
        }
      }

      this.queue.push({
        id: Math.random().toString(36).substring(7),
        commandId,
        priority,
        payload,
        resolve,
        reject,
        retriesLeft: retries
      });

      // Sort queue by priority descending
      this.queue.sort((a, b) => b.priority - a.priority);

      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;
    this.isProcessing = true;

    const cmd = this.queue.shift();
    if (!cmd) {
      this.isProcessing = false;
      return;
    }

    try {
      await this.executeCommand(cmd);
      cmd.resolve(true);
    } catch (error) {
      if (cmd.retriesLeft > 0) {
        this.logger.warn(`Command ${cmd.commandId} failed, retrying... (${cmd.retriesLeft} left)`);
        cmd.retriesLeft--;
        this.queue.unshift(cmd); // Put back at the front (highest priority)
      } else {
        this.logger.error(`Command ${cmd.commandId} failed after retries: ${error.message}`);
        cmd.reject(error);
      }
    } finally {
      this.isProcessing = false;
      this.processQueue();
    }
  }

  private executeCommand(cmd: QueuedCommand): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.usbService.isConnected()) {
        return reject(new Error('USB Device not connected'));
      }

      const seqId = ++this.sequenceIdCounter;
      if (this.sequenceIdCounter > 65535) this.sequenceIdCounter = 0;

      const buffer = PacketSerializer.serialize(cmd.commandId, seqId, cmd.payload);

      const timeoutId = setTimeout(() => {
        if (this.pendingAck && this.pendingAck.seqId === seqId) {
          this.pendingAck = null;
          reject(new Error(`Command timeout for sequence ID ${seqId}`));
        }
      }, 1000); // 1s timeout for standard commands

      this.pendingAck = { seqId, resolve, reject, timeoutId };

      this.usbService.write(buffer).catch(err => {
        clearTimeout(timeoutId);
        this.pendingAck = null;
        reject(err);
      });
    });
  }
}
