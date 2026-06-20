import { Module } from '@nestjs/common';
import { UsbService } from './usb.service';

@Module({
  providers: [UsbService],
  exports: [UsbService],
})
export class UsbModule {}
