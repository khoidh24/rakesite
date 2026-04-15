import { ReactNode } from 'react'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <div className="bg-muted flex min-h-dvh items-center justify-center px-4">{children}</div>
}
