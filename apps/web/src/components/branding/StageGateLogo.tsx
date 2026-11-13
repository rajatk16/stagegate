import { Layers3 } from 'lucide-react';
import { Link } from 'react-router';

import { cn } from '@/lib/utils';

interface StageGateLogoProps {
  compact?: boolean;
  className?: string;
  to?: string;
}

export const StageGateLogo = ({ compact = false, className, to = '/' }: StageGateLogoProps) => (
  <Link
    to={to}
    aria-label="StageGate home"
    className={cn('inline-flex items-center gap-2.5', className)}
  >
    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
      <Layers3 className="size-5" aria-hidden="true" />
    </span>

    {!compact && <span className="text-lg font-bold tracking-tight">StageGate</span>}
  </Link>
);
