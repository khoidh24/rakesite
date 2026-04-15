'use client'

import { Badge } from '@/components/ui/badge'
import { ExecutionStatus } from '@/prisma/generated/enums'
import { ExecutionLog, WorkflowExecution, WorkflowExecutionPhase } from '@/prisma/generated/client'
import { TaskRegistry } from '@/lib/workflow/task/registry'
import { AppNode } from '@/types/app-node'
import { TaskType } from '@/types/task'
import { useTranslations } from 'next-intl'
import { ArrowLeft, CheckCircle2, Circle, Clock, Loader2, XCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { cn } from '@/lib/utils'
import { useCallback, useEffect, useRef, useState } from 'react'

dayjs.extend(relativeTime)

type ExecutionWithPhases = WorkflowExecution & {
  workflow: { name: string }
  phases: WorkflowExecutionPhase[]
}

type PhaseWithLogs = WorkflowExecutionPhase & { logs: ExecutionLog[] }

const STATUS_CONFIG = {
  [ExecutionStatus.pending]: {
    icon: <Circle className="text-muted-foreground size-4" />,
    badge: 'bg-muted text-muted-foreground',
    label: 'Pending',
  },
  [ExecutionStatus.running]: {
    icon: <Loader2 className="text-primary size-4 animate-spin" />,
    badge: 'bg-primary/10 text-primary',
    label: 'Running',
  },
  [ExecutionStatus.completed]: {
    icon: <CheckCircle2 className="size-4 text-emerald-500" />,
    badge: 'bg-emerald-500/10 text-emerald-500',
    label: 'Completed',
  },
  [ExecutionStatus.failed]: {
    icon: <XCircle className="text-destructive size-4" />,
    badge: 'bg-destructive/10 text-destructive',
    label: 'Failed',
  },
}

const LOG_LEVEL_STYLE = {
  info: 'text-sidebar-foreground/70',
  error: 'text-destructive',
}

function PhaseRow({
  phase,
  selected,
  onClick,
}: {
  phase: WorkflowExecutionPhase
  selected: boolean
  onClick: () => void
}) {
  const t = useTranslations()
  const node = JSON.parse(phase.node) as AppNode
  const task = TaskRegistry[node.data.type as TaskType]
  const status = STATUS_CONFIG[phase.status]

  return (
    <button
      onClick={onClick}
      className={cn(
        'border-border/50 flex w-full items-center gap-2.5 border-b px-3 py-2 text-left transition-colors last:border-b-0',
        selected ? 'bg-sidebar-accent' : 'hover:bg-sidebar-accent/50'
      )}
    >
      <span className="text-sidebar-foreground/40 w-4 text-center font-mono text-[11px]">
        {phase.number}
      </span>
      <div className="flex size-5 shrink-0 items-center justify-center">
        {task && <task.icon size={13} />}
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="text-sidebar-foreground truncate text-xs font-medium">
          {t(phase.name as any)}
        </span>
        {phase.startedAt && (
          <span className="text-sidebar-foreground/40 text-[10px]">
            {format(new Date(phase.startedAt), 'HH:mm:ss')}
          </span>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        {phase.creditsConsumed > 0 && (
          <span className="text-sidebar-foreground/40 text-[10px]">{phase.creditsConsumed}cr</span>
        )}
        {status.icon}
      </div>
    </button>
  )
}

function OutputValue({ label, value }: { label: string; value: string }) {
  let parsed: unknown = null
  let isJson = false
  let displayValue = value

  try {
    parsed = JSON.parse(value)
    if (typeof parsed === 'string') {
      try {
        parsed = JSON.parse(parsed)
      } catch {}
    }
    isJson = typeof parsed === 'object' && parsed !== null
    if (isJson) displayValue = JSON.stringify(parsed, null, 2)
  } catch {}

  const isArray = Array.isArray(parsed)

  return (
    <div className="bg-primary/5 border-primary/20 overflow-hidden rounded-lg border">
      <div className="border-primary/20 flex items-center justify-between border-b px-2.5 py-1.5">
        <span className="text-primary text-[10px] font-medium">{label}</span>
        <span className="text-primary/50 text-[10px]">
          {isArray ? `array [${(parsed as unknown[]).length}]` : isJson ? 'JSON' : 'text'}
        </span>
      </div>
      <div className="max-h-64 overflow-y-auto p-2.5">
        {isJson ? (
          <pre className="text-foreground text-[11px] leading-relaxed break-all whitespace-pre-wrap">
            {displayValue}
          </pre>
        ) : (
          <p className="text-foreground text-xs leading-relaxed break-all">{value}</p>
        )}
      </div>
    </div>
  )
}

function PhaseDetail({ phase }: { phase: PhaseWithLogs }) {
  const t = useTranslations()
  const node = JSON.parse(phase.node) as AppNode
  const task = TaskRegistry[node.data.type as TaskType]
  const status = STATUS_CONFIG[phase.status]
  const logsEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [phase.logs.length])

  const duration =
    phase.startedAt && phase.completedAt
      ? (
          (new Date(phase.completedAt).getTime() - new Date(phase.startedAt).getTime()) /
          1000
        ).toFixed(2)
      : null

  const inputs = phase.inputs ? (JSON.parse(phase.inputs) as Record<string, string>) : {}
  const outputs = phase.outputs ? (JSON.parse(phase.outputs) as Record<string, string>) : {}
  const hasInputs = Object.keys(inputs).length > 0
  const hasOutputs = Object.keys(outputs).length > 0

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="border-border flex shrink-0 items-center gap-3 border-b px-4 py-3">
        {task && <task.icon size={16} />}
        <div className="flex flex-1 flex-col">
          <span className="text-foreground text-sm font-semibold">{t(phase.name as any)}</span>
          <span className="text-muted-foreground text-xs">Phase {phase.number}</span>
        </div>
        {status.icon}
      </div>

      {/* Stats */}
      <div className="border-border grid shrink-0 grid-cols-2 border-b">
        <div className="border-border flex flex-col gap-0.5 border-r px-4 py-2.5">
          <span className="text-muted-foreground text-[10px] tracking-wide uppercase">
            Duration
          </span>
          <span className="text-foreground text-sm font-medium">
            {duration ? `${duration}s` : '—'}
          </span>
        </div>
        <div className="flex flex-col gap-0.5 px-4 py-2.5">
          <span className="text-muted-foreground text-[10px] tracking-wide uppercase">Credits</span>
          <span className="text-foreground text-sm font-medium">{phase.creditsConsumed}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Inputs */}
        {hasInputs && (
          <div className="border-border border-b px-4 py-3">
            <p className="text-muted-foreground mb-2 text-[10px] font-semibold tracking-wider uppercase">
              Inputs
            </p>
            <div className="flex flex-col gap-2">
              {Object.entries(inputs).map(([key, value]) => (
                <div key={key} className="bg-muted/40 rounded-lg p-2.5">
                  <p className="text-muted-foreground mb-1 text-[10px] font-medium">{key}</p>
                  <p className="text-foreground text-xs break-all">
                    {typeof value === 'string' && value.length > 200
                      ? value.slice(0, 200) + '…'
                      : String(value)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Outputs */}
        {hasOutputs && (
          <div className="border-border border-b px-4 py-3">
            <p className="text-muted-foreground mb-2 text-[10px] font-semibold tracking-wider uppercase">
              Outputs
            </p>
            <div className="flex flex-col gap-2">
              {Object.entries(outputs).map(([key, value]) => (
                <OutputValue key={key} label={key} value={String(value)} />
              ))}
            </div>
          </div>
        )}

        {/* Logs */}
        <div className="px-4 py-3">
          <p className="text-muted-foreground mb-2 text-[10px] font-semibold tracking-wider uppercase">
            Logs
          </p>
          {phase.logs.length === 0 ? (
            <p className="text-muted-foreground text-xs">No logs yet...</p>
          ) : (
            <div className="flex flex-col gap-1 font-mono">
              {phase.logs.map((log) => (
                <div key={log.id} className="flex gap-2 text-[11px]">
                  <span className="text-muted-foreground shrink-0">
                    {format(new Date(log.timestamp), 'HH:mm:ss.SSS')}
                  </span>
                  <span
                    className={
                      LOG_LEVEL_STYLE[log.logLevel as 'info' | 'error'] ?? 'text-foreground'
                    }
                  >
                    {log.message}
                  </span>
                </div>
              ))}
              <div ref={logsEndRef} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ExecutionViewer({
  execution: initial,
}: {
  execution: ExecutionWithPhases
}) {
  const router = useRouter()
  const [execution, setExecution] = useState(initial)
  const [selectedPhaseId, setSelectedPhaseId] = useState<string | null>(null)
  const [phaseDetail, setPhaseDetail] = useState<PhaseWithLogs | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const status = STATUS_CONFIG[execution.status]
  const isRunning = execution.status === ExecutionStatus.running

  // Poll execution when running
  useEffect(() => {
    if (!isRunning) return
    const interval = setInterval(async () => {
      const res = await fetch(`/api/executions/${execution.id}`)
      if (!res.ok) return
      const data = await res.json()
      setExecution(data)
      if (data.status !== ExecutionStatus.running) clearInterval(interval)
    }, 800)
    return () => clearInterval(interval)
  }, [isRunning, execution.id])

  // Fetch phase detail + poll if running
  const fetchPhaseDetail = useCallback(
    async (phaseId: string) => {
      setLoadingDetail(true)
      const res = await fetch(`/api/executions/${execution.id}/phases/${phaseId}`)
      if (res.ok) setPhaseDetail(await res.json())
      setLoadingDetail(false)
    },
    [execution.id]
  )

  useEffect(() => {
    if (!selectedPhaseId) return
    fetchPhaseDetail(selectedPhaseId)
    if (!isRunning) return
    const interval = setInterval(() => fetchPhaseDetail(selectedPhaseId), 800)
    return () => clearInterval(interval)
  }, [selectedPhaseId, isRunning, fetchPhaseDetail])

  const duration =
    execution.startedAt && execution.completedAt
      ? Math.round(
          (new Date(execution.completedAt).getTime() - new Date(execution.startedAt).getTime()) /
            1000
        )
      : null

  const phaseGroups = execution.phases.reduce<Record<number, WorkflowExecutionPhase[]>>(
    (acc, p) => {
      acc[p.number] = acc[p.number] ?? []
      acc[p.number].push(p)
      return acc
    },
    {}
  )

  return (
    <div className="bg-sidebar flex h-svh flex-col overflow-hidden">
      <header className="flex h-14 shrink-0 items-center gap-3 px-4">
        <Button
          variant="ghost"
          size="icon"
          className="text-sidebar-foreground hover:bg-sidebar-accent size-8"
          onClick={() => router.back()}
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div className="flex flex-1 flex-col">
          <span className="text-sidebar-foreground text-sm font-semibold">
            {execution.workflow.name}
          </span>
          <span className="text-sidebar-foreground/60 text-xs">
            {format(new Date(execution.createdAt), 'MMM d, yyyy HH:mm')} ·{' '}
            {dayjs(execution.createdAt).fromNow()}
          </span>
        </div>
        <Badge className={status.badge}>{status.label}</Badge>
      </header>

      <div className="flex flex-1 gap-3 overflow-hidden px-3 pb-3">
        {/* Left: phase list */}
        <aside className="bg-sidebar flex w-72 shrink-0 flex-col overflow-y-auto rounded-2xl shadow-sm">
          <div className="border-border/50 grid grid-cols-3 border-b">
            {[
              {
                label: 'Status',
                value: (
                  <div className="flex items-center gap-1">
                    {status.icon}
                    <span className="text-sidebar-foreground text-xs font-medium">
                      {status.label}
                    </span>
                  </div>
                ),
              },
              {
                label: 'Credits',
                value: (
                  <span className="text-sidebar-foreground text-xs font-medium">
                    {execution.creditsConsumed}
                  </span>
                ),
              },
              {
                label: 'Duration',
                value: (
                  <span className="text-sidebar-foreground text-xs font-medium">
                    {duration != null ? `${duration}s` : '—'}
                  </span>
                ),
              },
            ].map((item, i) => (
              <div
                key={i}
                className={cn(
                  'flex flex-col items-center gap-0.5 p-3',
                  i < 2 && 'border-border/50 border-r'
                )}
              >
                <span className="text-sidebar-foreground/50 text-[10px] tracking-wide uppercase">
                  {item.label}
                </span>
                {item.value}
              </div>
            ))}
          </div>

          {Object.entries(phaseGroups).map(([phaseNum, phases]) => (
            <div key={phaseNum}>
              <div className="border-border/50 border-b px-3 py-1.5">
                <span className="text-sidebar-foreground/40 text-[10px] font-semibold tracking-widest uppercase">
                  Phase {phaseNum}
                </span>
              </div>
              {phases.map((phase) => (
                <PhaseRow
                  key={phase.id}
                  phase={phase}
                  selected={selectedPhaseId === phase.id}
                  onClick={() => setSelectedPhaseId(phase.id)}
                />
              ))}
            </div>
          ))}
        </aside>

        {/* Right: detail */}
        <main className="bg-background flex-1 overflow-hidden rounded-2xl shadow-sm">
          {loadingDetail ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="text-muted-foreground size-6 animate-spin" />
            </div>
          ) : phaseDetail ? (
            <PhaseDetail phase={phaseDetail} />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2">
              <Clock className="text-muted-foreground size-8" />
              <p className="text-muted-foreground text-sm">Select a phase to view logs</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
