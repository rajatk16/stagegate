import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'

import { router } from './routes'
import { AppQueryProvider } from './providers/queryProvider'

import "@fontsource/inter";
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppQueryProvider>
      <RouterProvider router={router} />
    </AppQueryProvider>
  </StrictMode>,
);
