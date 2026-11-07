import { randomUUID } from 'node:crypto';
import { HttpStatus, Injectable } from '@nestjs/common';
import { FieldPath, Transaction } from 'firebase-admin/firestore';

import { EventScope } from '../types/eventScope.type';
import { EVENT_STATUS } from '../enums/eventStatus.enum';
import { EventAccessService } from './eventAccess.service';
import { ApiException } from '../../common/exceptions/api.exception';
import { AuditWriter } from '../../audit/services/auditWriter.service';
import { ServerClock } from '../../common/services/serverClock.service';
import { FirebaseService } from '../../firebase/services/firebase.service';
import { EventConfigurationRepository } from '../repositories/eventConfiguration.repository';
import {
  ListEventConfigurationDto,
  CreateEventConfigurationDto,
  UpdateEventConfigurationDto,
} from '../dtos/eventConfiguration.dto';
import {
  configurationInvalid,
  toConfigurationResponse,
  assertConfigurationDeleteable,
  assertConfigurationUpdateAllowed,
} from '../utils/eventConfiguration.util';
import {
  EventConfiguration,
  eventConfigurationSchema,
  createEventConfigurationSchema,
  updateEventConfigurationSchema,
} from '../models/eventConfiguration.model';

@Injectable()
export class EventConfigurationService {
  constructor(
    private readonly serverClock: ServerClock,
    private readonly auditWriter: AuditWriter,
    private readonly firebaseService: FirebaseService,
    private readonly eventAccessService: EventAccessService,
    private readonly eventConfigurationRepository: EventConfigurationRepository,
  ) {}

  async list(identity: EventScope, input: ListEventConfigurationDto) {
    return this.firebaseService.firestore.runTransaction(
      async (transaction) => {
        const scope = await this.eventAccessService.requireInTransaction(
          transaction,
          identity,
          ['event:read'],
        );

        let query = this.eventConfigurationRepository
          .collection(scope)
          .orderBy('sortOrder', 'asc')
          .orderBy(FieldPath.documentId(), 'asc');

        if (input.cursor !== undefined) {
          const anchor = await transaction.get(
            this.eventConfigurationRepository.reference(scope, input.cursor),
          );

          if (!anchor.data()) {
            throw new ApiException(
              HttpStatus.BAD_REQUEST,
              'EVENT_CONFIGURATION_CURSOR_INVALID',
              'Reload, configuration from the first page.',
            );
          }

          query = query.startAfter(anchor);
        }

        const snapshot = await transaction.get(query.limit(input.limit + 1));

        const documents = snapshot.docs.slice(0, input.limit);

        return {
          items: documents.map((document) =>
            toConfigurationResponse(document.data()),
          ),
          nextCursor:
            snapshot.docs.length > input.limit
              ? (documents.at(-1)?.id ?? null)
              : null,
        };
      },
    );
  }

  async create(identity: EventScope, input: CreateEventConfigurationDto) {
    const parsed = createEventConfigurationSchema.safeParse(input);

    if (!parsed.success) throw configurationInvalid();

    const id = randomUUID();

    return this.firebaseService.firestore.runTransaction(
      async (transaction) => {
        const scope = await this.eventAccessService.requireInTransaction(
          transaction,
          identity,
          ['event:update'],
        );

        this.assertEditable(scope);

        const now = this.serverClock.now();

        const candidate = eventConfigurationSchema.safeParse({
          ...parsed.data,
          id,
          organizationId: scope.organizationId,
          eventId: scope.eventId,
          everReferenced: false,
          createdByUid: scope.actorUid,
          createdAt: now,
          updatedAt: now,
        });

        if (!candidate.success) throw configurationInvalid();

        const record = candidate.data;

        transaction.create(
          this.eventConfigurationRepository.reference(scope, id),
          record,
        );

        this.appendAudit(transaction, scope, record, 'created', now);

        return toConfigurationResponse(record);
      },
    );
  }

  async update(
    identity: EventScope,
    id: string,
    input: UpdateEventConfigurationDto,
  ) {
    const changes = Object.fromEntries(
      Object.entries(input).filter(([, value]) => value !== undefined),
    );

    const parsed = updateEventConfigurationSchema.safeParse(changes);

    if (!parsed.success || Object.keys(parsed.data).length === 0) {
      throw configurationInvalid();
    }

    return this.firebaseService.firestore.runTransaction(
      async (transaction) => {
        const scope = await this.eventAccessService.requireInTransaction(
          transaction,
          identity,
          ['event:update'],
        );

        this.assertEditable(scope);

        const reference = this.eventConfigurationRepository.reference(
          scope,
          id,
        );

        const snapshot = await transaction.get(reference);

        const current = snapshot.data();

        if (!current) throw this.notFound();

        const candidate = eventConfigurationSchema.safeParse({
          ...current,
          ...parsed.data,
        });

        if (!candidate.success) throw configurationInvalid();

        const next = candidate.data;

        assertConfigurationUpdateAllowed(current, next);

        if (
          current.name === next.name &&
          current.description === next.description &&
          current.durationMinutes === next.durationMinutes &&
          current.isActive === next.isActive &&
          current.sortOrder === next.sortOrder
        ) {
          return toConfigurationResponse(current);
        }

        const now = this.serverClock.now();

        const updated = eventConfigurationSchema.parse({
          ...next,
          updatedAt: now,
        });

        transaction.set(reference, updated);

        this.appendAudit(transaction, scope, updated, 'updated', now);

        return toConfigurationResponse(updated);
      },
    );
  }

  async remove(identity: EventScope, id: string): Promise<void> {
    await this.firebaseService.firestore.runTransaction(async (transaction) => {
      const scope = await this.eventAccessService.requireInTransaction(
        transaction,
        identity,
        ['event:update'],
      );

      this.assertEditable(scope);

      const reference = this.eventConfigurationRepository.reference(scope, id);
      const snapshot = await transaction.get(reference);
      const current = snapshot.data();

      if (!current) throw this.notFound();

      assertConfigurationDeleteable(current);

      const now = this.serverClock.now();

      transaction.delete(reference);

      this.appendAudit(transaction, scope, current, 'deleted', now);
    });
  }

  private assertEditable(scope: EventScope): void {
    if (scope.event.status === EVENT_STATUS.ARCHIVED) {
      throw new ApiException(
        HttpStatus.CONFLICT,
        'EVENT_ARCHIVED',
        'Archived event configuration cannot be changed.',
      );
    }
  }

  private appendAudit(
    transaction: Transaction,
    scope: EventScope,
    record: EventConfiguration,
    operation: 'created' | 'updated' | 'deleted',
    now: Date,
  ): void {
    this.auditWriter.append(
      transaction,
      this.auditWriter.prepareEventConfigurationChanged({
        actorUid: scope.actorUid,
        organizationId: scope.organizationId,
        targetEventId: scope.eventId,
        configurationId: record.id,
        configurationKind: record.kind,
        operation,
        occurredAt: now,
      }),
    );
  }

  private notFound(): ApiException {
    return new ApiException(
      HttpStatus.NOT_FOUND,
      'EVENT_CONFIGURATION_NOT_FOUND',
      'Configuration record not found.',
    );
  }
}
