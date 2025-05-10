import { Injectable } from '@nestjs/common';
import { LibernetixWebhookType } from '@/modules/webhooks/libernetix/libernetix-webhooks.types';
import { OrdersService } from '@/modules/orders/orders.service';

@Injectable()
export class LibernetixWebhooksService {
  constructor(private readonly ordersService: OrdersService) {}

  async eventHandler(dto: { id: string; type: string; status: string }) {
    const type = `${dto.type}.${dto.status}` as LibernetixWebhookType;

    switch (type) {
      case LibernetixWebhookType.PAID:
        return this.paidHandler(dto);
      // TODO: add other events
    }
  }

  private async paidHandler(dto: { id: string }) {
    const order = this.ordersService.getOrderByPaymentId(dto.id);
    this.ordersService.confirmOrderById(order.id);
    return Promise.resolve(true);
  }
}
