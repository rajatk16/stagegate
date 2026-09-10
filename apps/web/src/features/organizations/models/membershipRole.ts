import { z } from 'zod';

export const membershipRoleSchema = z.enum([
  'OWNER',
  'ADMIN',
  'EVENT_MANAGER',
  'REVIEWER',
  'SUBMITTER',
  'OBSERVER',
]);

export type MembershipRole = z.infer<typeof membershipRoleSchema>;

interface RolePresentation {
  readonly label: string;
  readonly description: string;
  readonly className: string;
}

export const rolePresentations: Record<MembershipRole, RolePresentation> = {
  OWNER: {
    label: 'Owner',
    description: 'Full organization access.',
    className: 'bg-violet-100 text-violet-800',
  },
  ADMIN: {
    label: 'Administrator',
    description: 'Can manage organization settings and members.',
    className: 'bg-blue-100 text-blue-800',
  },
  EVENT_MANAGER: {
    label: 'Event Manager',
    description: 'Can manage assigned events and their workflows.',
    className: 'bg-cyan-100 text-cyan-800',
  },
  REVIEWER: {
    label: 'Reviewer',
    description: 'Can review assigned proposals.',
    className: 'bg-amber-100 text-amber-800',
  },
  SUBMITTER: {
    label: 'Submitter',
    description: 'Can create and manage their proposals.',
    className: 'bg-emerald-100 text-emerald-800',
  },
  OBSERVER: {
    label: 'Observer',
    description: 'Can read-only access to permitted organization information.',
    className: 'bg-slate-100 text-slate-800',
  },
};
