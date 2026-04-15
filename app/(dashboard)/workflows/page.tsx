'use client'

import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { use, useState } from 'react'
import { CreateWorkflowDialog } from '@/components/workflow-dialog'
import { WorkflowList } from './_components/workflow-list'

export default function WorkflowsPage({
  searchParams,
}: {
  searchParams: Promise<{ create?: string }>
}) {
  const params = use(searchParams)
  const [open, setOpen] = useState(params.create === 'true')
  const t = useTranslations('Workflows.page')

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground text-sm">{t('description')}</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="size-4" />
          {t('newWorkflow')}
        </Button>
      </div>

      <WorkflowList onNew={() => setOpen(true)} />

      <CreateWorkflowDialog open={open} onOpenChange={setOpen} />
    </div>
  )
}
