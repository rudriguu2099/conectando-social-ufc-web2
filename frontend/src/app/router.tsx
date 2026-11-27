import { createBrowserRouter } from 'react-router-dom'
import AuthLayout from '@/app/layouts/AuthLayout'
import CriarConta from '@/pages/CriarConta'
import EntrarPage from '@/pages/EntrarPage'
import EsqueciSenhaPage from '@/pages/EsqueciSenhaPage'
import HomePage from '@/pages/HomePage'
import NotFoundPage from '@/pages/NotFoundPage'
import RedefinirSenhaPage from '@/pages/RedefinirSenhaPage'

export const router = createBrowserRouter([
  { path: '/home', element: <HomePage /> },
  {
    path: '/',
    element: <AuthLayout />,
    children: [
      { index: true, element: <EntrarPage /> },
      { path: 'criar-conta', element: <CriarConta /> },
      { path: 'esqueci-senha', element: <EsqueciSenhaPage /> },
      { path: 'redefinir-senha', element: <RedefinirSenhaPage /> },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])
