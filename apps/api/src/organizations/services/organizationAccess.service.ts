import { HttpStatus, Injectable } from '@nestjs/common';

import { ApiException } from '../../common';
import { organizationSchema } from '../models';
import { DiagnosticError } from '../../observalibility';
import { assertOrganizationPermissions } from '../utils';
import { OrganizationPermission, OrganizationScope } from '../types';
import {
  OrganizationRepository,
  OrganizationmembershipRepository,
} from '../repositories';

const organizationNotFound = (): ApiException =>
  new ApiException(
    HttpStatus.NOT_FOUND,
    'ORGANIZATION_NOT_FOUND',
    'Organization not found.',
  );

@Injectable()
export class OrganizationAccessService {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
    private readonly organizationMembershipRepository: OrganizationmembershipRepository,
  ) {}

  async resolve(
    actorUid: string,
    rawOrganizationId: unknown,
  ): Promise<OrganizationScope> {
    if (
      rawOrganizationId === undefined ||
      rawOrganizationId === null ||
      rawOrganizationId === ''
    ) {
      throw new ApiException(
        HttpStatus.BAD_REQUEST,
        'ORGANIZATION_SCOPE_REQUIRED',
        'An organization ID is required',
      );
    }

    const result = organizationSchema.shape.id.safeParse(rawOrganizationId);

    if (!result.success) {
      throw new ApiException(
        HttpStatus.BAD_REQUEST,
        'ORGANIZATION_SCOPE_INVALID',
        'The organization ID is invalid',
      );
    }

    const organizationId = result.data;

    const membership =
      await this.organizationMembershipRepository.findByOrganizationAndUser(
        organizationId,
        actorUid,
      );

    if (!membership) {
      throw organizationNotFound();
    }

    const organization =
      await this.organizationRepository.findById(organizationId);

    if (!organization) {
      throw organizationNotFound();
    }

    if (
      membership.uid !== actorUid ||
      membership.organizationId !== organizationId ||
      organization.id !== organizationId
    ) {
      throw new DiagnosticError('ORGANIZATION_STORAGE_INVARIANT_FAILED');
    }

    return {
      actorUid,
      organizationId,
      organization,
      membership,
    };
  }

  assertPermissions(
    scope: OrganizationScope,
    required: readonly OrganizationPermission[],
  ): void {
    assertOrganizationPermissions(scope.membership, required);
  }
}
