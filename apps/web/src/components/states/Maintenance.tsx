import { Wrench } from 'lucide-react';

import { Badge } from '../ui';
import { FeaturePlaceholder } from './FeaturePlaceholder';

interface MaintenanceProps {
  title?: string;
  description?: string;
}

export const Maintenance = ({
  title = 'Under Maintenance',
  description = 'We are currently performing maintenance on the system. Please check back later.',
}: MaintenanceProps) => {
  return (
    <FeaturePlaceholder
      icon={Wrench}
      title={title}
      description={description}
      badge={<Badge variant="outline">Maintenance</Badge>}
    />
  );
};
