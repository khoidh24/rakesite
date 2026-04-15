'use client'

import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { HandleColors } from '@/lib/workflow/handle-colors'
import { TaskRegistry } from '@/lib/workflow/task/registry'
import { AppNode } from '@/types/app-node'
import { TaskParam, TaskParamType, TaskType } from '@/types/task'
import { Handle, Position, useReactFlow } from '@xyflow/react'
import { useTranslations } from 'next-intl'

function StringInput({
  nodeId,
  inputName,
  variant,
  helperText,
}: {
  nodeId: string
  inputName: string
  variant?: 'textarea' | 'input'
  helperText?: string
}) {
  const { updateNodeData, getNode } = useReactFlow()
  const t = useTranslations('WorkflowEditor.inputs')
  const node = getNode(nodeId) as AppNode | undefined
  const value = node?.data.inputs[inputName] ?? ''

  if (variant === 'textarea') {
    return (
      <Textarea
        placeholder={t('enterValue')}
        value={value}
        rows={3}
        className="nodrag bg-background border-border mt-2 resize-none text-xs! shadow-xs"
        onChange={(e) =>
          updateNodeData(nodeId, {
            inputs: { ...node?.data.inputs, [inputName]: e.target.value },
          } as Partial<AppNode['data']>)
        }
      />
    )
  }

  return (
    <>
      <Input
        placeholder={t('enterValue')}
        value={value}
        className="nodrag bg-background border-border mt-2 h-9 text-xs! shadow-xs"
        onChange={(e) =>
          updateNodeData(nodeId, {
            inputs: { ...node?.data.inputs, [inputName]: e.target.value },
          } as Partial<AppNode['data']>)
        }
      />
      {helperText && <p className="text-muted-foreground mt-1 text-[11px]">{helperText}</p>}
    </>
  )
}

export default function NodeInputs({ nodeId, taskType }: { nodeId: string; taskType: TaskType }) {
  const task = TaskRegistry[taskType]
  const { getEdges, getNode } = useReactFlow()
  const t = useTranslations('WorkflowEditor.inputs')

  function isConnected(inputName: string) {
    return getEdges().some((e) => e.target === nodeId && e.targetHandle === inputName)
  }

  function getConnectedValue(inputName: string): string {
    const edge = getEdges().find((e) => e.target === nodeId && e.targetHandle === inputName)
    if (!edge) return ''
    const sourceNode = getNode(edge.source) as AppNode | undefined
    if (!sourceNode) return ''
    const sourceTask = TaskRegistry[sourceNode.data.type]
    const output = sourceTask.outputs?.find((o) => o.name === edge.sourceHandle)
    return output ? `← ${output.name}` : ''
  }

  return (
    <div className="bg-card flex flex-col divide-y rounded-b-2xl">
      {task.inputs.map((input: TaskParam) => {
        const connected = isConnected(input.name)

        return (
          <div key={input.name} className="relative px-3 py-3">
            {!input.hideHandle && (
              <Handle
                type="target"
                position={Position.Left}
                id={input.name}
                style={{ backgroundColor: HandleColors[input.type] }}
                className="size-3!"
              />
            )}

            <div className="flex items-center gap-1">
              <span className="text-foreground text-xs font-semibold">{input.name}</span>
              {input.required && <span className="text-destructive text-xs leading-none">*</span>}
            </div>

            {input.type === TaskParamType.STRING &&
              input.variant === 'textarea' &&
              (connected ? (
                <div className="bg-muted border-border text-muted-foreground mt-2 flex min-h-[72px] cursor-not-allowed items-center rounded-md border px-3 py-2 text-xs opacity-60 select-none">
                  {getConnectedValue(input.name)}
                </div>
              ) : (
                <StringInput nodeId={nodeId} inputName={input.name} variant="textarea" />
              ))}

            {input.type === TaskParamType.STRING && input.variant !== 'textarea' && (
              <StringInput nodeId={nodeId} inputName={input.name} helperText={input.helperText} />
            )}
          </div>
        )
      })}
    </div>
  )
}
