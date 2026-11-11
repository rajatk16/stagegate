import { Link, Route, Routes } from 'react-router';

import { Home } from './pages/Home';
import { NotFound } from './pages/NotFound';
import { ThemeSelect } from './components/ThemeSelect';

export const App = () => (
  <>
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-10 focus:rounded-lg focus:bg-background focus:px-4 focus:py-3 focus:ring-2 focus:ring-ring"
    >
      Skip to content
    </a>
    <header className="border-b bg-card">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link
          className="inline-flex min-h-11 items-center font-semibold"
          to="/"
        >
          StageGate
        </Link>
        <ThemeSelect />
      </div>
    </header>
    <main
      id="main-content"
      tabIndex={-1}
      className="mx-auto min-w-0 max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8"
    >
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </main>
  </>
);
