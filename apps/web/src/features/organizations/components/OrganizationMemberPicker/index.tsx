import { useMemo, useState, type ReactNode } from 'react';

import { Input } from '@/components/ui';

import type { OrganizationMember } from '../../types';
import { OrganizationMemberPickerItem } from './OrganizationMemberPickerItem';
import { OrganizationMemberPickerEmpty } from './OrganizationMemberPickerEmpty';
import { OrganizationMemberPickerSkeleton } from './OrganizationMemberPickerSkeleton';

interface OrganizationMemberPickerProps {
  members: OrganizationMember[];
  selectedMemberId?: string;
  loading?: boolean;
  disabled?: boolean;
  searchEnabled?: boolean;
  searchPlaceholder?: string;
  emptyMessage?: string;
  excludeMemberIds?: string[];
  footer?: ReactNode;
  onSelect: (member: OrganizationMember) => void;
}

export const OrganizationMemberPicker = ({
  loading = false,
  disabled = false,
  excludeMemberIds = [],
  searchEnabled = true,
  searchPlaceholder = 'Search members...',
  emptyMessage = 'No eligible members found.',
  ...props
}: OrganizationMemberPickerProps) => {
  const [search, setSearch] = useState('');

  const filteredMembers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return props.members
      .filter((member) => !excludeMemberIds.includes(member.id))
      .filter((member) => {
        if (!query) return true;

        return (
          member.displayName.toLowerCase().includes(query) ||
          member.email.toLowerCase().includes(query)
        );
      });
  }, [props.members, excludeMemberIds, search]);

  if (loading) {
    return <OrganizationMemberPickerSkeleton />;
  }

  return (
    <div className="space-y-4">
      {searchEnabled && (
        <Input
          value={search}
          placeholder={searchPlaceholder}
          disabled={disabled}
          onChange={(event) => setSearch(event.target.value)}
        />
      )}

      <div className="max-h-96 space-y-3 overflow-y-auto pr-1">
        {filteredMembers.length === 0 ? (
          <OrganizationMemberPickerEmpty message={emptyMessage} />
        ) : (
          filteredMembers.map((member) => (
            <OrganizationMemberPickerItem
              key={member.id}
              member={member}
              selected={props.selectedMemberId === member.id}
              disabled={disabled}
              onSelect={props.onSelect}
            />
          ))
        )}
      </div>

      {props.footer}
    </div>
  );
};
