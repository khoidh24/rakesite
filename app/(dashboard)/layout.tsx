import Header from '@/components/header'
import AppSidebar from '@/components/sidebar'
import { SidebarProvider } from '@/components/ui/sidebar'
import { ReactNode } from 'react'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider
      style={{ '--sidebar-width': '13rem' } as React.CSSProperties}
      className="bg-sidebar"
    >
      <AppSidebar />
      <div className="flex h-svh flex-1 flex-col overflow-hidden">
        <Header />
        <div className="bg-sidebar relative flex-1 overflow-hidden md:pr-3 md:pb-3">
          <div
            className="pointer-events-none absolute top-0 left-0 z-10 size-5"
            style={{
              boxShadow: '-8px -8px 0 8px var(--sidebar)',
            }}
          />
          <div className="bg-background h-full overflow-y-auto shadow-[inset_0_0_16px_0px_rgba(0,0,0,0.12)] md:rounded-2xl">
            {children}
          </div>
        </div>
      </div>
    </SidebarProvider>
  )
}
