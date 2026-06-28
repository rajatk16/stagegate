import type { PropsWithChildren } from 'react';

export const PageDescription = (props: PropsWithChildren) => {
  return <p className="text-muted-foreground">{props.children}</p>;
};
