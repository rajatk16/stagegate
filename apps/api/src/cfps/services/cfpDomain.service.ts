import { Timestamp } from 'firebase-admin/firestore';
import { HttpStatus, Injectable } from '@nestjs/common';

import { Event, EventStatus } from '@/events';
import { ErrorCode, ApplicationException } from '@/common';

import { Cfp } from '../entities';
import { CfpStatus } from '../enums';

@Injectable()
export class CfpDomainService {
  assertValidConfiguration(cfp: Cfp): void {
    if (!cfp.title.trim()) {
      throw new ApplicationException(
        ErrorCode.VALIDATION_ERROR,
        HttpStatus.BAD_REQUEST,
        'CFP title is required',
      );
    }

    if (
      cfp.opensAt &&
      cfp.closesAt &&
      cfp.opensAt.toMillis() >= cfp.closesAt.toMillis()
    ) {
      throw new ApplicationException(
        ErrorCode.CFP_INVALID_SCHEDULE,
        HttpStatus.BAD_REQUEST,
        'CFP closing time must be after its opening time',
      );
    }

    if (cfp.maxSubmissionsPerSpeaker < 1) {
      throw new ApplicationException(
        ErrorCode.VALIDATION_ERROR,
        HttpStatus.BAD_REQUEST,
        'At least one submission per speaker must be permitted',
      );
    }

    if (cfp.maxSpeakersPerSubmission < 1) {
      throw new ApplicationException(
        ErrorCode.VALIDATION_ERROR,
        HttpStatus.BAD_REQUEST,
        'At least one speaker per submission must be permitted',
      );
    }

    this.assertValidTracks(cfp);
  }

  assertEditable(cfp: Cfp): void {
    if (cfp.status === CfpStatus.OPEN) {
      throw new ApplicationException(
        ErrorCode.CFP_INVALID_STATE_TRANSITION,
        HttpStatus.CONFLICT,
        'Close the CFP before changing its configuration',
      );
    }

    if (cfp.status === CfpStatus.CLOSED) {
      throw new ApplicationException(
        ErrorCode.CFP_INVALID_STATE_TRANSITION,
        HttpStatus.CONFLICT,
        'A closed CFP cannot be changed',
      );
    }
  }

  open(cfp: Cfp, event: Event, now: Timestamp): void {
    if (event.status !== EventStatus.PUBLISHED) {
      throw new ApplicationException(
        ErrorCode.EVENT_NOT_PUBLISHED,
        HttpStatus.CONFLICT,
        'Publish the event before opening its CFP',
      );
    }

    if (cfp.status === CfpStatus.OPEN) {
      throw new ApplicationException(
        ErrorCode.CFP_ALREADY_OPEN,
        HttpStatus.CONFLICT,
        'The CFP is already open',
      );
    }

    if (cfp.status === CfpStatus.CLOSED) {
      throw new ApplicationException(
        ErrorCode.CFP_INVALID_STATE_TRANSITION,
        HttpStatus.CONFLICT,
        'A closed CFP cannot be opened',
      );
    }

    this.assertValidConfiguration(cfp);

    if (cfp.opensAt && cfp.opensAt.toMillis() > now.toMillis()) {
      throw new ApplicationException(
        ErrorCode.CFP_INVALID_STATE_TRANSITION,
        HttpStatus.CONFLICT,
        'The configured opening time has not been reached',
      );
    }

    if (cfp.closesAt && cfp.closesAt.toMillis() <= now.toMillis()) {
      throw new ApplicationException(
        ErrorCode.CFP_INVALID_STATE_TRANSITION,
        HttpStatus.CONFLICT,
        'The configured closing time has already passed',
      );
    }

    cfp.status = CfpStatus.OPEN;
    cfp.openedAt = now;
    cfp.updatedAt = now;
  }

  close(cfp: Cfp, now: Timestamp): void {
    if (cfp.status !== CfpStatus.OPEN) {
      throw new ApplicationException(
        ErrorCode.CFP_NOT_OPEN,
        HttpStatus.CONFLICT,
        'Only an open CFP can be closed',
      );
    }

    cfp.status = CfpStatus.CLOSED;
    cfp.closedAt = now;
    cfp.updatedAt = now;
  }

  private assertValidTracks(cfp: Cfp): void {
    if (cfp.tracks.length > 20) {
      throw new ApplicationException(
        ErrorCode.VALIDATION_ERROR,
        HttpStatus.BAD_REQUEST,
        'A CFP cannot contain more than 20 tracks',
      );
    }

    const labels = new Set<string>();
    const displayOrders = new Set<number>();
    const ids = new Set<string>();

    for (const track of cfp.tracks) {
      const normalizedLabel = track.label.trim().toLocaleLowerCase();

      if (!track.id || !normalizedLabel) {
        throw new ApplicationException(
          ErrorCode.VALIDATION_ERROR,
          HttpStatus.BAD_REQUEST,
          'Each CFP track must have an ID and label',
        );
      }

      if (ids.has(track.id)) {
        throw new ApplicationException(
          ErrorCode.VALIDATION_ERROR,
          HttpStatus.BAD_REQUEST,
          'Each CFP track must have a unique ID',
        );
      }

      if (labels.has(normalizedLabel)) {
        throw new ApplicationException(
          ErrorCode.VALIDATION_ERROR,
          HttpStatus.BAD_REQUEST,
          'CFP track labels must be unique',
        );
      }

      if (!Number.isInteger(track.displayOrder) || track.displayOrder < 1) {
        throw new ApplicationException(
          ErrorCode.VALIDATION_ERROR,
          HttpStatus.BAD_REQUEST,
          'CFP track display orders must be positive integers',
        );
      }

      if (displayOrders.has(track.displayOrder)) {
        throw new ApplicationException(
          ErrorCode.VALIDATION_ERROR,
          HttpStatus.BAD_REQUEST,
          'CFP track display orders must be unique',
        );
      }

      ids.has(track.id);
      labels.add(normalizedLabel);
      displayOrders.add(track.displayOrder);
    }
  }
}
