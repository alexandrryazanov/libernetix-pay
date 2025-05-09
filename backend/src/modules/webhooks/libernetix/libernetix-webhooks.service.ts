import { Injectable } from '@nestjs/common';
import { LibernetixWebhookType } from '@/modules/webhooks/libernetix/libernetix-webhooks.types';
import { OrdersService } from '@/modules/orders/orders.service';

@Injectable()
export class LibernetixWebhooksService {
  constructor(private readonly ordersService: OrdersService) {}

  eventHandler(dto: any) {
    console.log(dto);

    switch (dto.type) {
      case LibernetixWebhookType.CREATED:
        return this.createdHandler(dto);
      case LibernetixWebhookType.PAID:
        return this.paidHandler(dto);
    }
  }

  private async createdHandler(dto: any) {
    // TODO: implement
    return Promise.resolve(true);
  }

  private async paidHandler(dto: any) {
    this.ordersService.confirmOrderById(dto.metadata.orderId);
    return Promise.resolve(true);
  }
}
