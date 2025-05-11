import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { PaymentModule } from '@/modules/payment/payment.module';
import { OrdersModule } from '@/modules/orders/orders.module';
import { WebhooksModule } from '@/modules/webhooks/webhooks.module';
import { LoggerModule } from 'nestjs-pino';
import { HealthModule } from '@/modules/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    PaymentModule,
    OrdersModule,
    WebhooksModule,
    HealthModule,
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.NODE_ENV !== 'production' ? 'debug' : 'info',
        transport:
          process.env.NODE_ENV !== 'production'
            ? {
                target: 'pino-pretty',
                options: { translateTime: true, colorize: true },
              }
            : undefined,
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
