import { Skeleton } from '@/components/ui';

const SkeletonRow = () => (
  <div className="flex items-center justify-between rounded-lg border p-4">
    <div className="flex items-center gap-3">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-3 w-52" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
    </div>
    <Skeleton className="h-5 w-5 rounded-full" />
  </div>
);

export const OrganizationMemberPickerSkeleton = () => (
  <div className="space-y-3">
    <Skeleton className="h-10 w-full" />
    {Array.from({ length: 5 }).map((_, index) => (
      <SkeletonRow key={index} />
    ))}
  </div>
);
