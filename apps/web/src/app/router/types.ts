import type { RouteObject } from 'react-router-dom';

export interface AppRouteHandle {
  title: string;
  requiresAuth?: boolean;
  publicOnly?: boolean;
}

export type AppRoute = RouteObject & {
  handle?: AppRouteHandle;
};
