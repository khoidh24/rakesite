'use client'

import { createContext, useContext } from 'react'

interface EditorContextValue {
  isDirty: boolean
  setDirty: (v: boolean) => void
}

export const EditorContext = createContext<EditorContextValue>({
  isDirty: false,
  setDirty: () => {},
})

export const useEditorContext = () => useContext(EditorContext)
