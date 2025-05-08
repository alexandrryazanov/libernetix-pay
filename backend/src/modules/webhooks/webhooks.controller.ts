import { Body, Controller, Post } from '@nestjs/common';
import { LibernetixWebhooksService } from './libernetix/libernetix-webhooks.service';

@Controller('webhooks')
export class WebhooksController {
  constructor(
    private readonly libernetixWebhooksService: LibernetixWebhooksService,
  ) {}

  @Post('libernetix')
  libernetixHandler(@Body() dto: any) {
    return this.libernetixWebhooksService.eventHandler(dto);
  }
}
