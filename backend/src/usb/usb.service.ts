import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { SerialPort } from 'serialport';
import { PacketParser } from './packet-parser';
import { Packet } from './packet';

@Injectable()
export class UsbService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(UsbService.name);
  private port: SerialPort | null = null;
  private parser: PacketParser;
  private packetReceivedCallback: ((packet: Packet) => void) | null = null;
  private statusChangeCallback: ((connected: boolean) => void) | null = null;

  async onModuleInit() {
    this.parser = new PacketParser();
    this.parser.on('data', (packet: Packet) => {
      if (this.packetReceivedCallback) {
        this.packetReceivedCallback(packet);
      }
    });

    // Removed autoConnect to prevent infinite loops on startup
  }

  onModuleDestroy() {
    this.disconnect();
  }

  public async scanAndConnect(): Promise<boolean> {
    try {
      const ports = await SerialPort.list();
      const espPort = ports.find(p => p.path.toLowerCase().includes('usb') || p.vendorId);
      
      if (espPort) {
        this.connect(espPort.path);
        return true;
      } else {
        this.logger.warn('No ESP32 USB Serial port found during manual scan.');
        return false;
      }
    } catch (err) {
      this.logger.error('Failed to list serial ports', err);
      return false;
    }
  }

  public connect(path: string, baudRate = 115200) {
    if (this.port?.isOpen) {
      this.port.close();
    }

    this.logger.log(`Connecting to ${path} at ${baudRate} baud...`);
    this.port = new SerialPort({ path, baudRate }, (err) => {
      if (err) {
        this.logger.error(`Error opening port: ${err.message}`);
        return;
      }
    });

    this.port.pipe(this.parser);

    this.port.on('open', () => {
      this.logger.log(`Successfully connected to ${path}`);
      if (this.statusChangeCallback) this.statusChangeCallback(true);
    });

    this.port.on('close', () => {
      this.logger.warn(`Disconnected from ${path}`);
      this.port = null;
      if (this.statusChangeCallback) this.statusChangeCallback(false);
    });

    this.port.on('error', (err) => {
      this.logger.error(`SerialPort Error: ${err.message}`);
    });
  }

  public disconnect() {
    if (this.port?.isOpen) {
      this.port.close();
    }
  }

  public isConnected(): boolean {
    return this.port ? this.port.isOpen : false;
  }

  public write(buffer: Buffer): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.isConnected()) {
        return reject(new Error('USB Not connected'));
      }
      if (!this.port) return reject(new Error('USB Not connected'));
      this.port.write(buffer, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }

  public onPacketReceived(cb: (packet: Packet) => void) {
    this.packetReceivedCallback = cb;
  }

  public onStatusChange(cb: (connected: boolean) => void) {
    this.statusChangeCallback = cb;
  }
}
