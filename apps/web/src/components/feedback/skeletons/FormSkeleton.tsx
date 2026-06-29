import { Card, CardContent, CardHeader } from '@/components/ui';

import { SkeletonBlock } from './primitives';

interface FormSkeletonProps {
  fields?: number;
}

export const FormSkeleton = ({ fields = 5 }: FormSkeletonProps) => (
  <Card>
    <CardHeader>
      <SkeletonBlock className="h-7 w-56" />
      <SkeletonBlock className="h-4 w-80" />
    </CardHeader>

    <CardContent className="space-y-6">
      {Array.from({ length: fields }).map((_, index) => (
        <div key={index} className="space-y-2">
          <SkeletonBlock className="h-4 w-28" />
          <SkeletonBlock className="h-10 w-full" />
        </div>
      ))}
      <div className="flex justify-end pt-4">
        <SkeletonBlock className="h-10 w-24" />
      </div>
    </CardContent>
  </Card>
);
