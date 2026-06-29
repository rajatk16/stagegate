import { SkeletonBlock } from './primitives';

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export const TableSkeleton = ({
  rows = 5,
  columns = 5,
}: TableSkeletonProps) => {
  return (
    <div className="rounded-lg border">
      <div className="border-b p-4">
        <SkeletonBlock className="h-5 w-48" />
      </div>
      <div className="divide-y">
        {Array.from({ length: rows }).map((_, row) => (
          <div
            key={row}
            className="grid gap-4 p-4"
            style={{
              gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
            }}
          >
            {Array.from({ length: columns }).map((_, column) => (
              <SkeletonBlock key={column} className="h-4" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
