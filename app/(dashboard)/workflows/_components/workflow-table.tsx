'use client'

import { runWorkflow } from '@/actions/workflows/runWorkflow'
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
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Workflow } from '@/prisma/generated/client'
import { useQueryClient } from '@tanstack/react-query'
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { CheckCircle2, Loader2, Play, Shuffle, XCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { WorkflowRowActions } from './workflow-row-actions'

dayjs.extend(relativeTime)

const STATUS_STYLES: Record<string, string> = {
  ready: 'bg-secondary text-secondary-foreground',
  published: 'bg-primary/10 text-primary',
  deleted: 'bg-destructive/10 text-destructive',
}

const LAST_RUN_STATUS_ICON: Record<string, React.ReactNode> = {
  completed: <CheckCircle2 className="size-3.5 text-emerald-500" />,
  failed: <XCircle className="text-destructive size-3.5" />,
  running: <Loader2 className="text-primary size-3.5 animate-spin" />,
}

function RunButton({ workflow }: { workflow: Workflow }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleRun() {
    setLoading(true)
    try {
      await runWorkflow({ workflowId: workflow.id })
    } catch (e) {
      toast.error((e as Error).message)
      setLoading(false)
    }
  }

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            disabled={loading}
            onClick={handleRun}
            className="cursor-pointer"
          />
        }
      >
        {loading ? <Loader2 className="size-4 animate-spin" /> : <Play className="size-4" />}
      </TooltipTrigger>
      <TooltipContent>Run workflow</TooltipContent>
    </Tooltip>
  )
}

function useColumns(): ColumnDef<Workflow>[] {
  const t = useTranslations('Workflows.table')

  return [
    {
      accessorKey: 'name',
      header: t('name'),
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.original.name}</span>
          {row.original.description && (
            <span className="text-muted-foreground text-xs">{row.original.description}</span>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: () => <span className="flex w-full justify-center">{t('status')}</span>,
      size: 140,
      cell: ({ row }) => (
        <div className="flex justify-center">
          <Badge
            className={`min-w-24 justify-center ${STATUS_STYLES[row.original.status] ?? ''}`}
            variant="outline"
          >
            {row.original.status}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: 'lastRunAt',
      header: t('lastRun'),
      size: 200,
      cell: ({ row }) => {
        const { lastRunAt, lastRunStatus, lastRunId } = row.original
        if (!lastRunAt) return <span className="text-muted-foreground text-sm">{t('never')}</span>
        return (
          <Link
            href={lastRunId ? `/workflow/run/${lastRunId}` : '#'}
            className="flex items-center gap-1.5 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {LAST_RUN_STATUS_ICON[lastRunStatus] ?? null}
            <span className="text-muted-foreground text-sm">{dayjs(lastRunAt).fromNow()}</span>
          </Link>
        )
      },
    },
    {
      accessorKey: 'createdAt',
      header: t('created'),
      size: 140,
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm">
          {dayjs(row.original.createdAt).format('MMM D, YYYY')}
        </span>
      ),
    },
    {
      id: 'actions',
      size: 100,
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1">
          <RunButton workflow={row.original} />
          <Tooltip>
            <TooltipTrigger
              render={
                <Link className="cursor-pointer" href={`/workflow/editor/${row.original.id}`} />
              }
            >
              <Button variant="ghost" size="icon-sm">
                <Shuffle className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t('edit')}</TooltipContent>
          </Tooltip>
          <WorkflowRowActions workflow={row.original} />
        </div>
      ),
    },
  ]
}

export function WorkflowTable({ data }: { data: Workflow[] }) {
  const columns = useColumns()
  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() })

  return (
    <div className="border-border overflow-hidden rounded-xl border">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} className="hover:bg-transparent">
                {hg.headers.map((header) => (
                  <TableHead key={header.id} style={{ width: header.column.getSize() }}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} style={{ width: cell.column.getSize() }}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
