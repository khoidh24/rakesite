'use client'

import { archiveWorkflow } from '@/actions/workflows/archiveWorkflow'
import { updateWorkflowCron } from '@/actions/workflows/updateWorkflowCron'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { EditWorkflowDialog } from '@/components/workflow-dialog'
import { Workflow } from '@/prisma/generated/client'
import { useQueryClient } from '@tanstack/react-query'
import { Clock, MoreHorizontal, Pencil, Trash } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { toast } from 'sonner'

export function WorkflowRowActions({ workflow }: { workflow: Workflow }) {
  const t = useTranslations('Workflows.actions')
  const queryClient = useQueryClient()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [cronOpen, setCronOpen] = useState(false)
  const [cronValue, setCronValue] = useState(workflow.cron ?? '')
  const [loading, setLoading] = useState(false)
  const [inputValue, setInputValue] = useState('')

  const isMatch = inputValue.trim() === workflow.name.trim()

  function handleOpen() {
    setInputValue('')
    setConfirmOpen(true)
  }

  async function handleConfirm() {
    setLoading(true)
    try {
      await archiveWorkflow(workflow.id)
      await queryClient.invalidateQueries({ queryKey: ['workflows'] })
      toast.success(t('archiveSuccess'))
      setConfirmOpen(false)
    } catch {
      toast.error(t('archiveError'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger
            render={
              <DropdownMenuTrigger
                render={<Button variant="ghost" size="icon-sm" className="cursor-pointer" />}
              />
            }
          >
            <MoreHorizontal className="size-4" />
          </TooltipTrigger>
          <TooltipContent>{t('moreOptions')}</TooltipContent>
        </Tooltip>
        <DropdownMenuContent side="bottom" align="end">
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => setEditOpen(true)} className="cursor-pointer">
              <Pencil />
              {t('edit')}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setCronValue(workflow.cron ?? '')
                setCronOpen(true)
              }}
              className="cursor-pointer"
            >
              <Clock />
              Schedule
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem variant="destructive" onClick={handleOpen} className="cursor-pointer">
              <Trash />
              {t('archive')}
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditWorkflowDialog
        workflow={workflow}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['workflows'] })}
      />

      {/* Cron dialog */}
      <Dialog open={cronOpen} onOpenChange={setCronOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule workflow</DialogTitle>
            <DialogDescription className="text-xs">
              Set a cron expression to run this workflow automatically. Leave empty to disable.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-1.5">
            <Label>Cron expression</Label>
            <Input
              placeholder="eg: 0 9 * * 1-5 (weekdays at 9am)"
              value={cronValue}
              onChange={(e) => setCronValue(e.target.value)}
            />
            <p className="text-muted-foreground text-[11px]">
              Format: minute hour day month weekday — use{' '}
              <a href="https://crontab.guru" target="_blank" rel="noreferrer" className="underline">
                crontab.guru
              </a>{' '}
              to build expressions
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCronOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={async () => {
                setLoading(true)
                try {
                  await updateWorkflowCron({ id: workflow.id, cron: cronValue })
                  await queryClient.invalidateQueries({ queryKey: ['workflows'] })
                  toast.success(cronValue ? 'Schedule saved' : 'Schedule removed')
                  setCronOpen(false)
                } catch (e) {
                  toast.error((e as Error).message)
                } finally {
                  setLoading(false)
                }
              }}
              disabled={loading}
            >
              {loading ? '...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('archiveConfirmTitle')}</DialogTitle>
            <DialogDescription className="mt-4 text-xs">
              {t('archiveConfirmDescription')}{' '}
              <strong className="text-foreground">{workflow.name}</strong>{' '}
              {t('forConfirmation_txt')}.
            </DialogDescription>
          </DialogHeader>

          <Input
            placeholder={t('archiveInputPlaceholder')}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <DialogFooter>
            <Button
              variant="outline"
              className="min-w-24"
              onClick={() => setConfirmOpen(false)}
              disabled={loading}
            >
              {t('archiveCancel')}
            </Button>
            <Button
              variant="destructive"
              className="min-w-24"
              onClick={handleConfirm}
              disabled={loading || !isMatch}
            >
              {loading ? '...' : t('archiveConfirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
