import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

// TODO: Now it is only a mock guard with test user. Here should be all auth logic.

@Injectable()
export default class AuthGuard implements CanActivate {
  constructor(
    @InjectPinoLogger(AuthGuard.name)
    private readonly logger: PinoLogger,
  ) {}

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    request['user'] = { email: 'test@test.com' };

    this.logger.info({ user: request.user }, 'User authenticated');

    return true;
  }
}
