import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
} from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      // Self check
      () => this.http.pingCheck('self', 'http://localhost:8080'), // TODO: use real url

      // Check Libernetix API
      () =>
        this.http.pingCheck('payment-api', 'https://gate.libernetix.com/api'),
    ]);
  }
}
