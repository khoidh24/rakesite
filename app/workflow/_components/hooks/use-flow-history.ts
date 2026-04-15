'use client'

import { useNodesState, useEdgesState } from '@xyflow/react'
import { useCallback, useRef } from 'react'
import { AppNode } from '@/types/app-node'
import { Edge } from '@xyflow/react'

const MAX_HISTORY = 50

export function useFlowHistory(
  setNodes: ReturnType<typeof useNodesState>[1],
  setEdges: ReturnType<typeof useEdgesState>[1]
) {
  const history = useRef<{ nodes: AppNode[]; edges: Edge[] }[]>([])
  const pointer = useRef(-1)
  const isUndoRedo = useRef(false)
  const isReady = useRef(false)

  // Gọi 1 lần sau khi load xong để set baseline
  const init = useCallback((nodes: AppNode[], edges: Edge[]) => {
    history.current = [
      {
        nodes: JSON.parse(JSON.stringify(nodes)),
        edges: JSON.parse(JSON.stringify(edges)),
      },
    ]
    pointer.current = 0
    isReady.current = true
  }, [])

  const snapshot = useCallback((nodes: AppNode[], edges: Edge[]): boolean => {
    if (!isReady.current || isUndoRedo.current) return false
    history.current = history.current.slice(0, pointer.current + 1)
    history.current.push({
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges)),
    })
    if (history.current.length > MAX_HISTORY) history.current.shift()
    pointer.current = history.current.length - 1
    return true
  }, [])

  const undo = useCallback(() => {
    if (pointer.current <= 0) return
    pointer.current -= 1
    const state = history.current[pointer.current]
    isUndoRedo.current = true
    setNodes(state.nodes)
    setEdges(state.edges)
    setTimeout(() => {
      isUndoRedo.current = false
    }, 0)
  }, [setNodes, setEdges])

  const redo = useCallback(() => {
    if (pointer.current >= history.current.length - 1) return
    pointer.current += 1
    const state = history.current[pointer.current]
    isUndoRedo.current = true
    setNodes(state.nodes)
    setEdges(state.edges)
    setTimeout(() => {
      isUndoRedo.current = false
    }, 0)
  }, [setNodes, setEdges])

  return { init, snapshot, undo, redo }
}
