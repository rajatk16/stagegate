import { ApiBearerAuth } from '@nestjs/swagger';
import { applyDecorators } from '@nestjs/common';

export function Authorized() {
  return applyDecorators(ApiBearerAuth('firebase-auth'));
}
