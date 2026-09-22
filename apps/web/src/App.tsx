import { Route, Routes } from "react-router";

import { AppShell } from "@/layouts";
import { Connection, NotFound, Overview } from "@/pages";
import { AuthForm } from "./components/custom";

export const App = () => (
  <Routes>
    <Route path="/" element={<AppShell />}>
      <Route index element={<Overview />} />
      <Route path="connection" element={<Connection />} />

      <Route 
        path="sign-in" 
        element={<AuthForm key="sign-in" mode="sign-in" />}
      />

      <Route 
        path="register"
        element={<AuthForm key="register" mode="register" />}
      />

      <Route path="*" element={<NotFound />} />
    </Route>
  </Routes>    
);
