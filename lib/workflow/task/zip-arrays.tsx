import { TaskCategory, TaskParam, TaskParamType, TaskType } from '@/types/task'
import { Rows3, LucideProps } from 'lucide-react'

// Same dynamic input pattern as MergeJson
// Each entry: { key: "name", inputId: "input_xxx" } → connects to an array
// Output: [{name: arr1[0], image: arr2[0], ...}, ...]

export const ZipArraysTask = {
  type: TaskType.ZIP_ARRAYS,
  category: TaskCategory.DATA_EXTRACTION,
  labelKey: 'WorkflowEditor.tasks.zipArrays' as const,
  icon: (props: LucideProps) => <Rows3 className="stroke-amber-500" {...props} />,
  isEntryPoint: false,
  credits: 1,
  inputs: [] as TaskParam[],
  outputs: [{ name: 'Zipped JSON', type: TaskParamType.STRING }] satisfies TaskParam[],
}
