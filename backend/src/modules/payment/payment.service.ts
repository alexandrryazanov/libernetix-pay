import { ForbiddenException, HttpException, Injectable } from '@nestjs/common';
import Libernetix from 'libernetix';
import { ConfigService } from '@nestjs/config';
import { OrdersService } from '@/orders/orders.service';

@Injectable()
export class PaymentService {
  constructor(
    private readonly configService: ConfigService,
    private readonly ordersService: OrdersService,
  ) {}

  async createIntent(email: string, orderId: string) {
    const order = await this.ordersService.getOrderById(orderId);

    if (order.email !== email) {
      throw new ForbiddenException('You can not pay for another user');
    }

    Libernetix.ApiClient.instance.basePath = this.configService.get<string>(
      'LIBERNETIX_BASE_URL',
    )!;
    Libernetix.ApiClient.instance.token =
      this.configService.get<string>('LIBERNETIX_API_KEY')!;

    const apiInstance = new Libernetix.PaymentApi();
    const purchase = new Libernetix.Purchase();
    purchase.success_redirect = 'https://test.com'; // is not used for S2S
    purchase.failure_redirect = 'https://test.com'; // is not used for S2S
    purchase.brand_id = this.configService.get<string>('LIBERNETIX_BRAND_ID')!;
    purchase.client = new Libernetix.ClientDetails(email);
    purchase.purchase = new Libernetix.PurchaseDetails(
      order.products.map(
        (product) => new Libernetix.Product(product.name, product.price),
      ),
    );

    const purchasePromise = () =>
      new Promise((resolve, reject) => {
        apiInstance.purchasesCreate(purchase, (error, data) => {
          if (error) {
            console.dir(error?.response?.request?._data, { depth: null });
            reject(new Error(JSON.stringify(error?.response?.request?._data)));
          }
          resolve(data);
        });
      });

    try {
      return await purchasePromise();
    } catch (e) {
      // TODO add logger
      throw new HttpException(e.message, 500);
    }
  }
}
