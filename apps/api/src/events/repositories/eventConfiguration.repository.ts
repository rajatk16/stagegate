import { HttpStatus, Injectable } from '@nestjs/common';
import { EventAccessService } from '../services/eventAccess.service';
import { EventIdentity } from '../models/eventIdentity.model';
import { parseEventIdentity } from '../utils/event.util';
import { eventConfigurationConverter } from '../converters/eventConfiguration.converter';
import { eventConfigurationObjectSchema } from '../models/eventConfiguration.model';
import { ApiException } from '../../common/exceptions/api.exception';

@Injectable()
export class EventConfigurationRepository {
  constructor(private readonly eventAccessService: EventAccessService) {}

  collection(rawIdentity: EventIdentity) {
    const identity = parseEventIdentity(rawIdentity);

    return this.eventAccessService
      .getEventReference(identity.organizationId, identity.eventId)
      .collection('configuration')
      .withConverter(eventConfigurationConverter);
  }

  reference(identity: EventIdentity, rawId: unknown) {
    const id = eventConfigurationObjectSchema.shape.id.safeParse(rawId);

    if (!id.success) {
      throw new ApiException(
        HttpStatus.BAD_REQUEST,
        'EVENT_CONFIGURATION_ID_INVALID',
        'A valid configuration ID is required.',
      );
    }
    return this.collection(identity).doc(id.data);
  }
}
