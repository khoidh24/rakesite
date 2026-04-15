'use client'

import { createWorkflow } from '@/actions/workflows/createWorkflow'
import { updateWorkflowMeta } from '@/actions/workflows/updateWorkflowMeta'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Workflow } from '@/prisma/generated/client'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

type FormValues = { name: string; description?: string }

const schema = (t: (k: string) => string) =>
  z.object({
    name: z.string().min(1, t('nameRequired')).max(50, t('nameMax')),
    description: z.string().max(200, t('descriptionMax')).optional(),
  })

function WorkflowForm({
  tKey,
  defaultValues,
  onSubmit,
  onClose,
}: {
  tKey: 'Workflows.create' | 'Workflows.edit'
  defaultValues?: FormValues
  onSubmit: (data: FormValues) => Promise<void>
  onClose: () => void
}) {
  const t = useTranslations(tKey)
  const tCommon = useTranslations('Common')
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema(t)),
    defaultValues,
  })

  useEffect(() => {
    if (defaultValues) reset(defaultValues)
  }, [defaultValues, reset])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">
          {t('nameLabel')} <span className="text-destructive">*</span>
        </label>
        <Input placeholder={t('namePlaceholder')} {...register('name')} />
        {errors.name && <p className="text-destructive text-xs">{errors.name.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">
          {t('descriptionLabel')}{' '}
          <span className="text-muted-foreground font-normal">{t('descriptionOptional')}</span>
        </label>
        <Textarea
          placeholder={t('descriptionPlaceholder')}
          rows={3}
          className="resize-none"
          {...register('description')}
        />
        {errors.description && (
          <p className="text-destructive text-xs">{errors.description.message}</p>
        )}
      </div>

      <DialogFooter showCloseButton closeLabel={tCommon('close')}>
        <Button type="submit" disabled={isSubmitting} className="min-w-24">
          {isSubmitting ? t('submitting') : t('submit')}
        </Button>
      </DialogFooter>
    </form>
  )
}

// ─── Create ───────────────────────────────────────────────────────────────────

export function CreateWorkflowDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const t = useTranslations('Workflows.create')
  const queryClient = useQueryClient()

  async function onSubmit(data: FormValues) {
    await createWorkflow(data)
    await queryClient.invalidateQueries({ queryKey: ['workflows'] })
    toast.success(t('successToast'))
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>
        <WorkflowForm
          tKey="Workflows.create"
          onSubmit={onSubmit}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}

// ─── Edit ─────────────────────────────────────────────────────────────────────

export function EditWorkflowDialog({
  workflow,
  open,
  onOpenChange,
  onSuccess,
}: {
  workflow: Workflow
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (name: string, description: string) => void
}) {
  const t = useTranslations('Workflows.edit')

  async function onSubmit(data: FormValues) {
    await updateWorkflowMeta({ id: workflow.id, name: data.name, description: data.description })
    toast.success(t('successToast'))
    onSuccess?.(data.name, data.description ?? '')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>
        <WorkflowForm
          tKey="Workflows.edit"
          defaultValues={{ name: workflow.name, description: workflow.description ?? '' }}
          onSubmit={onSubmit}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
