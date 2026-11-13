import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';

import { ApiSuccessResponseDto } from '../dtos/apiResponse.dto';

import type { Type } from '@nestjs/common';

interface ApiEnvelopeOptions {
  status?: number;
  description?: string;
  isArray?: boolean;
}

export const ApiEnvelope = <T>(model: Type<T>, options: ApiEnvelopeOptions = {}) => {
  const modelReference = {
    $ref: getSchemaPath(model),
  };

  return applyDecorators(
    ApiExtraModels(ApiSuccessResponseDto, model),
    ApiResponse({
      status: options.status ?? HttpStatus.OK,
      description: options.description ?? 'Successful response',
      schema: {
        allOf: [
          {
            $ref: getSchemaPath(ApiSuccessResponseDto),
          },
          {
            type: 'object',
            required: ['data'],
            properties: {
              data:
                options.isArray === true
                  ? {
                      type: 'array',
                      items: modelReference,
                    }
                  : modelReference,
            },
          },
        ],
      },
    }),
  );
};
