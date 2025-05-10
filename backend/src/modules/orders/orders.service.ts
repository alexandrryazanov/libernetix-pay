import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Order, OrderStatus } from '@/modules/orders/orders.types';

// Mock service for test orders, that we can try to pay (in a real project we store and get it with a database)
const orders: Record<string, Order> = {
  order1: {
    email: 'test@test.com',
    products: [{ name: 'Product 1', price: 100 }],
    paymentId: null,
    status: OrderStatus.CREATED,
  },
  order2: {
    email: 'test@test.com',
    products: [
      { name: 'Product 1', price: 100 },
      { name: 'Product 2', price: 200 },
    ],
    paymentId: null,
    status: OrderStatus.CREATED,
  },
};

@Injectable()
export class OrdersService {
  getAll(email: string) {
    const userOrders = Object.entries(orders).filter(
      ([, order]) => order.email === email,
    );
    return userOrders.map(([id, order]) => ({ ...order, id }));
  }

  getOrderById(orderId: string, ownerEmail?: string) {
    const order = orders[orderId];

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (ownerEmail && order.email !== ownerEmail) {
      throw new ForbiddenException('You are not allowed to access this order');
    }

    return orders[orderId];
  }

  getOrderByPaymentId(paymentId: string) {
    const orderEntry = Object.entries(orders).find(
      ([, order]) => order.paymentId === paymentId,
    );

    if (!orderEntry) {
      throw new NotFoundException('Order not found');
    }

    return { id: orderEntry[0], ...orderEntry[1] };
  }

  confirmOrderById(orderId: string) {
    const order = orders[orderId];

    if (order.status !== OrderStatus.FINISHED) {
      // TODO: do something on confirm order and handle errors during confirmation
      order.status = OrderStatus.FINISHED;
    }

    return order;
  }
}
