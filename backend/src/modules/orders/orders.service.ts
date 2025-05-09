import { Injectable, NotFoundException } from '@nestjs/common';
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
  getOrderById(orderId: string) {
    const order = orders[orderId];

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return orders[orderId];
  }

  confirmOrderById(orderId: string) {
    const order = orders[orderId];

    // TODO: do something on confirm order and handle errors during confirmation

    order.status = OrderStatus.FINISHED;
    return order;
  }
}
