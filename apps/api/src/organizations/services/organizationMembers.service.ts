import z from 'zod';
import { Injectable } from '@nestjs/common';

import { ORGANIZATION_ROLES } from '../enums';
import { UsersService } from '../../users/services';
import { assertOrganizationPermissions } from '../utils';
import { RequestValidationException } from '../../common';
import { OrganizationmembershipRepository } from '../repositories';
import { OrganizationMembersPage, OrganizationScope } from '../types';
import {
  ListOrganizationMembersQueryDto,
  UpdateOrganizationMemberRoleDto,
} from '../dtos';
import {
  OrganizationMembership,
  organizationMembershipSchema,
} from '../models';
import {
  decodeOrganizationMembersCursor,
  encodeOrganizationMembersCursor,
} from '../utils/organizationMembersCursor.util';

@Injectable()
export class OrganizationMembersService {
  constructor(
    private readonly usersService: UsersService,
    private readonly memberships: OrganizationmembershipRepository,
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
      page.items.map((membership) => membership.uid),
    );

    const lastMember = page.items.at(-1);

    return {
      items: page.items.map((membership) => {
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
}
