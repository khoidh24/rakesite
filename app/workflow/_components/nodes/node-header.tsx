'use client'

import { TaskRegistry } from '@/lib/workflow/task/registry'
import { TaskType } from '@/types/task'
import { useReactFlow } from '@xyflow/react'
import { CoinsIcon, GripVertical, Trash } from 'lucide-react'
import { useTranslations } from 'next-intl'

export default function NodeHeader({ taskType, nodeId }: { taskType: TaskType; nodeId: string }) {
  const t = useTranslations()
  const task = TaskRegistry[taskType]
  const { deleteElements } = useReactFlow()

  return (
    <div className="bg-muted/60 drag-handle relative flex cursor-grab items-center gap-4 rounded-t-2xl px-3 py-3">
      <task.icon />
      <span className="text-foreground min-w-0 flex-1 truncate text-xs font-bold tracking-wide uppercase">
        {t(task.labelKey)}
      </span>
      <div className="flex shrink-0 items-center gap-1.5">
        {task.isEntryPoint && (
          <span className="bg-primary text-primary-foreground rounded-full px-2.5 py-0.5 text-[11px] font-semibold">
            Entry point
          </span>
        )}
        <span className="bg-primary text-primary-foreground flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold">
          <CoinsIcon size={11} />
          {task.credits}
        </span>
      </div>
      {!task.isEntryPoint && (
        <button
          onClick={() => deleteElements({ nodes: [{ id: nodeId }] })}
          className="nodrag text-muted-foreground hover:text-destructive transition-colors"
        >
          <Trash className="size-3.5" />
        </button>
      )}
      <GripVertical className="text-muted-foreground/40 size-4 shrink-0" />
      <div className="absolute right-0 -bottom-2 left-0 h-2 bg-linear-to-b from-gray-400/15 to-transparent dark:hidden" />
    </div>
  )
}
