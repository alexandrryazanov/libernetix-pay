import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app/app.module';
import { ValidationPipe } from '@nestjs/common';
import { raw } from 'express';
import { Logger } from 'nestjs-pino';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));
  app.use('/webhooks/libernetix', raw({ type: '*/*' })); // to get body buffer to verify
  app.use(helmet());
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 100,
      message: 'Too many requests from this IP, please try again later.',
    }),
  );
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  await app.listen(process.env.PORT ?? 8080);
}
bootstrap();
