import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';

import './lib/firebaseClient';
import { router } from './app/router';

import './index.css';
import { AuthProvider } from './app/providers';

const rootElement = document.getElementById('root');

if (rootElement === null) {
  throw new Error('The application root element was not found.');
}

createRoot(rootElement).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
);
