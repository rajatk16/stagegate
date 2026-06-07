import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AppQueryProvider } from './providers/queryProvider'
import { RouterProvider } from 'react-router-dom'
import { router } from './routes'

import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppQueryProvider>
      <RouterProvider router={router} />
    </AppQueryProvider>
  </StrictMode>,
);
