import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import Libernetix from 'libernetix';
import { ConfigService } from '@nestjs/config';
import { OrdersService } from '@/modules/orders/orders.service';
import { HttpService } from '@nestjs/axios';
import { S2sPayDto } from '@/modules/payment/dto/s2s-pay.dto';
import { ResponseWith3DS, ResponseWithout3DS } from './payment.types';
import { promisify } from '@/utils/transform';
import { generate3dsHtml } from './payment.utils';

@Injectable()
export class PaymentService {
  private readonly apiInstance: Libernetix.PaymentApi;

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
    purchase.success_redirect = 'https://test.com'; // not used for S2S
    purchase.failure_redirect = 'https://test.com'; // not used for S2S
    purchase.brand_id = this.configService.get<string>('LIBERNETIX_BRAND_ID')!;
    purchase.client = new Libernetix.ClientDetails(email);
    purchase.purchase = new Libernetix.PurchaseDetails(
      order.products.map(
        (product) => new Libernetix.Product(product.name, product.price),
      ),
    );
    purchase.purchase.currency = 'USD';
    purchase.purchase.notes = JSON.stringify({ orderId });

    const createPurchase = promisify<
      Libernetix.Purchase,
      [Libernetix.Purchase]
    >(this.apiInstance.purchasesCreate.bind(this.apiInstance));

    try {
      const createdPurchase = await createPurchase(purchase);
      order.paymentId = createdPurchase.id; // instead of DB update
      return { paymentId: createdPurchase.id, orderId };
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

    const getPurchase = promisify<Libernetix.Purchase, [string]>(
      this.apiInstance.purchasesRead.bind(this.apiInstance),
    );

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
      // Could not find some pay method in the Libernetix library, so use a simple http request
      const response = await this.httpService.axiosRef.post<
        ResponseWith3DS | ResponseWithout3DS
      >(
        s2sUrl,
        {
          cardholder_name: dto.cardholderName,
          card_number: dto.cardNumber,
          expires: dto.expires,
          cvc: dto.cvc,
          remember_card: 'off',
          remote_ip: ip,
          language: dto.language,
          java_enabled: false,
          javascript_enabled: true,
          utc_offset: dto.utcOffset,
          screen_width: dto.screenWidth,
          screen_height: dto.screenHeight,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${s2sToken}`,
          },
        },
      );

      if (response.data.status === '3DS_required') {
        const { URL, PaReq, MD, callback_url } = response.data;
        const html = generate3dsHtml(
          URL,
          PaReq,
          MD,
          dto.callbackUrl || callback_url,
        );
        return { status: '3DS_required', html };
      }

      this.ordersService.confirmOrderById(dto.orderId);

      return { status: 'success', orderId: dto.orderId };
    } catch (e) {
      console.log(e.response.data);
      throw new HttpException('Payment failed', HttpStatus.PAYMENT_REQUIRED);
    }
  }
}
