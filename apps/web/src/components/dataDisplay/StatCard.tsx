import type { ReactNode } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '../ui';

interface StatCardProps {
  title: string;

  value: ReactNode;

  description?: string;

  icon?: ReactNode;

  footer?: ReactNode;
}

export function StatCard({
  title,
  value,
  description,
  icon,
  footer,
}: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>

        {icon}
      </CardHeader>

      <CardContent>
        <div className="text-3xl font-bold">{value}</div>

        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}

        {footer && <div className="mt-4">{footer}</div>}
      </CardContent>
    </Card>
  );
}
