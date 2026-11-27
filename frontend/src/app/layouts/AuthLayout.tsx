import { Outlet, useLocation } from 'react-router-dom'
import AuthBrandPanel from '@/components/layout/AuthBrandPanel'
import { cn } from '@/lib/utils'

export default function AuthLayout() {
  const { pathname } = useLocation()
  const isCreateAccount = pathname === '/criar-conta'

  return (
    <main className="min-h-screen bg-white">
      <div className="grid min-h-screen w-full grid-cols-[3fr_2fr] bg-white">
        <AuthBrandPanel />
        <section
          className={cn(
            'flex justify-center bg-white px-12 py-16',
            isCreateAccount ? 'items-start' : 'items-center',
          )}
        >
          <div className="w-full max-w-90">
            <Outlet />
          </div>
        </section>
      </div>
    </main>
  )
}
