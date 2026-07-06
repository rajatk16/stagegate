import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useMemo, useState } from 'react';

import { useNavigationBlocker } from '@/app';
import { ConfirmActionDialog } from '@/components/dialogs';
import {
  Card,
  Form,
  Input,
  FormItem,
  Textarea,
  CardTitle,
  FormField,
  FormLabel,
  CardHeader,
  CardContent,
  FormControl,
  FormMessage,
  CardDescription,
} from '@/components/ui';

import { OrganizationFormActions } from './OrganizationFormActions';
import type { OrganizationFormProps, OrganizationFormValues } from './types';
import { organizationFormSchema, type OrganizationFormSchema } from './schema';

const DEFAULT_VALUES: OrganizationFormValues = {
  name: '',
  slug: '',
  description: '',
  websiteUrl: '',
  logoUrl: '',
};

export const OrganizationForm = ({
  disabled = false,
  onSubmit,
  defaultValues,
  isSubmitting = false,
  submitLabel = 'Save',
}: OrganizationFormProps) => {
  const [showDialog, setShowDialog] = useState(false);

  const initialValues = useMemo(
    () => ({
      ...DEFAULT_VALUES,
      ...defaultValues,
    }),
    [defaultValues],
  );

  const form = useForm<OrganizationFormSchema>({
    mode: 'onTouched',
    defaultValues: initialValues,
    resolver: zodResolver(organizationFormSchema),
  });

  const handleBlock = useCallback(() => {
    setShowDialog(true);
  }, []);

  const blocker = useNavigationBlocker({
    enabled: form.formState.isDirty,
    onBlock: handleBlock,
  });

  const handleSubmit = async (values: OrganizationFormSchema) => {
    if (!form.formState.isDirty) {
      return;
    }
    await onSubmit(values);

    form.reset(values);
  };

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Organization Details</CardTitle>
        <CardDescription>
          Provide basic information about your organization.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <ConfirmActionDialog
          open={showDialog}
          title="Unsaved Changes"
          description="You have unsaved changes. Are you sure you want to leave this page?"
          confirmLabel="Leave"
          cancelLabel="Stay"
          onOpenChange={(open) => {
            setShowDialog(open);

            if (!open && blocker.state === 'blocked') {
              blocker.reset();
            }
          }}
          onConfirm={() => {
            if (blocker.state === 'blocked') {
              blocker.proceed();
            }
            setShowDialog(false);
          }}
        />
        <Form {...form}>
          <form
            className="space-y-6"
            onSubmit={form.handleSubmit(handleSubmit)}
          >
            <FormField
              disabled={disabled}
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="React India"
                      autoComplete="organization"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              disabled={disabled}
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization Slug</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="react-india"
                      autoComplete="off"
                      {...field}
                    />
                  </FormControl>
                  <p className="text-sm text-muted-foreground">
                    This will be used in your organization URL.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              disabled={disabled}
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your organization in a few words"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              disabled={disabled}
              control={form.control}
              name="websiteUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization Website</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      autoComplete="off"
                      placeholder="https://example.com"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              disabled={disabled}
              control={form.control}
              name="logoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization Logo</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      autoComplete="off"
                      placeholder="https://example.com"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <OrganizationFormActions
              isSubmitting={isSubmitting}
              submitLabel={submitLabel}
              disabled={!form.formState.isDirty || disabled}
            />
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
