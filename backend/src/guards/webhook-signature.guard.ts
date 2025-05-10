import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import { readFile } from 'fs/promises';
import { join } from 'path';
import * as crypto from 'node:crypto';

@Injectable()
export class WebhookSignatureGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();

    const signature = req.headers['x-signature'] as string;
    const rawBody = req.body as Buffer;

    if (!signature || !rawBody) {
      throw new ForbiddenException('Missing signature or body');
    }

    const isValid = await this.verifySignature(rawBody, signature);

    if (!isValid) {
      throw new ForbiddenException('Invalid signature');
    }

    return true;
  }

  private async verifySignature(body: Buffer, signature: string) {
    const pathToKey = join(process.cwd(), 'src/keys/libernetix.pem');

    try {
      const publicKey = await readFile(pathToKey, 'utf8');

      const verifier = crypto.createVerify('sha256WithRSAEncryption');
      verifier.update(body);
      verifier.end();

      return verifier.verify(publicKey, signature, 'base64');
    } catch (e) {
      console.log(e); // TODO: Log error
    }
  }
}
