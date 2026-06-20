import { Module } from '@nestjs/common';
import { UsbModule } from '../usb/usb.module';
import { PriorityCommandQueue } from './command-queue';
import { DriverStateService } from './driver-state.service';
import { DriverService } from './driver.service';

@Module({
  imports: [UsbModule],
  providers: [PriorityCommandQueue, DriverStateService, DriverService],
  exports: [PriorityCommandQueue, DriverStateService, DriverService],
})
export class DriverModule {}
