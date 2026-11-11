import { StrictMode } from 'react';
import { ThemeProvider } from 'next-themes';
import { BrowserRouter } from 'react-router';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { App } from './App';
import './index.css';
import { initializeStageGateAuth } from './lib/firebaseAuth';
import { AuthProvider } from './features/auth/provider/auth';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});

const auth = initializeStageGateAuth();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      storageKey="stagegate.theme"
      enableSystem
      enableColorScheme={false}
      scriptProps={{ type: 'text/plain' }}
    >
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider auth={auth}>
            <App />
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>,
);
