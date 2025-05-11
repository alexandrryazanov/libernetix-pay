import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { LoggerModule } from 'nestjs-pino';

@Module({
  providers: [OrdersService, LoggerModule],
  controllers: [OrdersController],
  exports: [OrdersService],
})
export class OrdersModule {}
