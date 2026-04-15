'use client'

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { ROUTES } from '@/constants/routes'
import { Layers } from 'lucide-react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'

export default function AppSidebar() {
  const pathname = usePathname()
  const t = useTranslations('Routes')

  return (
    <Sidebar collapsible="icon" className="bg-sidebar border-none shadow-none">
      {/* App icon/logo — luôn center */}
      <SidebarHeader className="h-14 flex-row items-center justify-center px-3">
        <div className="flex items-center gap-2 group-data-[state=collapsed]:justify-center">
          <Layers className="text-primary size-5 shrink-0" />
          <span className="text-sidebar-foreground font-semibold group-data-[state=collapsed]:hidden">
            Rakesite
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {ROUTES.map(({ href, labelKey, icon: Icon }) => {
                const path = `/${href}`
                const isActive = pathname === path || (href === '' && pathname === '/')
                const label = t(labelKey)
                return (
                  <SidebarMenuItem key={href}>
                    <SidebarMenuButton
                      isActive={isActive}
                      tooltip={label}
                      render={<Link href={path} prefetch={false} />}
                      className={
                        isActive
                          ? 'bg-primary! text-primary-foreground! hover:bg-primary/90!'
                          : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                      }
                    >
                      <Icon />
                      <span>{label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
