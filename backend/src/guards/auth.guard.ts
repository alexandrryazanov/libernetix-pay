import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

// TODO: Now it is only a mock guard with test user. Here should be all auth logic.

@Injectable()
export default class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    request['user'] = { email: 'test@test.com' };

    return true;
  }
}
