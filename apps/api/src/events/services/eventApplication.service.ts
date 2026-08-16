import { Timestamp } from 'firebase-admin/firestore';
import { HttpStatus, Injectable } from '@nestjs/common';

import { EventRole } from '@/auth';
import { UserRepository } from '@/users';
import { FirebaseService } from '@/firebase';
import { ApplicationException, ErrorCode, normalizeSlug } from '@/common';
import {
  Organization,
  OrganizationMembershipService,
  OrganizationLifecyclePolicyService,
} from '@/organizations';

import { EventMembershipStatus } from '../enums';
import { EventsService } from './events.service';
import { Event, EventMembership } from '../entities';
import { EventMapper, EventMemberMapper } from '../mappers';
import { EventsDomainService } from './eventsDomain.service';
import { EventMembershipPolicyService } from './eventMembershipPolicy.service';
import {
  createEventFactory,
  createEventSlugFactory,
  createEventMembershipFactory,
} from '../factories';
import {
  EventRepository,
  EventListOptions,
  EventSlugRepository,
  EventMembershipRepository,
} from '../repositories';
import {
  CreateEventDto,
  EventMemberDto,
  UpdateEventDto,
  EventListResponseDto,
  CreateEventMemberDto,
  UpdateEventMemberDto,
} from '../dtos';

@Injectable()
export class EventApplicationService {
  constructor(
    private readonly eventsService: EventsService,
    private readonly userRepository: UserRepository,
    private readonly firebaseService: FirebaseService,
    private readonly eventRepository: EventRepository,
    private readonly eventSlugRepository: EventSlugRepository,
    private readonly eventsDomainService: EventsDomainService,
    private readonly eventMembershipRepository: EventMembershipRepository,
    private readonly eventMembershipPolicyService: EventMembershipPolicyService,
    private readonly organizationMembershipService: OrganizationMembershipService,
    private readonly organizationLifecyclePolicyService: OrganizationLifecyclePolicyService,
  ) {}

  async createEvent(
    organization: Organization,
    actorUserId: string,
    dto: CreateEventDto,
  ) {
    this.organizationLifecyclePolicyService.assertWriteable(organization);

    const event = createEventFactory(organization.id, actorUserId, dto);

    const slugReservation = createEventSlugFactory(
      organization.id,
      event.slug,
      event.id,
    );

    await this.firebaseService.firestore.runTransaction(async (transaction) => {
      const slugRef = this.eventSlugRepository.getDocumentReference(
        organization.id,
        event.slug,
      );

      const existingSlug = await transaction.get(slugRef);

      if (existingSlug.exists) {
        throw new ApplicationException(
          ErrorCode.EVENT_SLUG_TAKEN,
          HttpStatus.CONFLICT,
          'This event slug is already in use.',
        );
      }

      const chairMembership = createEventMembershipFactory(
        event.id,
        actorUserId,
        EventRole.PROGRAM_CHAIR,
      );

      transaction.create(
        this.eventRepository.getDocumentReference(event.id),
        event,
      );
      transaction.create(slugRef, slugReservation);
      transaction.create(
        this.eventMembershipRepository.getDocumentReference(
          event.id,
          actorUserId,
        ),
        chairMembership,
      );
    });

    return EventMapper.toDetailsDto(event);
  }

  async listEvents(
    organization: Organization,
    options: EventListOptions,
  ): Promise<EventListResponseDto> {
    const result = await this.eventRepository.findPageByOrganization(
      organization.id,
      options,
    );

    return {
      items: result.items.map(EventMapper.toSummaryDto),
      nextCursor: result.nextCursor ?? null,
    };
  }

  async getEvent(organization: Organization, eventSlug: string) {
    const event = await this.eventsService.findByOrganizationAndSlug(
      organization.id,
      eventSlug,
    );

    return EventMapper.toDetailsDto(event);
  }

  async updateEvent(
    organization: Organization,
    slug: string,
    dto: UpdateEventDto,
  ) {
    const event = await this.eventsService.findByOrganizationAndSlug(
      organization.id,
      slug,
    );

    this.eventsDomainService.assertEditable(event);

    const requestedSlug =
      dto.slug === undefined ? event.slug : normalizeSlug(dto.slug);

    const updatedEvent: Event = {
      ...event,
      name: dto.name ?? event.name,
      slug: requestedSlug,
      description:
        dto.description === undefined ? event.description : dto.description,
      timezone: dto.timezone ?? event.timezone,
      startsAt:
        dto.startsAt === undefined
          ? event.startsAt
          : dto.startsAt === null
            ? null
            : Timestamp.fromDate(new Date(dto.startsAt)),
      endsAt:
        dto.endsAt === undefined
          ? event.endsAt
          : dto.endsAt === null
            ? null
            : Timestamp.fromDate(new Date(dto.endsAt)),
      updatedAt: Timestamp.now(),
    };

    this.eventsDomainService.assertValidSchedule(updatedEvent);

    if (requestedSlug === event.slug) {
      await this.eventRepository.save(updatedEvent);
      return EventMapper.toDetailsDto(updatedEvent);
    }

    await this.firebaseService.firestore.runTransaction(async (transaction) => {
      const newSlugRef = this.eventSlugRepository.getDocumentReference(
        organization.id,
        updatedEvent.slug,
      );

      const newSlugSnapshot = await transaction.get(newSlugRef);

      if (
        newSlugSnapshot.exists &&
        newSlugSnapshot.data()?.eventId !== event.id
      ) {
        throw new ApplicationException(
          ErrorCode.EVENT_SLUG_TAKEN,
          HttpStatus.CONFLICT,
          'The requested slug is already in use by another event',
        );
      }

      const oldSlugRef = this.eventSlugRepository.getDocumentReference(
        organization.id,
        event.slug,
      );

      const oldSlugSnapshot = await transaction.get(oldSlugRef);

      if (oldSlugSnapshot.exists) {
        transaction.delete(oldSlugRef);
      }

      transaction.create(
        newSlugRef,
        createEventSlugFactory(organization.id, updatedEvent.slug, event.id),
      );
      transaction.update(this.eventRepository.getDocumentReference(event.id), {
        ...updatedEvent,
      });
    });

    return EventMapper.toDetailsDto(updatedEvent);
  }

  async archiveEvent(organization: Organization, eventSlug: string) {
    this.organizationLifecyclePolicyService.assertWriteable(organization);

    const event = await this.eventsService.findByOrganizationAndSlug(
      organization.id,
      eventSlug,
    );

    this.eventsDomainService.archive(event);

    await this.eventRepository.save(event);

    return EventMapper.toDetailsDto(event);
  }

  async listMembers(event: Event): Promise<EventMemberDto[]> {
    const memberships = await this.eventMembershipRepository.findActiveByEvent(
      event.id,
    );

    const members = memberships.map(async (membership) => {
      const user = await this.userRepository.findById(membership.userId);
      if (!user) {
        return null;
      }
      return EventMemberMapper.toDto(user, membership);
    });

    return (await Promise.all(members)).filter(
      (member): member is EventMemberDto => member !== null,
    );
  }

  async addMember(
    organization: Organization,
    event: Event,
    actor: EventMembership,
    dto: CreateEventMemberDto,
  ): Promise<EventMemberDto> {
    this.organizationLifecyclePolicyService.assertWriteable(organization);
    this.eventsDomainService.assertEditable(event);

    const user = await this.userRepository.findById(dto.userId);
    if (!user) {
      throw new ApplicationException(
        ErrorCode.USER_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        'The target user does not exist.',
      );
    }

    const targetOrganizationMembership =
      await this.organizationMembershipService.findActiveMembership(
        user.id,
        organization.id,
      );
    if (!targetOrganizationMembership) {
      throw new ApplicationException(
        ErrorCode.RESOURCE_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        'The target user is not an active organization member.',
      );
    }

    return this.firebaseService.firestore.runTransaction(
      async (transaction) => {
        const eventMembershipRef =
          this.eventMembershipRepository.getDocumentReference(
            event.id,
            dto.userId,
          );

        const eventMembershipSnapshot =
          await transaction.get(eventMembershipRef);

        if (!eventMembershipSnapshot.exists) {
          const currentEventMembership = createEventMembershipFactory(
            event.id,
            dto.userId,
            dto.role,
          );
          transaction.create(eventMembershipRef, currentEventMembership);
          return EventMemberMapper.toDto(user, currentEventMembership);
        }

        const currentEventMembership =
          eventMembershipSnapshot.data() as EventMembership;

        if (currentEventMembership.status === EventMembershipStatus.REMOVED) {
          const reactivatedEventMembership = {
            ...currentEventMembership,
            role: dto.role,
            status: EventMembershipStatus.ACTIVE,
            joinedAt: Timestamp.now(),
            removedAt: null,
            removedBy: null,
            updatedAt: Timestamp.now(),
          };
          transaction.set(eventMembershipRef, reactivatedEventMembership, {
            merge: true,
          });
          return EventMemberMapper.toDto(user, reactivatedEventMembership);
        }
        throw new ApplicationException(
          ErrorCode.MEMBERSHIP_ALREADY_EXISTS,
          HttpStatus.CONFLICT,
          'The target user is already an active member of the event.',
        );
      },
    );
  }

  async updateMemberRole(
    event: Event,
    actor: EventMembership,
    targetUserId: string,
    dto: UpdateEventMemberDto,
  ): Promise<EventMemberDto> {
    this.eventsDomainService.assertEditable(event);
    const user = await this.userRepository.findById(targetUserId);
    if (!user) {
      throw new ApplicationException(
        ErrorCode.USER_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        'The target user does not exist.',
      );
    }
    return this.firebaseService.firestore.runTransaction(
      async (transaction) => {
        const actorSnapshot = await transaction.get(
          this.eventMembershipRepository.getDocumentReference(
            event.id,
            actor.userId,
          ),
        );

        const targetSnapshot = await transaction.get(
          this.eventMembershipRepository.getDocumentReference(
            event.id,
            targetUserId,
          ),
        );

        const chairsSnapshot = await transaction.get(
          this.eventMembershipRepository.getActiveChairByEvent(event.id),
        );

        const actorMembership = actorSnapshot.exists
          ? actorSnapshot.data()!
          : null;

        if (!actorMembership) {
          throw new ApplicationException(
            ErrorCode.MEMBERSHIP_NOT_FOUND,
            HttpStatus.NOT_FOUND,
            'The actor is not a member of the event.',
          );
        }

        this.eventMembershipPolicyService.assertActorCanManageMembers(
          actorMembership,
        );

        const targetMembership = targetSnapshot.exists
          ? targetSnapshot.data()!
          : null;

        if (!targetMembership) {
          throw new ApplicationException(
            ErrorCode.MEMBERSHIP_NOT_FOUND,
            HttpStatus.NOT_FOUND,
            'The target user is not a member of the event.',
          );
        }

        if (targetMembership.status !== EventMembershipStatus.ACTIVE) {
          throw new ApplicationException(
            ErrorCode.MEMBERSHIP_NOT_FOUND,
            HttpStatus.NOT_FOUND,
            'The target user is not an active member of the event.',
          );
        }

        this.eventMembershipPolicyService.assertCanChangeRole(
          actor.userId,
          targetMembership,
          dto.role,
          chairsSnapshot.size,
        );

        const updatedMembership = {
          ...targetMembership,
          role: dto.role,
          updatedAt: Timestamp.now(),
        };

        transaction.update(targetSnapshot.ref, {
          ...updatedMembership,
        });

        return EventMemberMapper.toDto(user, updatedMembership);
      },
    );
  }

  async removeMember(
    event: Event,
    actor: EventMembership,
    targetUserId: string,
  ): Promise<EventMemberDto> {
    this.eventsDomainService.assertEditable(event);

    if (actor.userId === targetUserId) {
      throw new ApplicationException(
        ErrorCode.VALIDATION_ERROR,
        HttpStatus.BAD_REQUEST,
        'You cannot remove yourself from the event.',
      );
    }

    const user = await this.userRepository.findById(targetUserId);

    if (!user) {
      throw new ApplicationException(
        ErrorCode.USER_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        'The target user does not exist.',
      );
    }

    return this.firebaseService.firestore.runTransaction(
      async (transaction) => {
        const actorMembershipRef =
          this.eventMembershipRepository.getDocumentReference(
            event.id,
            actor.userId,
          );

        const targetMembershipRef =
          this.eventMembershipRepository.getDocumentReference(
            event.id,
            targetUserId,
          );

        const activeChairsQuery =
          this.eventMembershipRepository.getActiveChairByEvent(event.id);

        const [actorSnapshot, targetSnapshot, chairsSnapshot] =
          await Promise.all([
            transaction.get(actorMembershipRef),
            transaction.get(targetMembershipRef),
            transaction.get(activeChairsQuery),
          ]);

        const actorMembership = actorSnapshot.exists
          ? actorSnapshot.data()!
          : null;

        if (!actorMembership) {
          throw new ApplicationException(
            ErrorCode.MEMBERSHIP_NOT_FOUND,
            HttpStatus.NOT_FOUND,
            'You are no longer a member of this event.',
          );
        }

        if (actorMembership.status !== EventMembershipStatus.ACTIVE) {
          throw new ApplicationException(
            ErrorCode.FORBIDDEN,
            HttpStatus.FORBIDDEN,
            'You are not an active member of this event',
          );
        }

        this.eventMembershipPolicyService.assertActorCanManageMembers(
          actorMembership,
        );

        const targetMembership = targetSnapshot.exists
          ? targetSnapshot.data()!
          : null;

        if (!targetMembership) {
          throw new ApplicationException(
            ErrorCode.MEMBERSHIP_NOT_FOUND,
            HttpStatus.NOT_FOUND,
            'The target user is not a member of the event.',
          );
        }

        if (targetMembership.status !== EventMembershipStatus.ACTIVE) {
          throw new ApplicationException(
            ErrorCode.MEMBERSHIP_NOT_FOUND,
            HttpStatus.NOT_FOUND,
            'The target user is not an active member of the event.',
          );
        }

        this.eventMembershipPolicyService.assertCanRemove(
          actorMembership.userId,
          targetMembership,
          chairsSnapshot.size,
        );

        const now = Timestamp.now();

        transaction.update(targetMembershipRef, {
          status: EventMembershipStatus.REMOVED,
          removedAt: now,
          removedBy: actorMembership.userId,
          updatedAt: now,
        });

        return EventMemberMapper.toDto(user, {
          ...targetMembership,
          status: EventMembershipStatus.REMOVED,
          removedAt: Timestamp.now(),
          removedBy: actor.userId,
          updatedAt: Timestamp.now(),
        });
      },
    );
  }

  async publishEvent(organization: Organization, eventSlug: string) {
    this.organizationLifecyclePolicyService.assertWriteable(organization);

    const event = await this.eventsService.findByOrganizationAndSlug(
      organization.id,
      eventSlug,
    );

    this.eventsDomainService.publish(event);

    await this.eventRepository.save(event);

    return EventMapper.toDetailsDto(event);
  }
}
