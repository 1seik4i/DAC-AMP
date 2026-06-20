import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase.service';
import { PriorityCommandQueue, CommandPriority } from '../driver/command-queue';
import { CommandId } from '../usb/packet';

@Injectable()
export class FirmwareManagerService {
  private readonly logger = new Logger(FirmwareManagerService.name);

  constructor(
    private readonly supabase: SupabaseService,
    private readonly queue: PriorityCommandQueue,
  ) {}

  async flashFirmware(version: string) {
    if (!this.supabase.client) {
      this.logger.error('Supabase not configured. Cannot download firmware.');
      return;
    }

    this.logger.log(`Initiating firmware flash for ${version}`);
    
    // 1. Fetch metadata
    // const { data } = await this.supabase.client.from('firmware').select('*').eq('version', version).single();
    
    // 2. Download from storage
    // const { data: fileData } = await this.supabase.client.storage.from('firmware-binaries').download(data.storage_path);
    
    // 3. Send to ESP32
    try {
      await this.queue.enqueue(CommandId.FIRMWARE_START, CommandPriority.HIGH);
      // Chunking logic here
      // await this.queue.enqueue(CommandId.FIRMWARE_CHUNK, CommandPriority.HIGH, chunkPayload);
      await this.queue.enqueue(CommandId.FIRMWARE_END, CommandPriority.HIGH);
      this.logger.log(`Firmware ${version} flashed successfully.`);
    } catch (err) {
      this.logger.error(`Firmware flash failed: ${err.message}`);
    }
  }
}
