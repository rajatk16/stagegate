import type { PropsWithChildren } from 'react';

export const PageTitle = (props: PropsWithChildren) => {
  return (
    <h1 className="text-3xl font-bold tracking-tight">{props.children}</h1>
  );
};
