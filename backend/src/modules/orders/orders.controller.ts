import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { OrdersService } from '@/modules/orders/orders.service';
import AuthGuard from '@/guards/auth.guard';
import { User } from '@/decorators/user.decorator';
import { IUser } from '@/types/models';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @UseGuards(AuthGuard)
  getAll(@User() user: IUser) {
    return this.ordersService.getAll(user.email);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  getOrderById(@Param() { id }: { id: string }, @User() user: IUser) {
    return this.ordersService.getOrderById(id, user.email);
  }
}
