import { Module } from '@nestjs/common';
import { LibernetixWebhooksService } from './libernetix/libernetix-webhooks.service';
import { WebhooksController } from '@/modules/webhooks/webhooks.controller';

@Module({
  providers: [LibernetixWebhooksService],
  controllers: [WebhooksController],
  exports: [LibernetixWebhooksService],
})
export class WebhooksModule {}
