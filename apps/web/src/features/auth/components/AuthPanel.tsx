import type { PropsWithChildren } from 'react';

import { Card, CardContent, CardHeader } from '@/components/ui/card';

export const AuthPanel = ({
  title,
  description,
  children,
}: PropsWithChildren<{ title: string; description: string }>) => (
  <section
    aria-labelledby="auth-title"
    className="mx-auto w-full max-w-md px-4 py-12 sm:py-20"
  >
    <Card className="shadow-sm">
      <CardHeader className="gap-2">
        <h1
          id="auth-title"
          className="text-2xl font-semibold tracking-tight sm:text-3xl"
        >
          {title}
        </h1>
        <p className="text-sm leading-relaxed wrap-break-word text-muted-foreground">
          {description}
        </p>
      </CardHeader>
      {children && <CardContent>{children}</CardContent>}
    </Card>
  </section>
);
