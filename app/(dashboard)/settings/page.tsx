'use client'

import { setLocale } from '@/actions/settings/setLocale'
import { useTheme } from 'next-themes'
import { useLocale, useTranslations } from 'next-intl'
import { Monitor, Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTransition, useEffect, useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const THEMES = [
  { value: 'light', icon: Sun },
  { value: 'dark', icon: Moon },
  { value: 'system', icon: Monitor },
] as const

export default function SettingsPage() {
  const t = useTranslations('Settings')
  const { theme, setTheme } = useTheme()
  const locale = useLocale()
  const [isPending, startTransition] = useTransition()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  function handleLocale(value: string | null) {
    if (!value) return
    startTransition(async () => {
      await setLocale(value)
      window.location.reload()
    })
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 p-6">
      <div>
        <h1 className="text-foreground text-xl font-semibold">{t('title')}</h1>
        <p className="text-muted-foreground mt-1 text-sm">{t('description')}</p>
      </div>

      {/* Appearance */}
      <section className="space-y-3">
        <div>
          <h2 className="text-foreground text-sm font-medium">{t('appearance.title')}</h2>
          <p className="text-muted-foreground text-xs">{t('appearance.description')}</p>
        </div>
        <div className="flex gap-3">
          {THEMES.map(({ value, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setTheme(value)}
              className={cn(
                'flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm transition-colors',
                mounted && theme === value
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-border text-muted-foreground hover:border-primary/50'
              )}
            >
              <Icon className="size-4" />
              {t(`appearance.${value}`)}
            </button>
          ))}
        </div>
      </section>

      {/* Language */}
      <section className="space-y-3">
        <div>
          <h2 className="text-foreground text-sm font-medium">{t('language.title')}</h2>
          <p className="text-muted-foreground text-xs">{t('language.description')}</p>
        </div>
        <Select value={locale} onValueChange={handleLocale} disabled={isPending}>
          <SelectTrigger className="w-full">
            <SelectValue>{t(`language.${locale}`)}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">{t('language.en')}</SelectItem>
            <SelectItem value="vi">{t('language.vi')}</SelectItem>
          </SelectContent>
        </Select>
      </section>
    </div>
  )
}
