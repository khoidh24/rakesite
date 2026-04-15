'use client'

import { Button, buttonVariants } from '@/components/ui/button'
import { useTranslations } from 'next-intl'
import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const t = useTranslations('Error')

  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="relative flex h-dvh min-h-dvh flex-col items-center justify-center overflow-hidden px-6 select-none">
      <span
        aria-hidden
        className="text-muted/60 pointer-events-none absolute inset-0 flex items-center justify-center text-[18vw] leading-none font-black tracking-tighter uppercase"
      >
        {t('code')}
      </span>

      <div className="relative z-10 flex flex-col items-center gap-6 text-center">
        <div className="flex flex-col items-center justify-center gap-2">
          <p className="text-muted-foreground text-xs font-semibold tracking-[0.2em] uppercase">
            {t('badge')}
          </p>
          <h1 className="text-foreground text-4xl font-black tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground max-w-sm text-sm">{t('description')}</p>
          {error.digest && (
            <p className="text-muted-foreground/60 mt-1 font-mono text-xs">
              {t('digest')}: {error.digest}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={reset}>{t('cta')}</Button>
          <a href="/" className={buttonVariants({ variant: 'outline' })}>
            {t('homeCta')}
          </a>
        </div>
      </div>

      <div
        aria-hidden
        className="bg-destructive/10 pointer-events-none absolute -top-32 -right-32 size-96 rounded-full blur-3xl"
      />
      <div
        aria-hidden
        className="bg-primary/10 pointer-events-none absolute -bottom-32 -left-32 size-96 rounded-full blur-3xl"
      />
    </div>
  )
}
