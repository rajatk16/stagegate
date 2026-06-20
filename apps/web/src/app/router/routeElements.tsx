import { Suspense, lazy } from 'react';

import { AppLayout } from '../layouts/AppLayout';
import { ProtectedRoute } from './ProtectedRoute';

const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'));
const DashboardPage = lazy(
  () => import('@/features/dashboard/pages/DashboardPage'),
);

export function LoginPageRoute() {
  return (
    <Suspense fallback={<div />}>
      <LoginPage />
    </Suspense>
  );
}

export function DashboardPageRoute() {
  return (
    <Suspense fallback={<div />}>
      <DashboardPage />
    </Suspense>
  );
}

export function DashboardLayoutRoute() {
  return (
    <ProtectedRoute>
      <AppLayout />
    </ProtectedRoute>
  );
}
