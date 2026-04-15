import { TaskCategory, TaskParam, TaskParamType, TaskType } from '@/types/task'
import { TextIcon, LucideProps } from 'lucide-react'

export const ExtractTextTask = {
  type: TaskType.EXTRACT_TEXT,
  category: TaskCategory.DATA_EXTRACTION,
  labelKey: 'WorkflowEditor.tasks.extractText' as const,
  icon: (props: LucideProps) => <TextIcon className="stroke-emerald-500" {...props} />,
  isEntryPoint: false,
  credits: 3,
  inputs: [
    {
      name: 'HTML',
      type: TaskParamType.STRING,
      required: true,
      variant: 'textarea',
    },
    {
      name: 'Selector',
      type: TaskParamType.STRING,
      helperText: 'eg: h1, .title, #main',
      required: true,
      hideHandle: true,
    },
  ] satisfies TaskParam[],
  outputs: [{ name: 'Extracted text', type: TaskParamType.STRING }] satisfies TaskParam[],
}
