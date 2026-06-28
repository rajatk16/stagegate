import type { PropsWithChildren } from 'react';

export const PageActions = (props: PropsWithChildren) => {
  return <div className="flex items-center gap-2">{props.children}</div>;
};
