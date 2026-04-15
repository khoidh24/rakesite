import { TaskType } from '@/types/task'
import { launchBrowserTask } from './launch-browser'
import { PageToHtmlTask } from './page-to-html'
import { ExtractTextTask } from './extract-text'
import { ExtractElementTask } from './extract-element'
import { ReadPropertyTask } from './read-property'
import { AddPropertyTask } from './add-property'
import { MergeJsonTask } from './merge-json'
import { ZipArraysTask } from './zip-arrays'
import { TaskDefinition } from '@/types/task'

export const TaskRegistry = {
  LAUNCH_BROWSER: launchBrowserTask,
  PAGE_TO_HTML: PageToHtmlTask,
  EXTRACT_TEXT: ExtractTextTask,
  EXTRACT_ELEMENT: ExtractElementTask,
  READ_PROPERTY: ReadPropertyTask,
  ADD_PROPERTY: AddPropertyTask,
  MERGE_JSON: MergeJsonTask,
  ZIP_ARRAYS: ZipArraysTask,
} satisfies Record<TaskType, TaskDefinition>
