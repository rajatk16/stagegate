import { Construction } from 'lucide-react';

import { Badge } from '../ui';
import { FeaturePlaceholder } from './FeaturePlaceholder';

interface ComingSoonProps {
  title?: string;
  description?: string;
}

export const ComingSoon = ({
  title = 'Coming Soon',
  description = 'This feature is currently under development and will be available soon.',
}: ComingSoonProps) => {
  return (
    <FeaturePlaceholder
      icon={Construction}
      title={title}
      description={description}
      badge={<Badge variant="secondary">Planned Feature</Badge>}
    />
  );
};
