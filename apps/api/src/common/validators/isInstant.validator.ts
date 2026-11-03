import { ValidateBy, ValidationOptions } from 'class-validator';
import { apiInstantSchema } from '../models/instant.model';

export const IsInstant = (options?: ValidationOptions): PropertyDecorator =>
  ValidateBy(
    {
      name: 'isInstant',
      validator: {
        validate: (value: unknown) => apiInstantSchema.safeParse(value).success,
        defaultMessage: () =>
          '$property must be an ISO timestamp with a timezone and at most three fractional-second digits.',
      },
    },
    options,
  );
