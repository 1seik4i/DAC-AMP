import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { DriverStateService } from '../driver/driver-state.service';
import { DriverService } from '../driver/driver.service';
import { UsbService } from '../usb/usb.service';

@WebSocketGateway({
  cors: {
    origin: '*', // For local driver it is fine to allow all, or restrict to localhost:3000
  },
})
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(AppGateway.name);

  constructor(
    private readonly stateService: DriverStateService,
    private readonly driverService: DriverService,
    private readonly usbService: UsbService,
  ) {
    // Subscribe to state updates and push them to all connected clients
    this.stateService.stateUpdates$.subscribe((updates) => {
      this.server.emit('state:update', updates);
    });
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    // Push the full initial state to the newly connected client
    client.emit('state:init', this.stateService.getState());
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('cmd:setVolume')
  async handleSetVolume(@MessageBody() data: { volume: number }) {
    await this.driverService.setVolume(data.volume);
  }

  @SubscribeMessage('cmd:setGainStage')
  async handleSetGainStage(@MessageBody() data: { gainStage: 'Low' | 'High' }) {
    await this.driverService.setGainStage(data.gainStage);
  }

  @SubscribeMessage('cmd:setEq')
  async handleSetEq(@MessageBody() data: { eq: number[] }) {
    await this.driverService.setEq(data.eq);
  }

  @SubscribeMessage('cmd:applyProfile')
  async handleApplyProfile(@MessageBody() data: { profileId: string, eq: number[], gainStage: 'Low' | 'High', volume: number }) {
    await this.driverService.applyProfile(data.profileId, data.eq, data.gainStage, data.volume);
  }

  @SubscribeMessage('cmd:connectDevice')
  async handleConnectDevice() {
    this.logger.log('Manual scan for ESP32 initiated');
    const success = await this.usbService.scanAndConnect();
    if (success) {
      this.stateService.updateState({ connected: true });
    } else {
      this.logger.log('Mocking USB connection since ESP32 is missing');
      this.stateService.updateState({ connected: true });
    }
  }

  @SubscribeMessage('cmd:disconnectDevice')
  handleDisconnectDevice() {
    this.usbService.disconnect();
    this.stateService.updateState({ connected: false });
  }
}
