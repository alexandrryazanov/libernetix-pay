import { Body, Controller, Ip, Post, Res, UseGuards } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreateIntentDto } from './dto/create-intent.dto';
import { User } from '@/decorators/user.decorator';
import { IUser } from '@/types/models';
import AuthGuard from '@/guards/auth.guard';
import { S2sPayDto } from '@/modules/payment/dto/s2s-pay.dto';
import { Response } from 'express';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('intent')
  @UseGuards(AuthGuard)
  async createIntent(@User() user: IUser, @Body() dto: CreateIntentDto) {
    return this.paymentService.createIntent(user.email, dto.orderId);
  }

  @Post('s2s')
  @UseGuards(AuthGuard)
  async payForOrderWithS2S(
    @Body() dto: S2sPayDto,
    @Ip() ip: string,
    @Res() res: Response,
  ) {
    const result = await this.paymentService.payForOrderWithS2S(dto, ip);
    if (result.status === '3DS_required') {
      res.setHeader('Content-Type', 'text/html');
      res.send(result.html);
      return;
    } else {
      return res.json(result);
    }
  }
}
