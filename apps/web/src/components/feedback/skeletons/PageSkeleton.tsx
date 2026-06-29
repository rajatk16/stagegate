import { CardSkeleton } from './CardSkeleton';
import { SkeletonBlock } from './primitives';

interface PageSkeletonProps {
  cards?: number;
}

export const PageSkeleton = ({ cards = 2 }: PageSkeletonProps) => {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <SkeletonBlock className="h-8 w-64" />
        <SkeletonBlock className="h-4 w-96" />
      </div>

      <div className="grid gap-6">
        {Array.from({ length: cards }).map((_, index) => (
          <CardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
};
