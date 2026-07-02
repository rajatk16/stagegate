import { DropdownMenuContent, Skeleton } from '@/components/ui';

export const OrganizationSwitcherLoading = () => (
  <DropdownMenuContent className="w-80" align="start">
    <div className="space-y-2 p-2">
      {[...Array(4)].map((_, index) => (
        <div key={index} className="flex items-center gap-3 rounded-md p-2">
          <Skeleton className="h-8 w-8 rounded-md" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      ))}
    </div>
  </DropdownMenuContent>
);
