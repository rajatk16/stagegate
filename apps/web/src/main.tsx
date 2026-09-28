import { StrictMode } from "react";
import { ThemeProvider } from "next-themes";
import { BrowserRouter } from "react-router";
import { createRoot } from "react-dom/client";

import "@/style.css";
import { App } from '@/App';
import { AuthProvider } from "@/providers";
import { ErrorBoundary, SessionBoundary } from "@/layouts";

const rootElement = document.getElementById('app');

if (!rootElement) {
  throw new Error('Missing root element with id "app"');
}

createRoot(rootElement).render(
  <StrictMode>
    <ErrorBoundary scope="application">
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        storageKey="stagegate-theme"
        disableTransitionOnChange
      >
        <AuthProvider>
          <BrowserRouter>
            <SessionBoundary>
              <App />
            </SessionBoundary>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </StrictMode>
);
