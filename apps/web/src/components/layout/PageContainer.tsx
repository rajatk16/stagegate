import { useId, type PropsWithChildren } from 'react';

import { cn } from '@/lib/utils';

import { Card, CardContent, CardHeader } from '../ui/card';

type Props = PropsWithChildren<{
  title: string;
  description?: string;
  className?: string;
}>;

export const PageContainer = (props: Props) => {
  const titleId = useId();
  return (
    <section
      aria-labelledby={props.title}
      className={cn(
        'mx-auto w-full max-w-xl px-4 py-12 sm:py-20',
        props.className,
      )}
    >
      <Card className="shadow-sm">
        <CardHeader className="gap-2">
          <h1
            id={titleId}
            className="text-2xl font-semibold tracking-tight sm:text-3xl"
          >
            {props.title}
          </h1>
          {props.description && (
            <p className="text-sm leading-relaxed wrap-break-word text-muted-foreground">
              {props.description}
            </p>
          )}
        </CardHeader>
        {props.children && <CardContent>{props.children}</CardContent>}
      </Card>
    </section>
  );
};

