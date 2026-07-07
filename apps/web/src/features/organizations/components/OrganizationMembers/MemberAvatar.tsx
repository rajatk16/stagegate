import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui';

interface MemberAvatarProps {
  displayName: string;
  photoUrl?: string | null;
}

const getInitials = (name: string) =>
  name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

export const MemberAvatar = ({ displayName, photoUrl }: MemberAvatarProps) => (
  <Avatar className="h-9 w-9">
    <AvatarImage
      src={photoUrl ?? undefined}
      alt={displayName}
      referrerPolicy="no-referrer"
      className="object-cover"
    />
    <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
  </Avatar>
);
