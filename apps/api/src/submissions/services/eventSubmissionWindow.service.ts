import { Injectable } from '@nestjs/common';
import { Transaction } from 'firebase-admin/firestore';

import { EventScope } from '../../events/types/eventScope.type';
import { EventIdentity } from '../../events/models/eventIdentity.model';
import { ServerClock } from '../../common/services/serverClock.service';
import { FirebaseService } from '../../firebase/services/firebase.service';
import { SubmissionWindowState } from '../enums/submissionWindowState.enum';
import { EventAccessService } from '../../events/services/eventAccess.service';
import { SubmissionWindowResponseDto } from '../dtos/submissionWindowResponse.dto';
import {
  getSubmissionWindowState,
  assertSubmissionWindowOpen,
} from '../utils/submissionWindow.util';

@Injectable()
export class EventSubmissionWindowService {
  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly eventAccessService: EventAccessService,
    private readonly serverClock: ServerClock,
  ) {}

  async current(identity: EventIdentity): Promise<SubmissionWindowResponseDto> {
    return this.firebaseService.firestore.runTransaction(
      async (transaction) => {
        const scope = await this.eventAccessService.requireInTransaction(
          transaction,
          identity,
          ['event:read'],
        );

        const now = this.serverClock.now();

        const state = getSubmissionWindowState(scope.event, now);

        return {
          organizationId: scope.organizationId,
          eventId: scope.eventId,
          serverTime: now.toISOString(),
          submissionOpensAt:
            scope.event.submissionOpensAt?.toISOString() ?? null,
          submissionClosesAt:
            scope.event.submissionClosesAt?.toISOString() ?? null,
          state,
          acceptingSubmissions: state === SubmissionWindowState.OPEN,
        };
      },
    );
  }

  async requireOpenInTransaction(
    transaction: Transaction,
    identity: EventIdentity,
  ): Promise<{ scope: EventScope; now: Date }> {
    const scope = await this.eventAccessService.requireInTransaction(
      transaction,
      identity,
      ['event:read'],
    );

    const now = this.serverClock.now();

    assertSubmissionWindowOpen(scope.event, now);

    return {
      scope,
      now,
    };
  }
}
