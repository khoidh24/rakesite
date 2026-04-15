import { TaskCategory, TaskParam, TaskParamType, TaskType } from '@/types/task'
import { Code, LucideProps } from 'lucide-react'

export const PageToHtmlTask = {
  type: TaskType.PAGE_TO_HTML,
  category: TaskCategory.DATA_EXTRACTION,
  labelKey: 'WorkflowEditor.tasks.pageToHtml' as const,
  icon: (props: LucideProps) => <Code className="stroke-rose-500" {...props} />,
  isEntryPoint: false,
  credits: 1,
  inputs: [
    {
      name: 'Web page',
      type: TaskParamType.BROWSER_INSTANCE,
      required: true,
    },
  ],
  outputs: [
    { name: 'HTML', type: TaskParamType.STRING },
    { name: 'Web page', type: TaskParamType.BROWSER_INSTANCE },
  ] satisfies TaskParam[],
}
