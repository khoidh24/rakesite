'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { TaskRegistry } from '@/lib/workflow/task/registry'
import { TaskCategory, TaskDefinition, TaskType } from '@/types/task'
import { useTranslations } from 'next-intl'
import { useRef, useState } from 'react'

const EXCLUDED: TaskType[] = [TaskType.LAUNCH_BROWSER]

function TaskButton({ task }: { task: TaskDefinition }) {
  const t = useTranslations()

  function onDragStart(e: React.DragEvent) {
    e.dataTransfer.setData('application/reactflow', task.type)
    e.dataTransfer.effectAllowed = 'move'
  }

  return (
    <Button
      variant="ghost"
      className="w-full justify-start gap-2 overflow-hidden text-xs [&_svg]:text-inherit"
      draggable
      onDragStart={onDragStart}
    >
      <task.icon />
      <span className="truncate">{t(task.labelKey)}</span>
    </Button>
  )
}

const CATEGORY_ORDER = [TaskCategory.BROWSER, TaskCategory.DATA_EXTRACTION]

export default function TaskMenu() {
  const t = useTranslations('WorkflowEditor.taskMenu')
  const [width, setWidth] = useState(224)
  const isResizing = useRef(false)

  const grouped = CATEGORY_ORDER.reduce<Record<TaskCategory, TaskDefinition[]>>(
    (acc, cat) => ({ ...acc, [cat]: [] }),
    {} as Record<TaskCategory, TaskDefinition[]>
  )

  Object.values(TaskRegistry).forEach((task) => {
    if (!EXCLUDED.includes(task.type)) grouped[task.category]?.push(task)
  })

  function onMouseDown(e: React.MouseEvent) {
    isResizing.current = true
    const startX = e.clientX
    const startWidth = width

    function onMouseMove(e: MouseEvent) {
      if (!isResizing.current) return
      const newWidth = Math.max(160, Math.min(400, startWidth + e.clientX - startX))
      setWidth(newWidth)
    }

    function onMouseUp() {
      isResizing.current = false
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  }

  return (
    <aside
      style={{ width }}
      className="bg-sidebar relative flex h-full shrink-0 flex-col overflow-y-auto"
    >
      <div className="p-3">
        <Accordion
          multiple
          defaultValue={[TaskCategory.DATA_EXTRACTION]}
          className="w-full rounded-none border-none"
        >
          {CATEGORY_ORDER.filter((cat) => grouped[cat].length > 0).map((category) => (
            <AccordionItem
              key={category}
              value={category}
              className="border-none bg-transparent data-open:bg-transparent"
            >
              <AccordionTrigger className="px-1 py-1.5 text-xs font-medium hover:no-underline">
                {t(`categories.${category}`)}
              </AccordionTrigger>
              <AccordionContent className="flex flex-col gap-0.5 pb-2">
                {grouped[category].map((task) => (
                  <div key={task.type} className="-mx-4">
                    <TaskButton task={task} />
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      {/* Resize handle */}
      <div
        onMouseDown={onMouseDown}
        className="hover:bg-primary/30 absolute top-0 right-0 h-full w-1 cursor-col-resize transition-colors"
      />
    </aside>
  )
}
