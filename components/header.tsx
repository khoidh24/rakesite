'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useSidebar } from '@/components/ui/sidebar'
import { ROUTES } from '@/constants/routes'
import {
  Bell,
  CreditCard,
  HelpCircle,
  LogOut,
  PanelLeft,
  PanelRight,
  Settings,
  User,
} from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'

function getInitials(name?: string | null) {
  if (!name) return '?'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export default function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const { state, toggleSidebar } = useSidebar()
  const { data: session } = useSession()
  const tRoutes = useTranslations('Routes')
  const t = useTranslations('Header')
  const user = session?.user
  const current = ROUTES.find(
    (r) => pathname === `/${r.href}` || (r.href === '' && pathname === '/')
  )

  return (
    <header className="bg-sidebar flex h-14 shrink-0 items-center gap-3 pr-4">
      <button
        onClick={toggleSidebar}
        className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex size-8 items-center justify-center rounded-xl transition-colors"
        aria-label="Toggle sidebar"
      >
        {state === 'expanded' ? (
          <PanelLeft className="size-4" />
        ) : (
          <PanelRight className="size-4" />
        )}
      </button>

      <span className="text-sidebar-foreground text-sm font-semibold">
        {current ? tRoutes(current.labelKey) : tRoutes('home')}
      </span>

      <div className="ml-auto flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger className="ring-offset-background focus-visible:ring-ring cursor-pointer rounded-full outline-none focus-visible:ring-2 focus-visible:ring-offset-2">
            <Avatar size="sm">
              <AvatarImage src={user?.image ?? ''} alt={user?.name ?? ''} />
              <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>

          <DropdownMenuContent side="bottom" align="end" sideOffset={8}>
            <div className="flex items-center gap-3 px-3 py-2.5">
              <Avatar size="default">
                <AvatarImage src={user?.image ?? ''} alt={user?.name ?? ''} />
                <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-foreground text-sm font-semibold">{user?.name}</span>
                <span className="text-muted-foreground text-xs">{user?.email}</span>
              </div>
            </div>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem>
                <User />
                {t('profile')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/settings')}>
                <Settings />
                {t('settings')}
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell />
                {t('notifications')}
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCard />
                {t('billing')}
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem>
                <HelpCircle />
                {t('helpSupport')}
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => signOut({ callbackUrl: '/login' })}
              >
                <LogOut />
                {t('logOut')}
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
