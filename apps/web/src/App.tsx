import { Route, Routes } from "react-router";

import { AppShell } from "@/layouts";
import { Connection, NotFound, Overview } from "@/pages";

export const App = () => (
  <Routes>
    <Route path="/" element={<AppShell />}>
      <Route index element={<Overview />} />
      <Route path="connection" element={<Connection />} />
      <Route path="*" element={<NotFound />} />
    </Route>
  </Routes>    
);
