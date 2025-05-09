import { Module } from '@nestjs/common';
import { LibernetixWebhooksService } from './libernetix/libernetix-webhooks.service';
import { WebhooksController } from '@/modules/webhooks/webhooks.controller';
import { OrdersModule } from '@/modules/orders/orders.module';

@Module({
  imports: [OrdersModule],
  providers: [LibernetixWebhooksService],
  controllers: [WebhooksController],
  exports: [LibernetixWebhooksService],
})
export class WebhooksModule {}
