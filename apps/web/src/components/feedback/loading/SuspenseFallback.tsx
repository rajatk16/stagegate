import type { PropsWithChildren } from 'react';

import { PageSkeleton } from '../skeletons';

export const SuspenseFallback = (props: PropsWithChildren) => (
  <>{props.children ?? <PageSkeleton />}</>
);
