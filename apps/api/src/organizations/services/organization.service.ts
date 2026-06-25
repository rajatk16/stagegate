import { Injectable, NotFoundException } from '@nestjs/common';

import { OrganizationRepository } from '../repositories';

@Injectable()
export class OrganizationService {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  async findById(organizationId: string) {
    const organization =
      await this.organizationRepository.findById(organizationId);

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return organization;
  }

  async findByIds(organizationIds: string[]) {
    return this.organizationRepository.findByIds(organizationIds);
  }

  async findBySlug(slug: string) {
    const organization = await this.organizationRepository.findBySlug(slug);

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return organization;
  }
}
