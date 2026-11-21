import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from '@/app/router'
import './index.css'

import { Button } from "@/components/ui/button"

import { useEffect, useState } from 'react'

export default function App() {

 
  return (
    <RouterProvider router={router} />
  )
}
