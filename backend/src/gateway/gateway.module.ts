import { Module } from '@nestjs/common';
import { AppGateway } from './app.gateway';
import { DriverModule } from '../driver/driver.module';
import { UsbModule } from '../usb/usb.module';

@Module({
  imports: [DriverModule, UsbModule],
  providers: [AppGateway],
})
export class GatewayModule {}
