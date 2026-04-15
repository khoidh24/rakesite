import { getTranslations } from 'next-intl/server'

export default async function Home() {
  const t = await getTranslations('Dashboard')

  return (
    <div className="flex flex-col gap-6 p-6">
      <h1 className="text-xl font-bold tracking-tight">{t('title')}</h1>
    </div>
  )
}
