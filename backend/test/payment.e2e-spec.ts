import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '@/modules/app/app.module';
import { OrdersService } from '@/modules/orders/orders.service';
import { HttpService } from '@nestjs/axios';
import { PaymentService } from '@/modules/payment/payment.service';
import { OrderStatus } from '@/modules/orders/orders.types';

describe('PaymentController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(OrdersService)
      .useValue({
        getOrderById: jest.fn().mockReturnValue({
          email: 'user@example.com',
          products: [{ name: 'Item 1', price: 100 }],
          paymentId: 'payment123',
          status: OrderStatus.CREATED,
        }),
        confirmOrderById: jest.fn(),
      })
      .overrideProvider(HttpService)
      .useValue({
        axiosRef: {
          post: jest.fn().mockResolvedValue({
            data: { status: 'success' },
          }),
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    const paymentService = app.get(PaymentService);
    (paymentService as any).apiInstance.purchasesRead = (
      id: string,
      callback: (err: any, data: any, response?: any) => void,
    ) => {
      callback(null, { direct_post_url: 'https://mocked.url' }, {});
    };
  });

  it('/payment/s2s (POST) should return success', async () => {
    const dto = {
      orderId: 'order123',
      cardholderName: 'John Doe',
      cardNumber: '4111111111111111',
      expires: '12/25',
      cvc: '123',
      language: 'en',
      utcOffset: 0,
      screenWidth: 1920,
      screenHeight: 1080,
    };

    const response = await request(app.getHttpServer())
      .post('/payment/s2s')
      .send(dto)
      .expect(HttpStatus.OK);

    expect(response.body).toEqual({ status: 'success', orderId: 'order123' });
  });

  afterAll(async () => {
    await app.close();
  });
});
