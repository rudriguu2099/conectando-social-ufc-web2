import { Outlet } from 'react-router-dom'
import AuthBrandPanel from '@/components/layout/AuthBrandPanel'

export default function AuthLayout() {
  return (
    <main className="min-h-screen bg-white">
      <div className="grid min-h-screen w-full grid-cols-[3fr_2fr] bg-white">
        <AuthBrandPanel />
        <section className="flex items-center justify-center bg-white px-12 py-16">
          <div className="w-full max-w-90">
            <Outlet />
          </div>
        </section>
      </div>
    </main>
  )
}
