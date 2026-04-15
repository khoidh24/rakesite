'use client'

import { updateWorkflow } from '@/actions/workflows/updateWorkflow'
import { runWorkflow } from '@/actions/workflows/runWorkflow'
import { Button } from '@/components/ui/button'
import { EditWorkflowDialog } from '@/components/workflow-dialog'
import ThemeToggle from '@/components/theme-toggle'
import { Workflow } from '@/prisma/generated/client'
import { useReactFlow } from '@xyflow/react'
import { ArrowLeft, CheckIcon, Clock, Loader2, Pencil, Play, SaveIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { useEditorContext } from './editor-context'
import { cn } from '@/lib/utils'

export default function EditorHeader({ workflow }: { workflow: Workflow }) {
  const router = useRouter()
  const { toObject } = useReactFlow()
  const [isPending, startTransition] = useTransition()
  const [editOpen, setEditOpen] = useState(false)
  const [meta, setMeta] = useState({ name: workflow.name, description: workflow.description ?? '' })
  const { isDirty, setDirty } = useEditorContext()

  function handleSave() {
    startTransition(async () => {
      try {
        const definition = JSON.stringify(toObject())
        await updateWorkflow({ id: workflow.id, definition })
        setDirty(false)
        toast.success('Workflow saved')
      } catch {
        toast.error('Failed to save workflow')
      }
    })
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        if (!isPending) handleSave()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isPending, isDirty])

  return (
    <>
      <header className="bg-sidebar flex h-14 shrink-0 items-center justify-between px-4">
        {/* Left */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/workflows')}
            className="text-sidebar-foreground hover:bg-sidebar-accent size-8"
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div className="flex flex-col">
            <span className="text-sidebar-foreground text-sm leading-tight font-semibold">
              {meta.name}
            </span>
            {meta.description && (
              <span className="text-sidebar-foreground/60 text-xs leading-tight">
                {meta.description}
              </span>
            )}
          </div>
          <Button variant="ghost" size="icon" className="size-7" onClick={() => setEditOpen(true)}>
            <Pencil className="size-3.5" />
          </Button>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

          {/* History button */}
          <Button
            variant="ghost"
            size="icon"
            className="text-sidebar-foreground hover:bg-sidebar-accent size-8"
            onClick={() => router.push(`/workflow/executions/${workflow.id}`)}
          >
            <Clock className="size-4" />
          </Button>

          {/* Save button */}
          <Button
            size="sm"
            variant={isDirty ? 'default' : 'outline'}
            onClick={handleSave}
            disabled={isPending}
            className={cn('min-w-20 gap-1.5', !isDirty && 'text-muted-foreground')}
          >
            {isPending ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : isDirty ? (
              <SaveIcon className="size-3.5" />
            ) : (
              <CheckIcon className="size-3.5" />
            )}
            {isDirty ? 'Save' : 'Saved'}
          </Button>

          {/* Run button */}
          <Button
            size="sm"
            disabled={isDirty}
            className="gap-1.5"
            onClick={() => runWorkflow({ workflowId: workflow.id })}
          >
            <Play className="size-3.5" />
            Run
          </Button>
        </div>
      </header>

      <EditWorkflowDialog
        workflow={{ ...workflow, ...meta }}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSuccess={(name, description) => setMeta({ name, description })}
      />
    </>
  )
}
