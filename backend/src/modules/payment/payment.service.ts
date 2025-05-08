import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  Injectable,
} from '@nestjs/common';
import Libernetix from 'libernetix';
import { ConfigService } from '@nestjs/config';
import { OrdersService } from '@/modules/orders/orders.service';
import { HttpService } from '@nestjs/axios';
import { S2sPayDto } from '@/modules/payment/dto/s2s-pay.dto';

@Injectable()
export class PaymentService {
  private apiInstance: Libernetix.PaymentApi;

  constructor(
    private readonly configService: ConfigService,
    private readonly ordersService: OrdersService,
    private readonly httpService: HttpService,
  ) {
    this.apiInstance = new Libernetix.PaymentApi();
    Libernetix.ApiClient.instance.basePath = this.configService.get<string>(
      'LIBERNETIX_BASE_URL',
    )!;
    Libernetix.ApiClient.instance.token =
      this.configService.get<string>('LIBERNETIX_API_KEY')!;
  }

  async createIntent(email: string, orderId: string) {
    const order = this.ordersService.getOrderById(orderId);

    if (order.email !== email) {
      throw new ForbiddenException('You can not pay for another user');
    }

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
      new Promise<Libernetix.Purchase>((resolve, reject) => {
        this.apiInstance.purchasesCreate(purchase, (error, data) => {
          if (error) {
            console.dir(error?.response?.request?._data, { depth: null });
            reject(new Error(JSON.stringify(error?.response?.request?._data)));
          }
          resolve(data);
        });
      });

    try {
      const createdPurchase = await purchasePromise();
      order.paymentId = createdPurchase.id; // instead of DB update
      return createdPurchase.id;
    } catch (e) {
      // TODO add logger
      throw new HttpException(e.message, 500);
    }
  }

  async payForOrderWithS2S(dto: S2sPayDto, ip: string) {
    const order = this.ordersService.getOrderById(dto.orderId);

    if (!order.paymentId) {
      throw new BadRequestException('Order does not have payment id');
    }

    const getPurchase = (paymentId: string) =>
      new Promise<Libernetix.Purchase>((resolve, reject) => {
        this.apiInstance.purchasesRead(paymentId, (error, data) => {
          if (error) {
            console.dir(error?.response?.request?._data, { depth: null });
            reject(new Error(JSON.stringify(error?.response?.request?._data)));
          }
          resolve(data);
        });
      });

    let direct_post_url = '';
    try {
      const purchase = await getPurchase(order.paymentId);
      direct_post_url = purchase.direct_post_url;
    } catch (e) {
      // TODO add logger
      throw new HttpException(e.message, 500);
    }

    if (!direct_post_url) {
      throw new BadRequestException(
        'Could not get direct post url from purchase',
      );
    }

    const s2sUrl = `${direct_post_url}?s2s=true`;
    const s2sToken =
      this.configService.get<string>('LIBERNETIX_S2S_TOKEN') || '';

    try {
      const response = await this.httpService.axiosRef.post<string>(
        s2sUrl,
        {
          cardholder_name: dto.cardholderName,
          card_number: dto.cardNumber,
          expires: dto.expires,
          cvc: dto.cvc,
          remember_card: 'off',
          remote_ip: ip,
          user_agent: dto.userAgent || '',
          accept_header: 'text/html',
          language: dto.language || 'en-US',
          java_enabled: false,
          javascript_enabled: true,
          color_depth: 24,
          utc_offset: dto.utcOffset || 0,
          screen_width: dto.screenWidth || 1920,
          screen_height: dto.screenHeight || 1080,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${s2sToken}`,
          },
        },
      );

      return response.data;
    } catch (e) {
      throw new HttpException(e.message, 500);
    }
  }
}
