import { createBrowserRouter } from 'react-router-dom'
import AppLayout from '@/app/layouts/AppLayout'
import HomePage from '@/pages/HomePage'
import NotFoundPage from '@/pages/NotFoundPage'
import CriarConta from '@/pages/CriarConta'

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '*', element: <NotFoundPage /> },
      { path: '/criar-conta', element: <CriarConta /> },
    ],
  },
])