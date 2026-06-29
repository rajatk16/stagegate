import type { PropsWithChildren } from 'react';

import { Fade } from './Fade';

export const PageTransition = ({ children }: PropsWithChildren) => (
  <Fade duration={0.25}>{children}</Fade>
);
