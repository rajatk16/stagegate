import { Route, Routes } from 'react-router';

import { AppShell, PublicLayout } from '@/app/layouts';
import { Dashboard, Landing, NotFound } from '@/app/pages';
import { RequireAuth, RequireCompleteProfile } from '@/app/components';
import { ORGANIZATION_ROUTE_PATTERN, ORGANIZATION_SECTIONS } from '@/lib';
import {
  Events,
  Profile,
  AuthForm,
  AuthLayout,
  EmailAction,
  CreateEvent,
  Invitations,
  VerifyEmail,
  Organizations,
  ForgotPassword,
  SessionBoundary,
  AcceptInvitation,
  OrganizationShell,
  CreateOrganization,
  OrganizationMembers,
  RequireOrganization,
  OrganizationActivity,
  OrganizationSettings,
  OrganizationDashboard,
  OrganizationsProvider,
  EventSettingsPage,
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
      <Route path="/invitations/:invitationId" element={<AcceptInvitation />} />
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
          <Route path="/profile" element={<Profile />} />
          <Route element={<RequireCompleteProfile />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/invitations" element={<Invitations />} />

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
              <Route
                element={
                  <RequireOrganization
                    capability={ORGANIZATION_SECTIONS.activity.capability}
                  />
                }
              >
                <Route
                  path={ORGANIZATION_SECTIONS.activity.segment}
                  element={<OrganizationActivity />}
                />
              </Route>
              <Route
                element={
                  <RequireOrganization capability="organization:events:read" />
                }
              >
                <Route
                  path={ORGANIZATION_SECTIONS.events.segment}
                  element={<Events />}
                />
              </Route>
              <Route
                element={
                  <RequireOrganization capability="organization:events:create" />
                }
              >
                <Route path="events/new" element={<CreateEvent />} />
              </Route>
              <Route
                element={
                  <RequireOrganization capability="organization:events:read" />
                }
              >
                <Route
                  element={
                    <RequireOrganization capability="organization:events:update" />
                  }
                >
                  <Route
                    path="events/:eventId/settings"
                    element={<EventSettingsPage />}
                  />
                </Route>
              </Route>
            </Route>
          </Route>
        </Route>
      </Route>
    </Route>
  </Routes>
);
