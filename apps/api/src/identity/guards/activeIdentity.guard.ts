import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

import { IdentityService } from '../services/identity.service';
import { ActiveIdentityRequest } from '../types/activeIdentityRequest.type';

@Injectable()
export class ActiveIdentityGuard implements CanActivate {
  constructor(private readonly identities: IdentityService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<ActiveIdentityRequest>();
    const { userId } = await this.identities.getActive(
      request.firebaseIdentity,
    );
    request.stageGateUserId = userId;
    return true;
  }
}
