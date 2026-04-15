import { TaskCategory, TaskParam, TaskParamType, TaskType } from '@/types/task'
import { Globe, LucideProps } from 'lucide-react'

export const launchBrowserTask = {
  type: TaskType.LAUNCH_BROWSER,
  category: TaskCategory.BROWSER,
  labelKey: 'WorkflowEditor.tasks.launchBrowser' as const,
  icon: (props: LucideProps) => <Globe className="stroke-primary" {...props} />,
  isEntryPoint: true,
  credits: 1,
  inputs: [
    {
      name: 'Website URL',
      type: TaskParamType.STRING,
      helperText: 'eg: https://www.google.com/',
      required: true,
      hideHandle: true,
    },
  ],
  outputs: [{ name: 'Web page', type: TaskParamType.BROWSER_INSTANCE }] satisfies TaskParam[],
}
