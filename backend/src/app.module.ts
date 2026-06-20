import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsbModule } from './usb/usb.module';
import { DriverModule } from './driver/driver.module';
import { GatewayModule } from './gateway/gateway.module';
import { LoggerModule } from 'nestjs-pino';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        transport: {
          target: 'pino-pretty',
          options: {
            singleLine: true,
          },
        },
      },
    }),
    UsbModule, 
    DriverModule, 
    GatewayModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
