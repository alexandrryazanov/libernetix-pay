import { Test, TestingModule } from '@nestjs/testing';
import { PaymentService } from './payment.service';
import { ConfigService } from '@nestjs/config';
import { OrdersService } from '../orders/orders.service';
import { HttpService } from '@nestjs/axios';
import { ForbiddenException } from '@nestjs/common';
import { Order, OrderStatus } from '@/modules/orders/orders.types';
import Libernetix from 'libernetix';
import { getLoggerToken } from 'nestjs-pino';

describe('PaymentService', () => {
  let service: PaymentService;
  let ordersService: OrdersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test-value'),
          },
        },
        {
          provide: OrdersService,
          useValue: {
            getOrderById: jest.fn((id) => ({
              id,
              email: 'user@example.com',
              products: [{ name: 'Item 1', price: 100 }],
              paymentId: '',
              status: OrderStatus.CREATED,
            })),
            confirmOrderById: jest.fn(),
          },
        },
        {
          provide: HttpService,
          useValue: {
            axiosRef: {
              post: jest.fn().mockResolvedValue({
                data: { status: 'success' },
              }),
            },
          },
        },
        {
          provide: getLoggerToken(PaymentService.name),
          useValue: {
            info: jest.fn(),
            error: jest.fn(),
            debug: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
    ordersService = module.get<OrdersService>(OrdersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw ForbiddenException if email does not match', async () => {
    jest.spyOn(ordersService, 'getOrderById').mockReturnValueOnce({
      email: 'someone@else.com',
      products: [],
      paymentId: '',
      status: OrderStatus.CREATED,
    });

    await expect(
      service.createIntent('wrong@example.com', 'order123'),
    ).rejects.toThrow(ForbiddenException);
  });

  it('should create a purchase if email matches', async () => {
    const mockOrder: Order = {
      email: 'user@example.com',
      products: [{ name: 'Item 1', price: 100 }],
      paymentId: '',
      status: OrderStatus.CREATED,
    };
    jest.spyOn(ordersService, 'getOrderById').mockReturnValueOnce(mockOrder);

    service['apiInstance'].purchasesCreate = (
      purchase,
      callback: Libernetix.Callback<Libernetix.Purchase>,
    ) => callback(null, { id: 'purchase123' } as Libernetix.Purchase, 'POST');

    const result = await service.createIntent('user@example.com', 'order123');

    expect(result).toEqual({
      paymentId: 'purchase123',
      orderId: 'order123',
    });
  });

  it('should confirm order and return success if S2S payment passed', async () => {
    const mockOrder: Order = {
      email: 'user@example.com',
      products: [{ name: 'Item 1', price: 100 }],
      paymentId: 'purchase123',
      status: OrderStatus.CREATED,
    };
    jest.spyOn(ordersService, 'getOrderById').mockReturnValueOnce(mockOrder);

    service['apiInstance'].purchasesRead = (
      id: string,
      callback: Libernetix.Callback<Libernetix.Purchase>,
    ) =>
      callback(
        null,
        {
          direct_post_url: 'https://pay.example.com',
        } as Libernetix.Purchase,
        'post',
      );

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

    const axiosPost = jest
      .spyOn(service['httpService'].axiosRef, 'post')
      .mockResolvedValueOnce({ data: { status: 'success' } });

    const confirmSpy = jest.spyOn(ordersService, 'confirmOrderById');

    const result = await service.payForOrderWithS2S(dto as any, '127.0.0.1');

    expect(result).toEqual({ status: 'success', orderId: 'order123' });
    expect(axiosPost).toHaveBeenCalled();
    expect(confirmSpy).toHaveBeenCalledWith('order123');
  });
});
