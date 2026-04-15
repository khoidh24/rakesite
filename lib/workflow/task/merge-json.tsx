import { TaskCategory, TaskParam, TaskParamType, TaskType } from '@/types/task'
import { Combine, LucideProps } from 'lucide-react'

// Merge JSON uses dynamic inputs stored as:
// node.data.inputs = { "entries": "[{\"key\":\"names\",\"value\":\"...\"}]" }
// The "entries" input is managed by a custom UI component

export const MergeJsonTask = {
  type: TaskType.MERGE_JSON,
  category: TaskCategory.DATA_EXTRACTION,
  labelKey: 'WorkflowEditor.tasks.mergeJson' as const,
  icon: (props: LucideProps) => <Combine className="stroke-purple-500" {...props} />,
  isEntryPoint: false,
  credits: 1,
  inputs: [] as TaskParam[], // dynamic — handled by custom node UI
  outputs: [{ name: 'Merged JSON', type: TaskParamType.STRING }] satisfies TaskParam[],
}
