import { createElement } from 'react';
import { createBrowserRouter } from 'react-router-dom';

import LandingPage from '@/features/landing/pages/LandingPage';

import {
  LoginPageRoute,
  AuthLayoutRoute,
  DashboardPageRoute,
  DashboardLayoutRoute,
  CreateOrganizationPageRoute,
} from './routeElements';
import { NotFoundPage } from '@/features/extra/pages/NotFoundPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: createElement(LandingPage),
    handle: {
      title: 'Home',
    },
  },
  {
    path: '/login',
    element: createElement(AuthLayoutRoute),
    children: [
      {
        index: true,
        element: createElement(LoginPageRoute),
        handle: {
          title: 'Login',
        },
      },
    ],
  },
  {
    path: '/dashboard',
    element: createElement(DashboardLayoutRoute),
    children: [
      {
        index: true,
        element: createElement(DashboardPageRoute),
        handle: {
          title: 'Dashboard',
        },
      },
    ],
  },
  {
    path: '/create-organization',
    element: createElement(DashboardLayoutRoute),
    children: [
      {
        index: true,
        element: createElement(CreateOrganizationPageRoute),
        handle: {
          title: 'Create Organization',
        },
      },
    ],
  },
  {
    path: '*',
    element: createElement(NotFoundPage),
    handle: {
      title: 'Not Found',
    },
  },
]);
