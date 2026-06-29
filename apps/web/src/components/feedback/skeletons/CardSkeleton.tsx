import { Card, CardContent, CardHeader } from '@/components/ui';

import { SkeletonAvatar, SkeletonBlock, SkeletonText } from './primitives';

interface CardSkeletonProps {
  showAvatar?: boolean;
}

export const CardSkeleton = ({ showAvatar = false }: CardSkeletonProps) => (
  <Card>
    <CardHeader>
      <div className="flex items-center gap-4">
        {showAvatar && <SkeletonAvatar />}

        <div className="flex-1 space-y-2">
          <SkeletonBlock className="h-6 w-48" />
          <SkeletonBlock className="h-4 w-32" />
        </div>
      </div>
    </CardHeader>

    <CardContent>
      <SkeletonText />
    </CardContent>
  </Card>
);
