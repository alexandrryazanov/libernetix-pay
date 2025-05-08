import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { ConfigModule } from '@nestjs/config';
import { OrdersModule } from '@/orders/orders.module';

@Module({
  imports: [ConfigModule, OrdersModule],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule {}
