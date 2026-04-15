import { getWorkflowsInfo } from '@/actions/workflows/getWorkflowInfo'
import { notFound } from 'next/navigation'
import WorkflowEditor from '../../_components/editor'

export default async function WorkflowEditorPage({
  params,
}: {
  params: Promise<{ workflowId: string }>
}) {
  const { workflowId } = await params
  const workflow = await getWorkflowsInfo({ workflowId })

  if (!workflow) notFound()

  return <WorkflowEditor workflow={workflow} />
}
