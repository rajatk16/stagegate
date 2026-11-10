import { Link, Route, Routes } from 'react-router';

import { Home } from './pages/Home';
import { NotFound } from './pages/NotFound';

export const App = () => (
  <>
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-10 focus:rounded-lg focus:bg-background focus:px-4 focus:py-3 focus:ring-2 focus:ring-ring"
    >
      Skip to content
    </a>
    <header className="border-b bg-card">
      <div className="mx-auto max-w-full px-6 py-4">
        <Link className="font-semibold" to="/">
          StageGatea
        </Link>
      </div>
    </header>
    <main
      id="main-content"
      tabIndex={-1}
      className="mx-auto max-w-full px-6 py-12"
    >
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </main>
  </>
);
