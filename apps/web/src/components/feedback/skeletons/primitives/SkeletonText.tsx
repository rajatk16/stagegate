import { SkeletonBlock } from './SkeletonBlock';

interface SkeletonTextProps {
  lines?: number;
}

export const SkeletonText = ({ lines = 3 }: SkeletonTextProps) => (
  <div className="space-y-2">
    {Array.from({ length: lines }).map((_, index) => (
      <SkeletonBlock
        key={index}
        className={`${index === lines - 1 ? 'h-4 w-2/3' : 'h-4 w-full'}`}
      />
    ))}
  </div>
);
