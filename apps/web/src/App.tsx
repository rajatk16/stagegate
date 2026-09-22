import { Route, Routes } from "react-router";

import { AuthForm } from "@/components/custom";
import { AppShell, RequireAuth } from "@/layouts";
import { Connection, NotFound, Overview } from "@/pages";

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
      
      <Route path="*" element={<NotFound />} />
    </Route>
  </Routes>    
);
