'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ExecutionStatus } from '@/prisma/generated/enums'
import { Workflow, WorkflowExecution, WorkflowExecutionPhase } from '@/prisma/generated/client'
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Clock,
  CoinsIcon,
  Loader2,
  Play,
  XCircle,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { cn } from '@/lib/utils'

dayjs.extend(relativeTime)

type ExecutionWithPhases = WorkflowExecution & {
  phases: Pick<WorkflowExecutionPhase, 'id' | 'status' | 'creditsConsumed'>[]
}

const STATUS_CONFIG = {
  [ExecutionStatus.pending]: {
    icon: <Circle className="text-muted-foreground size-3.5" />,
    badge: 'bg-muted text-muted-foreground',
    label: 'Pending',
  },
  [ExecutionStatus.running]: {
    icon: <Loader2 className="text-primary size-3.5 animate-spin" />,
    badge: 'bg-primary/10 text-primary',
    label: 'Running',
  },
  [ExecutionStatus.completed]: {
    icon: <CheckCircle2 className="size-3.5 text-emerald-500" />,
    badge: 'bg-emerald-500/10 text-emerald-500',
    label: 'Completed',
  },
  [ExecutionStatus.failed]: {
    icon: <XCircle className="text-destructive size-3.5" />,
    badge: 'bg-destructive/10 text-destructive',
    label: 'Failed',
  },
}

export default function ExecutionList({
  workflow,
  executions,
}: {
  workflow: Workflow
  executions: ExecutionWithPhases[]
}) {
  const router = useRouter()

  return (
    <div className="bg-sidebar flex h-svh flex-col overflow-hidden">
      <header className="flex h-14 shrink-0 items-center gap-3 px-4">
        <Button
          variant="ghost"
          size="icon"
          className="text-sidebar-foreground hover:bg-sidebar-accent size-8"
          onClick={() => router.push(`/workflow/editor/${workflow.id}`)}
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div className="flex flex-1 flex-col">
          <span className="text-sidebar-foreground text-sm font-semibold">{workflow.name}</span>
          <span className="text-sidebar-foreground/60 text-xs">
            {executions.length} execution{executions.length !== 1 ? 's' : ''}
          </span>
        </div>
      </header>

      <div className="flex flex-1 gap-3 overflow-hidden px-3 pb-3">
        <div className="bg-background flex-1 overflow-hidden rounded-2xl shadow-sm">
          {executions.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2">
              <Play className="text-muted-foreground size-8" />
              <p className="text-muted-foreground text-sm">No executions yet</p>
            </div>
          ) : (
            <div className="h-full overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Status</TableHead>
                    <TableHead>Started</TableHead>
                    <TableHead>Trigger</TableHead>
                    <TableHead className="text-center">Phases</TableHead>
                    <TableHead className="text-center">Credits</TableHead>
                    <TableHead className="text-center">Duration</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {executions.map((execution) => {
                    const status = STATUS_CONFIG[execution.status]
                    const duration =
                      execution.startedAt && execution.completedAt
                        ? Math.round(
                            (new Date(execution.completedAt).getTime() -
                              new Date(execution.startedAt).getTime()) /
                              1000
                          )
                        : null

                    return (
                      <TableRow
                        key={execution.id}
                        className="cursor-pointer"
                        onClick={() => router.push(`/workflow/run/${execution.id}`)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {status.icon}
                            <Badge className={cn('h-5 px-1.5 text-[10px]', status.badge)}>
                              {status.label}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-foreground text-sm">
                              {format(new Date(execution.createdAt), 'MMM d, yyyy HH:mm')}
                            </span>
                            <span className="text-muted-foreground text-xs">
                              {dayjs(execution.createdAt).fromNow()}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs capitalize">
                            {execution.trigger}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="text-muted-foreground text-sm">
                            {execution.phases.length}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <CoinsIcon className="text-muted-foreground size-3.5" />
                            <span className="text-muted-foreground text-sm">
                              {execution.creditsConsumed}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Clock className="text-muted-foreground size-3.5" />
                            <span className="text-muted-foreground text-sm">
                              {duration != null ? `${duration}s` : '—'}
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
