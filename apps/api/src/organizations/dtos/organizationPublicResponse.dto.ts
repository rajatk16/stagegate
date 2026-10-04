export class OrganizationPublicResponseDto {
  id!: string;
  slug!: string;
  name!: string;
  description!: string | null;
  websiteURL!: string | null;
  primaryColor!: string | null;
  secondaryColor!: string | null;
  logoVersion!: string | null;
}
