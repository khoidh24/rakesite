import { TaskType } from '@/types/task'
import { TaskExecutorFn } from './types'
import { launchBrowserExecutor } from './launch-browser.executor'
import { pageToHtmlExecutor } from './page-to-html.executor'
import { extractTextExecutor } from './extract-text.executor'
import { extractElementExecutor } from './extract-element.executor'
import { readPropertyExecutor } from './read-property.executor'
import { addPropertyExecutor } from './add-property.executor'
import { mergeJsonExecutor } from './merge-json.executor'
import { zipArraysExecutor } from './zip-arrays.executor'

export const ExecutorRegistry: Record<TaskType, TaskExecutorFn> = {
  [TaskType.LAUNCH_BROWSER]: launchBrowserExecutor,
  [TaskType.PAGE_TO_HTML]: pageToHtmlExecutor,
  [TaskType.EXTRACT_TEXT]: extractTextExecutor,
  [TaskType.EXTRACT_ELEMENT]: extractElementExecutor,
  [TaskType.READ_PROPERTY]: readPropertyExecutor,
  [TaskType.ADD_PROPERTY]: addPropertyExecutor,
  [TaskType.MERGE_JSON]: mergeJsonExecutor,
  [TaskType.ZIP_ARRAYS]: zipArraysExecutor,
}
