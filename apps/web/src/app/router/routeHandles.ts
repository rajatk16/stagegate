import type { UIMatch } from 'react-router-dom';

export interface RouteHandles {
  title: string;
}

export type AppUIMatch = UIMatch<unknown, RouteHandles>;
