import { TaskCategory, TaskParam, TaskParamType, TaskType } from '@/types/task'
import { FilePlus, LucideProps } from 'lucide-react'

export const AddPropertyTask = {
  type: TaskType.ADD_PROPERTY,
  category: TaskCategory.DATA_EXTRACTION,
  labelKey: 'WorkflowEditor.tasks.addProperty' as const,
  icon: (props: LucideProps) => <FilePlus className="stroke-teal-500" {...props} />,
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
      name: 'Property name',
      type: TaskParamType.STRING,
      helperText: 'eg: title, meta.author',
      required: true,
      hideHandle: true,
    },
    {
      name: 'Property value',
      type: TaskParamType.STRING,
      helperText: 'Value to set',
      required: true,
      hideHandle: true,
    },
  ] satisfies TaskParam[],
  outputs: [{ name: 'Updated JSON', type: TaskParamType.STRING }] satisfies TaskParam[],
}
