import { SetMetadata } from '@nestjs/common';
import { USER_WRITE_THROTTLE_KEY } from '../constants';

export const ThrottleUserWrites = (): MethodDecorator =>
  SetMetadata(USER_WRITE_THROTTLE_KEY, true);
