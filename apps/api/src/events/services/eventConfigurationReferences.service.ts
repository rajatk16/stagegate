import { Transaction } from 'firebase-admin/firestore';
import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';

import { EVENT_STATUS } from '../enums/eventStatus.enum';
import { EventAccessService } from './eventAccess.service';
import { EventIdentity } from '../models/eventIdentity.model';
import { instantSchema } from '../../common/models/instant.model';
import { ApiException } from '../../common/exceptions/api.exception';
import { configurationInvalid } from '../utils/eventConfiguration.util';
import { EVENT_CONFIGURATION_KIND } from '../enums/eventConfigurationKind.enum';
import { EventConfigurationRepository } from '../repositories/eventConfiguration.repository';
import {
  eventConfigurationSchema,
  SubmissionConfigurationSelection,
  submissionConfigurationSelectionSchema,
} from '../models/eventConfiguration.model';

@Injectable()
export class EventConfigurationReferencesService {
  constructor(
    private readonly eventAccessService: EventAccessService,
    private readonly eventConfigurationRepository: EventConfigurationRepository,
  ) {}

  async prepareInTransaction(
    transaction: Transaction,
    identity: EventIdentity,
    rawSelection: unknown,
    previous?: SubmissionConfigurationSelection,
  ) {
    const parsed =
      submissionConfigurationSelectionSchema.safeParse(rawSelection);

    if (!parsed.success) throw configurationInvalid();

    const scope = await this.eventAccessService.requireInTransaction(
      transaction,
      identity,
      ['event:read'],
    );

    if (scope.event.status === EVENT_STATUS.ARCHIVED) {
      throw new ApiException(
        HttpStatus.CONFLICT,
        'EVENT_ARCHIVED',
        'Archived events cannot accept submission changes.',
      );
    }

    const selection = parsed.data;

    const kinds = [
      ['trackId', EVENT_CONFIGURATION_KIND.TRACK],
      ['sessionTypeId', EVENT_CONFIGURATION_KIND.SESSION_TYPE],
      ['audienceLevelId', EVENT_CONFIGURATION_KIND.AUDIENCE_LEVEL],
    ] as const;

    const entries = await Promise.all(
      kinds.map(async ([field, kind]) => {
        const id = selection[field];

        if (id === null) return null;

        const reference = this.eventConfigurationRepository.reference(
          scope,
          id,
        );
        const snapshot = await transaction.get(reference);
        const record = snapshot.data();

        if (!record || record.kind !== kind) {
          throw new ApiException(
            HttpStatus.BAD_REQUEST,
            'SUBMISSION_CONFIGURATION_INVALID',
            'Select configuration values belonging to this event and matching each field.',
          );
        }

        if (!record.isActive && previous?.[field] !== id) {
          throw new ApiException(
            HttpStatus.CONFLICT,
            'SUBMISSION_CONFIGURATION_RETIRED',
            'This configuration value is no longer available for new selections.',
          );
        }

        return {
          reference,
          record,
        };
      }),
    );

    let applied = false;

    return {
      selection: { ...selection },
      apply: (now: Date): void => {
        if (applied) {
          throw new InternalServerErrorException(
            'Configuration references were already applied',
          );
        }

        instantSchema.parse(now);
        applied = true;

        for (const entry of entries) {
          if (entry === null || entry.record.everReferenced) {
            continue;
          }

          transaction.set(
            entry.reference,
            eventConfigurationSchema.parse({
              ...entry.record,
              everReferenced: true,
              updatedAt: now,
            }),
          );
        }
      },
    };
  }
}
