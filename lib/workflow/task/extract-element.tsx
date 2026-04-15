import { TaskCategory, TaskParam, TaskParamType, TaskType } from '@/types/task'
import { ScanSearch, LucideProps } from 'lucide-react'

export const ExtractElementTask = {
  type: TaskType.EXTRACT_ELEMENT,
  category: TaskCategory.DATA_EXTRACTION,
  labelKey: 'WorkflowEditor.tasks.extractElement' as const,
  icon: (props: LucideProps) => <ScanSearch className="stroke-sky-500" {...props} />,
  isEntryPoint: false,
  credits: 2,
  inputs: [
    {
      name: 'HTML',
      type: TaskParamType.STRING,
      required: true,
      variant: 'textarea' as const,
    },
    {
      name: 'Selector',
      type: TaskParamType.STRING,
      helperText: 'eg: img, a.link, div.card',
      required: true,
      hideHandle: true,
    },
    {
      name: 'Attributes',
      type: TaskParamType.STRING,
      helperText: 'eg: src,alt,width,title (comma separated)',
      required: false,
      hideHandle: true,
    },
  ] satisfies TaskParam[],
  outputs: [{ name: 'Elements JSON', type: TaskParamType.STRING }] satisfies TaskParam[],
}
