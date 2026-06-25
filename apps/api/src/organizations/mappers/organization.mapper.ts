import { Organization } from '../entities';
import { OrganizationDetailsDto, OrganizationSummaryDto } from '../dtos';

export class OrganizationMapper {
  static toSummaryDto = (
    organization: Organization,
  ): OrganizationSummaryDto => {
    return {
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
      logoUrl: organization.logoUrl,
    };
  };

  static toDetailsDto = (
    organization: Organization,
  ): OrganizationDetailsDto => {
    return {
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
      description: organization.description,
      websiteUrl: organization.websiteUrl,
      logoUrl: organization.logoUrl,
      status: organization.status,
      createdBy: organization.createdBy,
      createdAt: organization.createdAt,
      updatedAt: organization.updatedAt,
    };
  };
}
