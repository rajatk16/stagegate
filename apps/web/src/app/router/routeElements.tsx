import { Suspense, lazy } from 'react';

import { ProtectedRoute } from './ProtectedRoute';
import { AppLayout, AuthLayout } from '../layouts';
import { PublicOnlyRoute } from './PublicOnlyRoute';

const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'));
const DashboardPage = lazy(
  () => import('@/features/dashboard/pages/DashboardPage'),
);

const CreateOrganizationPage = lazy(
  () => import('@/features/organizations/pages/CreateOrganizationPage'),
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

export function AuthLayoutRoute() {
  return (
    <PublicOnlyRoute>
      <AuthLayout />
    </PublicOnlyRoute>
  );
}

export function CreateOrganizationPageRoute() {
  return (
    <Suspense fallback={<div />}>
      <CreateOrganizationPage />
    </Suspense>
  );
}
