import './index.css'

import { setupApiClient } from '@repo/api-client/setup'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'
import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { Toaster } from 'sonner'
import { router } from './router'

// Aponta o axios (usado pelos hooks do Kubb) para a API + envia cookies.
setupApiClient(import.meta.env.VITE_API_URL ?? 'http://localhost:3333')

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false },
  },
})

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Elemento #root não encontrado')

ReactDOM.createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster position="top-center" richColors closeButton />
    </QueryClientProvider>
  </StrictMode>,
)
