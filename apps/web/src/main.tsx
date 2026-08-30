import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';

import './lib/firebaseClient';
import { router } from './app/router';

import './index.css';

const rootElement = document.getElementById('root');

if (rootElement === null) {
  throw new Error('The application root element was not found.');
}

createRoot(rootElement).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
