import { Timestamp } from 'firebase-admin/firestore';
import { HttpStatus, Injectable } from '@nestjs/common';

import { ErrorCode, ApplicationException } from '@/common';

import { Event } from '../entities';
import { EventStatus } from '../enums';

@Injectable()
export class EventsDomainService {
  assertValidSchedule(event: Event) {
    if (!event.startsAt && event.endsAt) {
      throw new ApplicationException(
        ErrorCode.VALIDATION_ERROR,
        HttpStatus.BAD_REQUEST,
        'Event schedule is invalid',
      );
    }

    if (!event.endsAt && event.startsAt) {
      throw new ApplicationException(
        ErrorCode.VALIDATION_ERROR,
        HttpStatus.BAD_REQUEST,
        'Event schedule is invalid',
      );
    }

    if (
      event.startsAt &&
      event.endsAt &&
      event.startsAt.toMillis() > event.endsAt.toMillis()
    ) {
      throw new ApplicationException(
        ErrorCode.VALIDATION_ERROR,
        HttpStatus.BAD_REQUEST,
        'Event schedule is invalid',
      );
    }
  }

  assertEditable(event: Event) {
    if (event.status === EventStatus.ARCHIVED) {
      throw new ApplicationException(
        ErrorCode.EVENT_ARCHIVED,
        HttpStatus.CONFLICT,
        'Event is archived and read-only',
      );
    }
  }

  archive(event: Event) {
    if (event.status === EventStatus.ARCHIVED) {
      throw new ApplicationException(
        ErrorCode.EVENT_ARCHIVED,
        HttpStatus.CONFLICT,
        'Event is already archived',
      );
    }

    event.status = EventStatus.ARCHIVED;
    event.archivedAt = Timestamp.now();
    event.updatedAt = Timestamp.now();
  }

  publish(event: Event) {
    if (event.status === EventStatus.ARCHIVED) {
      throw new ApplicationException(
        ErrorCode.EVENT_ARCHIVED,
        HttpStatus.CONFLICT,
        'Event is archived and cannot be published',
      );
    }

    if (event.status === EventStatus.PUBLISHED) {
      return; // idempotent publish operation
    }

    event.status = EventStatus.PUBLISHED;
    event.publishedAt = Timestamp.now();
    event.updatedAt = Timestamp.now();
  }
}
