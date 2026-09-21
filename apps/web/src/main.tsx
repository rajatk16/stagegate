import { StrictMode } from "react";
import { ThemeProvider } from "next-themes";
import { createRoot } from "react-dom/client";

import "@/style.css";
import App from '@/App';

const rootElement = document.getElementById('app');

if (!rootElement) {
  throw new Error('Missing root element with id "app"');
}

createRoot(rootElement).render(
  <StrictMode>
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      storageKey="stagegate-theme"
      disableTransitionOnChange
    >
      <App />
    </ThemeProvider>
  </StrictMode>
);
