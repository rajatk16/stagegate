import { Navigate, Route, Routes } from "react-router";

import { AuthForm } from "@/components/custom";
import {
  AppShell,
  RequireAuth,
  PublicLayout,
  AuthLayout,
  SessionBoundary,
} from "@/layouts";
import {
  Landing,
  Profile,
  NotFound,
  Dashboard,
  EmailAction,
  VerifyEmail,
  ForgotPassword,
} from "@/pages";

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
      <Route element={<AppShell />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
    </Route>

    <Route path="/connection" element={<Navigate to="/dashboard" replace />} />
  </Routes>
);
