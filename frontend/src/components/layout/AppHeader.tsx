import { Link, useLocation } from 'react-router-dom'
import UserAvatar from '@/components/layout/UserAvatar'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@/components/ui/navigation-menu'

export default function AppHeader() {
  const { pathname } = useLocation()
  function linkClass(path: string) {
    return pathname === path
      ? 'rounded-none px-0 py-0 font-medium text-white underline underline-offset-4 hover:bg-transparent hover:text-white focus:bg-transparent'
      : 'rounded-none px-0 py-0 text-slate-300 hover:bg-transparent hover:text-white focus:bg-transparent'
  }

  return (
    <header className="bg-slate-950 text-white">
      <div className="mx-auto flex h-16 max-w-5xl items-center gap-8 px-5 sm:px-8">
        <Link to="/home" className="shrink-0 text-lg font-bold tracking-tight">
          Conectando Social
        </Link>

        <nav aria-label="Navegação principal" className="font-sans text-sm">
          <NavigationMenu>
            <NavigationMenuList className="gap-6">
              <NavigationMenuItem>
                <NavigationMenuLink
                  render={<Link to="/home" />}
                  aria-current={pathname === '/home' ? 'page' : undefined}
                  className={linkClass('/home')}
                >
                  Vitrine
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink
                  render={<Link to="/meus-projetos" />}
                  aria-current={pathname === '/meus-projetos' ? 'page' : undefined}
                  className={linkClass('/meus-projetos')}
                >
                  Meus projetos
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </nav>

        <UserAvatar />
      </div>
    </header>
  )
}
