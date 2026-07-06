export interface OrganizationFormValues {
  name: string;
  slug: string;
  logoUrl?: string;
  websiteUrl?: string;
  description?: string;
}

export interface OrganizationFormProps {
  disabled?: boolean;
  submitLabel?: string;
  isSubmitting?: boolean;
  defaultValues?: Partial<OrganizationFormValues>;

  onSubmit: (values: OrganizationFormValues) => void | Promise<void>;
}
