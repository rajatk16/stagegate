export interface OrganizationFormValues {
  name: string;
  slug: string;
  description?: string;
  websiteUrl?: string;
  logoUrl?: string;
}

export interface OrganizationFormProps {
  submitLabel?: string;
  isSubmitting?: boolean;
  defaultValues?: Partial<OrganizationFormValues>;

  onSubmit: (values: OrganizationFormValues) => void | Promise<void>;
}
