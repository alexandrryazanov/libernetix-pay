import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { PaymentModule } from '@/modules/payment/payment.module';
import { OrdersModule } from '@/modules/orders/orders.module';
import { WebhooksModule } from '@/modules/webhooks/webhooks.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    PaymentModule,
    OrdersModule,
    WebhooksModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
