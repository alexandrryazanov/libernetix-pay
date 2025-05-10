import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app/app.module';
import { ValidationPipe } from '@nestjs/common';
import { raw } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use('/webhooks/libernetix', raw({ type: '*/*' })); // to get body buffer to verify
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
