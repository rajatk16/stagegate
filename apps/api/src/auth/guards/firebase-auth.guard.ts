import { Request } from 'express';
import * as admin from 'firebase-admin';
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

import { FirebaseService } from '@/firebase/firebase.service';

declare module 'express' {
  interface Request {
    user?: admin.auth.DecodedIdToken;
  }
}

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(private readonly firebaseService: FirebaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Unauthorized');
    }

    const token = authHeader.replace('Bearer ', '');
    try {
      const decodedToken = await this.firebaseService.auth.verifyIdToken(token);

      request.user = decodedToken;

      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
