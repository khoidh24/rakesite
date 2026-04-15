'use client'

import { getWorkflowsForUser } from '@/actions/workflows/getWorkflowsForUser'
import { Button } from '@/components/ui/button'
import { useQuery } from '@tanstack/react-query'
import { AlertCircle, Layers, Plus } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { WorkflowTable } from './workflow-table'
import { WorkflowTableSkeleton } from './workflow-table-skeleton'

export function WorkflowList({ onNew }: { onNew?: () => void }) {
  const t = useTranslations('Workflows')
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['workflows'],
    queryFn: () => getWorkflowsForUser(),
  })

  if (isLoading) return <WorkflowTableSkeleton />

  if (isError) {
    return (
      <div className="border-destructive/40 flex flex-col items-center justify-center gap-4 rounded-xl border py-16 text-center">
        <AlertCircle className="text-destructive size-10" />
        <div className="flex flex-col gap-1">
          <p className="text-foreground font-semibold">{t('error.title')}</p>
          <p className="text-muted-foreground text-sm">{t('error.description')}</p>
          {error && (
            <p className="text-destructive font-mono text-xs">{(error as Error).message}</p>
          )}
        </div>
        <Button variant="outline" onClick={() => refetch()}>
          {t('error.cta')}
        </Button>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed py-16 text-center">
        <div className="bg-primary flex size-14 items-center justify-center rounded-full">
          <Layers className="text-muted-foreground dark:text-muted size-6" />
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-foreground font-semibold">{t('empty.title')}</p>
          <p className="text-muted-foreground text-sm">{t('empty.description')}</p>
        </div>
        <Button onClick={onNew}>
          <Plus className="size-4" />
          {t('empty.cta')}
        </Button>
      </div>
    )
  }

  return <WorkflowTable data={data} />
}
