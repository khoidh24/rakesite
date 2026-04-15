import { LucideProps } from 'lucide-react'

export enum TaskType {
  LAUNCH_BROWSER = 'LAUNCH_BROWSER',
  PAGE_TO_HTML = 'PAGE_TO_HTML',
  EXTRACT_TEXT = 'EXTRACT_TEXT',
  EXTRACT_ELEMENT = 'EXTRACT_ELEMENT',
  READ_PROPERTY = 'READ_PROPERTY',
  ADD_PROPERTY = 'ADD_PROPERTY',
  MERGE_JSON = 'MERGE_JSON',
  ZIP_ARRAYS = 'ZIP_ARRAYS',
}

export enum TaskCategory {
  BROWSER = 'BROWSER',
  DATA_EXTRACTION = 'DATA_EXTRACTION',
}

export enum TaskParamType {
  STRING = 'STRING',
  BROWSER_INSTANCE = 'BROWSER_INSTANCE',
  NUMBER = 'NUMBER',
  BOOLEAN = 'BOOLEAN',
  SELECT = 'SELECT',
  CREDENTIAL = 'CREDENTIAL',
}

export interface TaskParam {
  name: string
  type: TaskParamType
  helperText?: string
  required?: boolean
  hideHandle?: boolean
  variant?: 'textarea' | 'input'
}

export interface TaskDefinition {
  type: TaskType
  category: TaskCategory
  labelKey: string
  icon: (props: LucideProps) => React.ReactNode
  isEntryPoint?: boolean
  credits: number
  inputs: TaskParam[]
  outputs?: TaskParam[]
}
