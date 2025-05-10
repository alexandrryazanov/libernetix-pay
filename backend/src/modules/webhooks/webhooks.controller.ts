import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { LibernetixWebhooksService } from './libernetix/libernetix-webhooks.service';
import { WebhookSignatureGuard } from '@/guards/webhook-signature.guard';

@Controller('webhooks')
export class WebhooksController {
  constructor(
    private readonly libernetixWebhooksService: LibernetixWebhooksService,
  ) {}

  @Post('libernetix')
  @UseGuards(WebhookSignatureGuard)
  async handleLibernetixWebhook(@Req() req: Request) {
    const payload = JSON.parse(req.body.toString('utf8'));
    return this.libernetixWebhooksService.eventHandler(payload);
  }
}
