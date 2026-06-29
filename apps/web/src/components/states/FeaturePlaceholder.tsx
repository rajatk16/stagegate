import type { ReactNode } from 'react';
import { Sparkles, type LucideIcon } from 'lucide-react';

import { EmptyState } from './EmptyState';

interface FeaturePlaceholderProps {
  title: string;
  badge?: ReactNode;
  icon?: LucideIcon;
  action?: ReactNode;
  description: string;
}

export const FeaturePlaceholder = ({
  icon = Sparkles,
  title,
  badge,
  action,
  description,
}: FeaturePlaceholderProps) => {
  return (
    <EmptyState
      icon={icon}
      title={title}
      description={description}
      action={
        <>
          {badge && <div className="mb-4">{badge}</div>}
          {action}
        </>
      }
    />
  );
};
