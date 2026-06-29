import type { PropsWithChildren } from 'react';

interface DataSectionProps extends PropsWithChildren {
  title?: string;
  description?: string;
}

export const DataSection = (props: DataSectionProps) => {
  return (
    <section className="space-y-6">
      {(props.title || props.description) && (
        <header>
          {props.title && (
            <h2 className="text-xl font-semibold">{props.title}</h2>
          )}

          {props.description && (
            <p className="mt-2 text-muted-foreground">{props.description}</p>
          )}
        </header>
      )}
      {props.children}
    </section>
  );
};
