import { Injectable } from '@nestjs/common';
import { LibernetixWebhookType } from '@/modules/webhooks/libernetix/libernetix-webhooks.types';
import { OrdersService } from '@/modules/orders/orders.service';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

@Injectable()
export class LibernetixWebhooksService {
  constructor(
    @InjectPinoLogger(LibernetixWebhooksService.name)
    private readonly logger: PinoLogger,
    private readonly ordersService: OrdersService,
  ) {}

  async eventHandler(dto: { id: string; type: string; status: string }) {
    const type = `${dto.type}.${dto.status}` as LibernetixWebhookType;
    this.logger.info(
      { type, paymentId: dto.id },
      'Libernetix Webhook received',
    );
    this.logger.debug(dto, 'Libernetix Webhook full DTO');

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
