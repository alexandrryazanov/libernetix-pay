import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IUser } from '@/types/models';

export const User = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    return (request?.user as IUser) || null;
  },
);
