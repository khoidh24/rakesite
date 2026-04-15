'use client'

import { Workflow } from '@/prisma/generated/client'
import { ReactFlowProvider } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useState } from 'react'
import FlowCanvas from './editor-canvas'
import EditorHeader from './editor-header'
import { EditorContext } from './editor-context'
import TaskMenu from './task-menu'
import './react-flow.css'

export default function WorkflowEditor({ workflow }: { workflow: Workflow }) {
  const [isDirty, setDirty] = useState(false)

  return (
    <EditorContext.Provider value={{ isDirty, setDirty }}>
      <ReactFlowProvider>
        <div className="bg-sidebar flex h-svh w-full flex-col overflow-hidden">
          <EditorHeader workflow={workflow} />

          <div className="flex flex-1 overflow-hidden px-3 pb-3">
            {/* Task menu panel */}
            <div className="bg-sidebar flex shrink-0 flex-col overflow-hidden rounded-2xl">
              <TaskMenu />
            </div>

            {/* Canvas panel */}
            <div className="bg-background flex-1 overflow-hidden rounded-2xl shadow-sm">
              <FlowCanvas workflow={workflow} />
            </div>
          </div>
        </div>
      </ReactFlowProvider>
    </EditorContext.Provider>
  )
}
