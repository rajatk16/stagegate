import { Route, Routes } from 'react-router';

import { RequireAuth } from '@/app/components';
import { AppShell, PublicLayout } from '@/app/layouts';
import { Dashboard, Landing, NotFound } from '@/app/pages';
import { ORGANIZATION_ROUTE_PATTERN, ORGANIZATION_SECTIONS } from '@/lib';
import {
  Profile,
  AuthForm,
  AuthLayout,
  EmailAction,
  VerifyEmail,
  Organizations,
  ForgotPassword,
  SessionBoundary,
  OrganizationShell,
  CreateOrganization,
  OrganizationMembers,
  RequireOrganization,
  OrganizationSettings,
  OrganizationDashboard,
  OrganizationsProvider,
} from '@/features';

export const App = () => (
  <Routes>
    <Route element={<PublicLayout />}>
      <Route path="/" element={<Landing />} />
      <Route path="*" element={<NotFound />} />
    </Route>

    <Route element={<AuthLayout />}>
      <Route
        path="/sign-in"
        element={<AuthForm key="sign-in" mode="sign-in" />}
      />
      <Route
        path="/register"
        element={<AuthForm key="register" mode="register" />}
      />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/auth/action" element={<EmailAction />} />
    </Route>

    <Route
      element={
        <SessionBoundary>
          <RequireAuth />
        </SessionBoundary>
      }
    >
      <Route element={<OrganizationsProvider />}>
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/organizations" element={<Organizations />} />
          <Route path="/organizations/new" element={<CreateOrganization />} />
          <Route
            path={ORGANIZATION_ROUTE_PATTERN}
            element={<OrganizationShell />}
          >
            <Route index element={<OrganizationDashboard />} />

            <Route
              element={
                <RequireOrganization
                  capability={ORGANIZATION_SECTIONS.settings.capability}
                />
              }
            >
              <Route
                path={ORGANIZATION_SECTIONS.settings.segment}
                element={<OrganizationSettings />}
              />
            </Route>

            <Route
              element={
                <RequireOrganization
                  capability={ORGANIZATION_SECTIONS.members.capability}
                />
              }
            >
              <Route
                path={ORGANIZATION_SECTIONS.members.segment}
                element={<OrganizationMembers />}
              />
            </Route>
          </Route>
        </Route>
      </Route>
    </Route>
  </Routes>
);
