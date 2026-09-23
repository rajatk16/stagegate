import { Route, Routes } from "react-router";

import { AuthForm } from "@/components/custom";
import { AppShell, RequireAuth } from "@/layouts";
import { Connection, EmailAction, ForgotPassword, NotFound, Overview, VerifyEmail } from "@/pages";

export const App = () => (
  <Routes>
    <Route path="/" element={<AppShell />}>
      <Route 
        path="sign-in" 
        element={<AuthForm key="sign-in" mode="sign-in" />}
      />

      <Route 
        path="register"
        element={<AuthForm key="register" mode="register" />}
      />

      <Route element={<RequireAuth />}>
        <Route index element={<Overview />} />
        <Route path="connection" element={<Connection />} />
      </Route>

      <Route path="verify-email" element={<VerifyEmail />} />
      <Route path="forgot-password" element={<ForgotPassword />} />
      <Route path="auth/action" element={<EmailAction />} />
      
      <Route path="*" element={<NotFound />} />
    </Route>
  </Routes>    
);
