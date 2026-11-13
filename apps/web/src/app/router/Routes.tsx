import { PageLoader } from '@/components/common/PageLoader';
import { RouteErrorBoundary } from '@/components/errors/RouteErrorBoundary';
import { AppLayout } from '@/layouts/AppLayout';
import { PublicLayout } from '@/layouts/PublicLayout';
import { SpeakerLayout } from '@/layouts/SpeakerLayout';

import type { RouteObject } from 'react-router';

export const routes: RouteObject[] = [
  {
    path: '/',
    Component: PublicLayout,
    ErrorBoundary: RouteErrorBoundary,
    HydrateFallback: PageLoader,

    children: [
      {
        index: true,
        lazy: async () => {
          const { LandingPage } = await import('@/features/landing/LandingPage');

          return { Component: LandingPage };
        },
      },

      {
        path: 'unauthorized',
        lazy: async () => {
          const { UnauthorizedPage } = await import('@/pages/UnauthorizedPage');

          return { Component: UnauthorizedPage };
        },
      },

      {
        path: '*',
        lazy: async () => {
          const { NotFoundPage } = await import('@/pages/NotFoundPage');

          return { Component: NotFoundPage };
        },
      },
    ],
  },

  {
    path: '/app',
    Component: AppLayout,
    ErrorBoundary: RouteErrorBoundary,
    HydrateFallback: PageLoader,

    children: [
      {
        index: true,
        lazy: async () => {
          const { DashboardPage } = await import('@/features/dashboard/DashboardPage');

          return { Component: DashboardPage };
        },
      },
    ],
  },

  {
    path: '/speaker',
    Component: SpeakerLayout,
    ErrorBoundary: RouteErrorBoundary,
    HydrateFallback: PageLoader,

    children: [
      {
        index: true,
        lazy: async () => {
          const { SpeakerDashboardPage } = await import('@/features/speaker/SpeakerDashboardPage');

          return { Component: SpeakerDashboardPage };
        },
      },

      {
        path: 'proposals',
        lazy: async () => {
          const { SpeakerProposalsPage } = await import('@/features/speaker/SpeakerProposalsPage');

          return { Component: SpeakerProposalsPage };
        },
      },
    ],
  },
];
