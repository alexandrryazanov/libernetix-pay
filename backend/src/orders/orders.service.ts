import { Injectable, NotFoundException } from '@nestjs/common';
import { Order } from '@/orders/orders.types';

// Mock service for test orders, that we can try to pay (in a real project we store and get it with a database)
export const orders: Record<string, Order> = {
  order1: {
    email: 'test@test.com',
    products: [{ name: 'Product 1', price: 100 }],
  },
  order2: {
    email: 'test@test.com',
    products: [
      { name: 'Product 1', price: 100 },
      { name: 'Product 2', price: 200 },
    ],
  },
};

@Injectable()
export class OrdersService {
  async getOrderById(orderId: string) {
    const order = orders[orderId];

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return Promise.resolve(orders[orderId]);
  }
}
