import { Route, Routes } from 'react-router';

import { Home } from './pages/Home';
import { NotFound } from './pages/NotFound';
import { AppShell } from './components/layout/AppShell';

export const App = () => (
  <Routes>
    <Route element={<AppShell />}>
      <Route path="/" element={<Home />} />
      <Route path="*" element={<NotFound />} />
    </Route>
  </Routes>
);
