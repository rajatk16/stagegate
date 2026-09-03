import { createBrowserRouter, type RouteObject } from 'react-router';

import { routes } from './routes';
import { AppShell } from '../components/layout';
import { EventsPage, NotFoundPage, SettingsPage, DashboardPage } from '../pages';
import {
  LoginPage,
  SignUpPage,
  AnonymousOnly,
  EmailActionPage,
  VerifyEmailPage,
  ForgotPasswordPage,
  RequireVerifiedEmail,
  RequireAuthentication,
} from '../features/auth';

export const appRoutes: RouteObject[] = [
  {
    path: routes.emailAction,
    element: <EmailActionPage />,
  },
  {
    path: routes.verifyEmail,
    element: <VerifyEmailPage />,
  },
  {
    element: <AnonymousOnly />,
    children: [
      {
        path: routes.login,
        element: <LoginPage />,
      },
      {
        path: routes.signUp,
        element: <SignUpPage />,
      },
      {
        path: routes.forgotPassword,
        element: <ForgotPasswordPage />,
      },
    ],
  },
  {
    element: <RequireAuthentication />,
    children: [
      {
        element: <RequireVerifiedEmail />,
        children: [
          {
            element: <AppShell />,
            children: [
              {
                index: true,
                element: <DashboardPage />,
              },
              {
                element: <EventsPage />,
                path: routes.events,
              },
              {
                path: routes.settings,
                element: <SettingsPage />,
              },
              {
                path: '*',
                element: <NotFoundPage />,
              },
            ],
          },
        ],
      },
    ],
  },
];

export const router = createBrowserRouter(appRoutes);
