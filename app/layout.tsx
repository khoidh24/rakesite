import NextAuthSessionProvider from '@/components/session-provider'
import QueryProvider from '@/components/query-provider'
import { cn } from '@/lib/utils'
import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { ThemeProvider } from 'next-themes'
import { Noto_Sans } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'
import { TooltipProvider } from '@/components/ui/tooltip'

const notoSans = Noto_Sans({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'Rakesite',
  description: 'Rakesite dashboard',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const messages = await getMessages()

  return (
    <html
      lang="en"
      className={cn('h-full', 'antialiased', 'font-sans', notoSans.variable)}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        <NextAuthSessionProvider>
          <QueryProvider>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              <NextIntlClientProvider messages={messages}>
                <TooltipProvider>{children}</TooltipProvider>
                <Toaster position="bottom-right" />
              </NextIntlClientProvider>
            </ThemeProvider>
          </QueryProvider>
        </NextAuthSessionProvider>
      </body>
    </html>
  )
}
