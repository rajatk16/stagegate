import { Route, Routes } from 'react-router';

import { Home } from './pages/Home';
import { NotFound } from './pages/NotFound';
import { Workspace } from './pages/Workspace';
import { AppShell } from './components/layout/AppShell';
import { Account } from './features/auth/pages/Account';
import { AuthGate } from './features/auth/components/AuthGate';
import { Credentials } from './features/auth/pages/Credentials';
import { VerifyEmail } from './features/auth/pages/VerifyEmail';
import { ForgotPassword } from './features/auth/pages/ForgotPassword';
import { ChangePassword } from './features/auth/pages/ChangePassword';

export const App = () => (
  <Routes>
    <Route element={<AppShell />}>
      <Route index element={<Home />} />
      <Route element={<AuthGate audience="guest" />}>
        <Route
          path="sign-in"
          element={<Credentials key="sign-in" mode="sign-in" />}
        />
        <Route
          path="sign-up"
          element={<Credentials key="sign-up" mode="signup" />}
        />
        <Route path="forgot-password" element={<ForgotPassword />} />
      </Route>

      <Route path="verify-email" element={<VerifyEmail />} />
      <Route element={<AuthGate audience="active" />}>
        <Route path="app" element={<Workspace />} />
        <Route path="app/account" element={<Account />} />
        <Route path="app/account/password" element={<ChangePassword />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Route>
  </Routes>
);
