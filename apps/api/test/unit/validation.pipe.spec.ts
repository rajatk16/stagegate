import { IsString, MinLength } from 'class-validator';

import { ApiException } from '../../src/common/exceptions/api.exception';
import {
  createValidationPipe,
  flattenValidationErrors,
} from '../../src/common/validation/validation.pipe';

import type { ArgumentMetadata } from '@nestjs/common';
import type { ValidationError } from 'class-validator';

class TestDto {
  @IsString()
  @MinLength(3)
  name!: string;
}

const metadata: ArgumentMetadata = {
  type: 'body',
  metatype: TestDto,
};

describe('Validation infrastructure', () => {
  it('flattens field validation errors', () => {
    const errors: ValidationError[] = [
      {
        property: 'name',

        constraints: {
          minLength: 'Name is too short.',
        },
      },
    ];

    expect(flattenValidationErrors(errors)).toEqual([
      {
        field: 'name',
        messages: ['Name is too short.'],
      },
    ]);
  });

  it('flattens nested validation errors', () => {
    const errors: ValidationError[] = [
      {
        property: 'profile',

        children: [
          {
            property: 'name',

            constraints: {
              isString: 'Name must be a string.',
            },
          },
        ],
      },
    ];

    expect(flattenValidationErrors(errors)).toEqual([
      {
        field: 'profile.name',
        messages: ['Name must be a string.'],
      },
    ]);
  });

  it('returns an empty array for no errors', () => {
    expect(flattenValidationErrors([])).toEqual([]);
  });

  it('transforms valid input into a DTO', async () => {
    const pipe = createValidationPipe();

    const result: unknown = await pipe.transform(
      {
        name: 'StageGate',
      },
      metadata,
    );

    expect(result).toBeInstanceOf(TestDto);
  });

  it('rejects invalid DTO properties', async () => {
    const pipe = createValidationPipe();

    await expect(
      pipe.transform(
        {
          name: 'a',
        },
        metadata,
      ),
    ).rejects.toBeInstanceOf(ApiException);
  });

  it('rejects non-whitelisted properties', async () => {
    const pipe = createValidationPipe();

    await expect(
      pipe.transform(
        {
          name: 'StageGate',
          role: 'admin',
        },
        metadata,
      ),
    ).rejects.toMatchObject({
      code: 'VALIDATION_ERROR',
    });
  });

  it('does not implicitly convert DTO property types', async () => {
    const pipe = createValidationPipe();

    await expect(
      pipe.transform(
        {
          name: 123,
        },
        metadata,
      ),
    ).rejects.toMatchObject({
      code: 'VALIDATION_ERROR',
    });
  });
});
