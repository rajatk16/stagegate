import { SkeletonBlock } from './SkeletonBlock';

interface SkeletonAvatarProps {
  size?: number;
}

export const SkeletonAvatar = ({ size = 40 }: SkeletonAvatarProps) => (
  <SkeletonBlock
    className="rounded-full"
    style={{ width: size, height: size }}
  />
);
