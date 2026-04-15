import { TaskCategory, TaskParam, TaskParamType, TaskType } from '@/types/task'
import { FileJson, LucideProps } from 'lucide-react'

export const ReadPropertyTask = {
  type: TaskType.READ_PROPERTY,
  category: TaskCategory.DATA_EXTRACTION,
  labelKey: 'WorkflowEditor.tasks.readProperty' as const,
  icon: (props: LucideProps) => <FileJson className="stroke-orange-400" {...props} />,
  isEntryPoint: false,
  credits: 1,
  inputs: [
    {
      name: 'JSON',
      type: TaskParamType.STRING,
      required: true,
      variant: 'textarea' as const,
    },
    {
      name: 'Property',
      type: TaskParamType.STRING,
      helperText: 'eg: name, items[0].src, data.url',
      required: true,
      hideHandle: true,
    },
  ] satisfies TaskParam[],
  outputs: [{ name: 'Property value', type: TaskParamType.STRING }] satisfies TaskParam[],
}
