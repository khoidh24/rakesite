import { TaskParamType } from '@/types/task'

export const HandleColors: Record<TaskParamType, string> = {
  [TaskParamType.STRING]: '#6366f1', // indigo — text/string data
  [TaskParamType.BROWSER_INSTANCE]: '#f59e0b', // amber — browser session
  [TaskParamType.NUMBER]: '#10b981', // emerald — numeric
  [TaskParamType.BOOLEAN]: '#ec4899', // pink — true/false
  [TaskParamType.SELECT]: '#8b5cf6', // violet — enum/option
  [TaskParamType.CREDENTIAL]: '#ef4444', // red — sensitive/auth
}
