import type { ComponentType } from 'react';
import { Ban, CheckCircle2, Clock3, TimerOff, XCircle } from 'lucide-react';

import { Badge } from '@/components/ui';

import { OrganizationInvitationStatus } from '../../types';

interface Props {
  status: OrganizationInvitationStatus;
}

interface BadgeConfig {
  label: string;
  className: string;
  icon: ComponentType<{ className?: string }>;
}

const BADGE_CONFIG: Record<OrganizationInvitationStatus, BadgeConfig> = {
  [OrganizationInvitationStatus.PENDING]: {
    label: 'Pending',
    icon: Clock3,
    className:
      'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300',
  },
  [OrganizationInvitationStatus.ACCEPTED]: {
    label: 'Accepted',
    icon: CheckCircle2,
    className:
      'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300',
  },
  [OrganizationInvitationStatus.DECLINED]: {
    label: 'Declined',
    icon: XCircle,
    className:
      'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-50 dark:border-slate-900 dark:bg-slate-950/40 dark:text-slate-300',
  },
  [OrganizationInvitationStatus.REVOKED]: {
    label: 'Revoked',
    icon: Ban,
    className:
      'border-red-200 bg-red-50 text-red-700 hover:bg-red-50 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300',
  },
  [OrganizationInvitationStatus.EXPIRED]: {
    label: 'Expired',
    icon: TimerOff,
    className:
      'border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-50 dark:border-orange-900 dark:bg-orange-950/40 dark:text-orange-300',
  },
};

export const InvitationStatusBadge = ({ status }: Props) => {
  const config = BADGE_CONFIG[status];

  if (!config) return null;

  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={`inline-flex items-center gap-1.5 font-medium ${config.className}`}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" />
      <span>{config.label}</span>
    </Badge>
  );
};
