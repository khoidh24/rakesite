'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { HandleColors } from '@/lib/workflow/handle-colors'
import { TaskParamType } from '@/types/task'
import { Handle, Position, useReactFlow } from '@xyflow/react'
import { Plus, Trash2 } from 'lucide-react'
import { AppNode } from '@/types/app-node'
import { cn } from '@/lib/utils'

interface MergeEntry {
  id: string
  key: string
  label: string
  required: boolean
  inputId: string
}

function getEntries(node: AppNode | undefined): MergeEntry[] {
  try {
    const raw = node?.data.inputs['__entries']
    return raw
      ? JSON.parse(raw)
      : [{ id: '1', key: '', label: '', required: false, inputId: 'input_1' }]
  } catch {
    return [{ id: '1', key: '', label: '', required: false, inputId: 'input_1' }]
  }
}

export default function MergeJsonNode({ nodeId }: { nodeId: string }) {
  const { getNode, updateNodeData } = useReactFlow()
  const node = getNode(nodeId) as AppNode | undefined
  const entries = getEntries(node)

  function save(updated: MergeEntry[]) {
    updateNodeData(nodeId, {
      inputs: { ...node?.data.inputs, __entries: JSON.stringify(updated) },
    } as Partial<AppNode['data']>)
  }

  function addEntry() {
    const newId = Date.now().toString()
    save([
      ...entries,
      { id: newId, key: '', label: '', required: false, inputId: `input_${newId}` },
    ])
  }

  function removeEntry(id: string) {
    save(entries.filter((e) => e.id !== id))
  }

  function update(id: string, patch: Partial<MergeEntry>) {
    save(entries.map((e) => (e.id === id ? { ...e, ...patch } : e)))
  }

  return (
    <div className="bg-card flex flex-col divide-y rounded-b-2xl">
      {entries.map((entry) => (
        <div key={entry.id} className="relative px-3 py-3">
          {/* Handle */}
          <Handle
            type="target"
            position={Position.Left}
            id={entry.inputId}
            style={{ backgroundColor: HandleColors[TaskParamType.STRING] }}
            className="size-3!"
          />

          {/* Label row */}
          <div className="mb-2 flex items-center justify-between gap-1">
            <div className="flex items-center gap-1">
              <Input
                placeholder="label"
                value={entry.label}
                className="nodrag h-5 w-28 border-none bg-transparent p-0 text-xs! font-semibold shadow-none focus-visible:ring-0"
                onChange={(e) => update(entry.id, { label: e.target.value })}
              />
              <button
                onClick={() => update(entry.id, { required: !entry.required })}
                className={cn(
                  'nodrag text-xs leading-none transition-colors',
                  entry.required
                    ? 'text-destructive'
                    : 'text-muted-foreground/40 hover:text-muted-foreground'
                )}
                title="Toggle required"
              >
                *
              </button>
            </div>
            <button
              onClick={() => removeEntry(entry.id)}
              className="nodrag text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash2 className="size-3" />
            </button>
          </div>

          {/* Key input */}
          <Input
            placeholder="json key"
            value={entry.key}
            className="nodrag bg-background border-border h-9 text-xs! shadow-xs"
            onChange={(e) => update(entry.id, { key: e.target.value })}
          />
        </div>
      ))}

      <div className="px-3 py-2">
        <Button
          variant="ghost"
          size="sm"
          className="nodrag h-7 w-full gap-1.5 text-xs"
          onClick={addEntry}
        >
          <Plus className="size-3.5" />
          Add field
        </Button>
      </div>
    </div>
  )
}
