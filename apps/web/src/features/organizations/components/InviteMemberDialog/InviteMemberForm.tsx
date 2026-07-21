import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  Form,
  Input,
  Button,
  Select,
  FormItem,
  FormField,
  FormLabel,
  SelectItem,
  FormControl,
  FormMessage,
  SelectValue,
  SelectContent,
  SelectTrigger,
} from '@/components/ui';

import { OrganizationRole } from '../../types';
import { inviteMemberFormSchema, type InviteMemberFormSchema } from './schema';

interface InviteMemberFormProps {
  isSubmitting?: boolean;
  onSubmit: (value: InviteMemberFormSchema) => Promise<void>;
}

export const InviteMemberForm = (props: InviteMemberFormProps) => {
  const form = useForm<InviteMemberFormSchema>({
    resolver: zodResolver(inviteMemberFormSchema),
    defaultValues: {
      email: '',
      role: OrganizationRole.MEMBER,
    },
  });

  return (
    <Form {...form}>
      <form className="space-y-6" onSubmit={form.handleSubmit(props.onSubmit)}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="email"
                  placeholder="john.doe@example.com"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={OrganizationRole.ADMIN}>Admin</SelectItem>
                  <SelectItem value={OrganizationRole.MEMBER}>
                    Member
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={props.isSubmitting} className="w-full">
          Invite Member
        </Button>
      </form>
    </Form>
  );
};
