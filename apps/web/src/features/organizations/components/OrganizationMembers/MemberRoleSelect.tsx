import {
  Select,
  SelectItem,
  SelectValue,
  SelectContent,
  SelectTrigger,
} from '@/components/ui';

import { OrganizationRole } from '../../types';

interface MemberRoleSelectProps {
  disabled?: boolean;
  value: OrganizationRole;

  onChange: (value: OrganizationRole) => void;
}

export const MemberRoleSelect = (props: MemberRoleSelectProps) => {
  return (
    <Select
      value={props.value}
      disabled={props.disabled}
      onValueChange={(value: OrganizationRole) => props.onChange(value)}
    >
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>

      <SelectContent>
        <SelectItem value={OrganizationRole.ADMIN}>Admin</SelectItem>
        <SelectItem value={OrganizationRole.MEMBER}>Admin</SelectItem>
      </SelectContent>
    </Select>
  );
};
