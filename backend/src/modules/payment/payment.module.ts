import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { ConfigModule } from '@nestjs/config';
import { OrdersModule } from '@/modules/orders/orders.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [ConfigModule, OrdersModule, HttpModule],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule {}
