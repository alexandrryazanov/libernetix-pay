import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreateIntentDto } from './dto/create-intent.dto';
import { User } from '@/decorators/user.decorator';
import { IUser } from '@/types/models';
import AuthGuard from '@/guards/auth.guard';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('intent')
  @UseGuards(AuthGuard)
  createIntent(@User() user: IUser, @Body() dto: CreateIntentDto) {
    return this.paymentService.createIntent(user.email, dto.orderId);
  }
}
