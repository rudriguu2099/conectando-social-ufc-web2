import { Menu } from '@base-ui/react/menu'
import { LogOut, UserRound } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { localStorageKeys } from '@/app/config/localStorageKeys'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { logout } from '@/features/auth/auth.service'
import { httpClient } from '@/service/httpClient'

export default function UserAvatar() {
  const [name, setName] = useState<string | null>(null)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [logoutError, setLogoutError] = useState<string | null>(null)
  const navigate = useNavigate()

  async function handleLogout() {
    if (isSigningOut) return
    setLogoutError(null)
    setIsSigningOut(true)
    try {
      await logout()
      navigate('/', { replace: true })
    } catch {
      setLogoutError('Não foi possível sair. Tente novamente.')
    } finally {
      setIsSigningOut(false)
    }
  }

  useEffect(() => {
    if (!localStorage.getItem(localStorageKeys.ACCESS_TOKEN)) return
    const controller = new AbortController()

    httpClient
      .get<{ name: string }>('/users/me', { signal: controller.signal })
      .then(({ data }) => {
        if (!controller.signal.aborted) setName(data.name)
      })
      .catch(() => {
        if (!controller.signal.aborted) setName(null)
      })

    return () => controller.abort()
  }, [])

  const words = name?.trim().split(/\s+/).filter(Boolean) ?? []
  const initials =
    words.length > 0
      ? `${words[0][0]}${words.length > 1 ? words[words.length - 1][0] : ''}`.toLocaleUpperCase(
          'pt-BR',
        )
      : null

  return (
    <div className="ml-auto">
      <Menu.Root>
        <Menu.Trigger
          aria-label={name ? `Conta de ${name}` : 'Menu da conta'}
          className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        >
          <Avatar className="bg-white font-sans text-slate-950">
            <AvatarFallback className="bg-white text-slate-950">
              {initials ?? <UserRound aria-hidden="true" className="size-4" />}
            </AvatarFallback>
          </Avatar>
        </Menu.Trigger>
        <Menu.Portal>
          <Menu.Positioner side="bottom" align="end" sideOffset={8} className="z-50">
            <Menu.Popup className="min-w-44 max-w-72 rounded-none border border-slate-200 bg-white p-1 font-sans text-sm text-slate-950 shadow-lg outline-none">
              {name && (
                <p className="break-words border-b border-slate-200 px-3 py-2 font-medium">
                  {name}
                </p>
              )}
              <Menu.Item
                onClick={handleLogout}
                disabled={isSigningOut}
                closeOnClick={false}
                className="flex cursor-pointer items-center gap-2 rounded-none px-3 py-2 outline-none data-highlighted:bg-slate-100 data-disabled:cursor-wait data-disabled:opacity-50"
              >
                <LogOut aria-hidden="true" className="size-4" />
                {isSigningOut ? 'Saindo...' : 'Sair'}
              </Menu.Item>
              {logoutError && (
                <p role="alert" className="px-3 py-2 text-red-700">
                  {logoutError}
                </p>
              )}
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>
    </div>
  )
}
