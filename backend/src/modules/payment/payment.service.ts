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
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

@Injectable()
export class PaymentService {
  private readonly apiInstance: Libernetix.PaymentApi;

  constructor(
    @InjectPinoLogger(PaymentService.name)
    private readonly logger: PinoLogger,
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

    this.logger.info({ email, orderId }, 'Creating purchase');
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

    this.logger.debug({ purchase }, 'Purchase prepared');

    const createPurchase = promisify<
      Libernetix.Purchase,
      [Libernetix.Purchase]
    >(this.apiInstance.purchasesCreate.bind(this.apiInstance));

    try {
      const createdPurchase = await createPurchase(purchase);
      this.logger.info(
        {
          orderId,
          email,
          paymentId: createdPurchase.id,
        },
        'Purchase has been created',
      );

      order.paymentId = createdPurchase.id; // instead of DB update
      return { paymentId: createdPurchase.id, orderId };
    } catch (err) {
      this.logger.error(
        { orderId, email, err },
        'Error while creating purchase',
      );
      throw new HttpException(err.message, 500);
    }
  }

  async payForOrderWithS2S(dto: S2sPayDto, ip: string) {
    this.logger.info(
      { orderId: dto.orderId, ip },
      'Init S2S payment for order',
    );
    const order = this.ordersService.getOrderById(dto.orderId);

    if (!order.paymentId) {
      throw new BadRequestException('Order does not have payment id');
    }

    const getPurchase = promisify<Libernetix.Purchase, [string]>(
      this.apiInstance.purchasesRead.bind(this.apiInstance),
    );

    let direct_post_url = '';
    try {
      this.logger.info(
        { paymentId: order.paymentId, orderId: dto.orderId },
        'Getting purchase',
      );
      const purchase = await getPurchase(order.paymentId);
      direct_post_url = purchase.direct_post_url;
    } catch (err) {
      this.logger.error(
        { orderId: dto.orderId, err },
        'Error while getting purchase',
      );
      throw new BadRequestException(
        `Could not get purchase from Libernetix for order ${dto.orderId}`,
      );
    }

    if (!direct_post_url) {
      throw new BadRequestException(
        'Could not get direct post url from purchase',
      );
    }

    const s2sUrl = `${direct_post_url}?s2s=true`;
    const s2sToken =
      this.configService.get<string>('LIBERNETIX_S2S_TOKEN') || '';

    this.logger.debug(dto, 'Sending S2S request to Libernetix');

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
        this.logger.info(
          { orderId: dto.orderId },
          '3ds required, generating html',
        );
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
      this.logger.info(
        { orderId: dto.orderId },
        'Payment successful, order confirmed and returned to user',
      );

      return { status: 'success', orderId: dto.orderId };
    } catch (err) {
      this.logger.error(
        { orderId: dto.orderId, err: err.response.data },
        'Error while paying for order with S2S',
      );
      throw new HttpException('Payment failed', HttpStatus.PAYMENT_REQUIRED);
    }
  }
}
