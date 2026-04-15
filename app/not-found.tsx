import { buttonVariants } from '@/components/ui/button'
import { getTranslations } from 'next-intl/server'

export default async function NotFound() {
  const t = await getTranslations('NotFound')

  return (
    <div className="relative flex h-dvh min-h-dvh flex-col items-center justify-center overflow-hidden px-6 select-none">
      <span
        aria-hidden
        className="text-muted/60 pointer-events-none absolute inset-0 flex items-center justify-center text-[22vw] leading-none font-black tracking-tighter"
      >
        {t('code')}
      </span>
      <div className="relative z-10 flex flex-col items-center gap-6 text-center">
        <div className="flex flex-col gap-2">
          <p className="text-muted-foreground text-xs font-semibold tracking-[0.2em] uppercase">
            {t('badge')}
          </p>
          <h1 className="text-foreground text-4xl font-black tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground max-w-sm text-sm">{t('description')}</p>
        </div>

        <a href="/" className={buttonVariants()}>
          {t('cta')}
        </a>
      </div>

      {/* Decorative blobs */}
      <div
        aria-hidden
        className="bg-primary/10 pointer-events-none absolute -top-32 -left-32 size-96 rounded-full blur-3xl"
      />
      <div
        aria-hidden
        className="bg-primary/10 pointer-events-none absolute -right-32 -bottom-32 size-96 rounded-full blur-3xl"
      />
    </div>
  )
}
