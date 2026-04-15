import { getWorkflowExecutions } from '@/actions/workflows/getWorkflowExecutions'
import { getWorkflowsInfo } from '@/actions/workflows/getWorkflowInfo'
import { notFound } from 'next/navigation'
import ExecutionList from './_components/execution-list'

export default async function ExecutionsPage({
  params,
}: {
  params: Promise<{ workflowId: string }>
}) {
  const { workflowId } = await params
  const [workflow, executions] = await Promise.all([
    getWorkflowsInfo({ workflowId }),
    getWorkflowExecutions(workflowId),
  ])

  if (!workflow) notFound()

  return <ExecutionList workflow={workflow} executions={executions} />
}
