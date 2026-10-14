import z from 'zod';
import { Injectable } from '@nestjs/common';

import { UsersService } from '../../users/services';
import { assertOrganizationPermissions } from '../utils';
import { OrganizationMembershipRepository } from '../repositories';
import { RequestValidationException } from '../../common/exceptions';
import { OrganizationMembersPage, OrganizationScope } from '../types';
import { ORGANIZATION_MEMBERSHIP_STATUS, ORGANIZATION_ROLES } from '../enums';
import {
  OrganizationMembership,
  organizationMembershipSchema,
} from '../models';
import {
  decodeOrganizationMembersCursor,
  encodeOrganizationMembersCursor,
} from '../utils/organizationMembersCursor.util';
import {
  ListOrganizationMembersQueryDto,
  UpdateOrganizationMemberRoleDto,
  UpdateOrganizationMemberStatusDto,
} from '../dtos';

@Injectable()
export class OrganizationMembersService {
  constructor(
    private readonly usersService: UsersService,
    private readonly memberships: OrganizationMembershipRepository,
  ) {}

  async list(
    scope: OrganizationScope,
    query: ListOrganizationMembersQueryDto,
  ): Promise<OrganizationMembersPage> {
    assertOrganizationPermissions(scope.membership, [
      'organization:members:read',
    ]);

    const afterUid = decodeOrganizationMembersCursor(query.cursor, scope);

    const page = await this.memberships.listByOrganization(
      scope.organizationId,
      query.limit,
      afterUid,
    );

    const identities = await this.usersService.getIdentitySummaries(
      page.items.map((membership: OrganizationMembership) => membership.uid),
    );

    const lastMember = page.items.at(-1);

    return {
      items: page.items.map((membership: OrganizationMembership) => {
        const identity = identities.get(membership.uid);

        return {
          ...membership,
          displayName: identity?.displayName ?? null,
          email: identity?.email ?? null,
        };
      }),
      nextCursor:
        page.hasMore && lastMember
          ? encodeOrganizationMembersCursor(scope, lastMember.uid)
          : null,
    };
  }

  changeRole(
    scope: OrganizationScope,
    rawUid: string,
    dto: UpdateOrganizationMemberRoleDto,
  ): Promise<OrganizationMembership> {
    const uidResult = organizationMembershipSchema.shape.uid.safeParse(rawUid);

    if (!uidResult.success) {
      throw new RequestValidationException([
        { field: 'uid', code: 'INVALID_VALUE' },
      ]);
    }

    const roleResult = z.nativeEnum(ORGANIZATION_ROLES).safeParse(dto.role);

    if (!roleResult.success) {
      throw new RequestValidationException([
        { field: 'role', code: 'INVALID_VALUE' },
      ]);
    }

    return this.memberships.changeRole(scope, uidResult.data, roleResult.data);
  }

  leave(scope: OrganizationScope): Promise<void> {
    return this.memberships.leave(scope);
  }

  changeStatus(
    scope: OrganizationScope,
    rawUid: string,
    dto: UpdateOrganizationMemberStatusDto,
  ): Promise<OrganizationMembership> {
    const uidResult = organizationMembershipSchema.shape.uid.safeParse(rawUid);

    if (!uidResult.success) {
      throw new RequestValidationException([
        {
          field: 'uid',
          code: 'INVALID_VALUE',
        },
      ]);
    }

    const statusResult = z
      .nativeEnum(ORGANIZATION_MEMBERSHIP_STATUS)
      .safeParse(dto.status);

    if (!statusResult.success) {
      throw new RequestValidationException([
        {
          field: 'status',
          code: 'INVALID_VALUE',
        },
      ]);
    }

    return this.memberships.changeStatus(
      scope,
      uidResult.data,
      statusResult.data,
    );
  }
}
