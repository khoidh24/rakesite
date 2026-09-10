'use client'

import { createFlowNode } from '@/lib/workflow/create-flow-node'
import { isValidConnection } from '@/lib/workflow/edge-utils'
import { HandleColors } from '@/lib/workflow/handle-colors'
import { TaskRegistry } from '@/lib/workflow/task/registry'
import { Workflow } from '@/prisma/generated/client'
import { AppEdge, AppNode } from '@/types/app-node'
import { TaskType } from '@/types/task'
import {
  addEdge,
  Background,
  BackgroundVariant,
  Connection,
  Controls,
  ReactFlow,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from '@xyflow/react'
import { useCallback, useEffect, useRef } from 'react'
import FlowNode from './nodes/flow-node'
import StatusEdge from './edges/status-edge'
import { useFlowHistory } from './hooks/use-flow-history'
import { useEditorContext } from './editor-context'

const nodeTypes = { FlowScrapeNode: FlowNode }
const edgeTypes = { status: StatusEdge }
const snapGrid: [number, number] = [50, 50]
const fitViewOpts = { padding: 1 }

// Giữ đúng format id mặc định của `addEdge` để id edge đã lưu không thay đổi
function getEdgeId(connection: Connection): string {
  const { source, sourceHandle, target, targetHandle } = connection
  return `xy-edge__${source}${sourceHandle ?? ''}-${target}${targetHandle ?? ''}`
}

function getEdgeColor(sourceNode: AppNode | undefined, sourceHandle: string | null): string {
  if (!sourceNode || !sourceHandle) return '#94a3b8'
  const task = TaskRegistry[sourceNode.data.type]
  const output = task.outputs?.find((o) => o.name === sourceHandle)
  return output ? HandleColors[output.type] : '#94a3b8'
}

export default function FlowCanvas({ workflow }: { workflow: Workflow }) {
  const [nodes, setNodes, onNodesChange] = useNodesState<AppNode>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<AppEdge>([])
  const { setViewport, screenToFlowPosition, addNodes, getNodes, getEdges } =
    useReactFlow<AppNode, AppEdge>()
  const clipboard = useRef<AppNode[]>([])
  const { init, snapshot, undo, redo } = useFlowHistory(setNodes, setEdges)
  const { setDirty } = useEditorContext()

  useEffect(() => {
    try {
      const flow = JSON.parse(workflow.definition)
      if (!flow) return
      const loadedNodes: AppNode[] = flow.nodes?.length
        ? flow.nodes
        : [createFlowNode(TaskType.LAUNCH_BROWSER)]

      // Filter out edges with invalid handles
      const nodeMap = new Map(loadedNodes.map((n) => [n.id, n]))
      const validEdges = (flow.edges || []).filter((e: AppEdge) => {
        const sourceNode = nodeMap.get(e.source)
        const targetNode = nodeMap.get(e.target)
        if (!sourceNode || !targetNode) return false
        const sourceTask = TaskRegistry[sourceNode.data.type]
        const targetTask = TaskRegistry[targetNode.data.type]
        const sourceHandleValid = sourceTask?.outputs?.some((o) => o.name === e.sourceHandle)
        const targetHandleValid =
          e.targetHandle?.startsWith('input_') ||
          targetTask?.inputs?.some((i) => i.name === e.targetHandle)
        return sourceHandleValid && targetHandleValid
      })

      setNodes(loadedNodes)
      setEdges(validEdges)
      if (!flow.viewport) return
      const { x = 0, y = 0, zoom = 1 } = flow.viewport
      setViewport({ x, y, zoom })
    } catch {
      setNodes([createFlowNode(TaskType.LAUNCH_BROWSER)])
    }
    setTimeout(() => {
      const currentNodes = getNodes() as AppNode[]
      const currentEdges = getEdges()
      init(currentNodes, currentEdges)
    }, 50)
  }, [workflow.definition, setNodes, setEdges, setViewport])

  // Snapshot + dirty khi nodes/edges thay đổi
  useEffect(() => {
    if (snapshot(nodes as AppNode[], edges)) {
      setDirty(true)
    }
  }, [nodes, edges])
  // Ctrl+C / Ctrl+V
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return

      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z') {
        e.preventDefault()
        redo()
        return
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault()
        undo()
        return
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        clipboard.current = getNodes().filter((n) => n.selected) as AppNode[]
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        if (!clipboard.current.length) return

        // Tính center của viewport hiện tại
        const container = document.querySelector('.react-flow') as HTMLElement
        if (!container) return
        const rect = container.getBoundingClientRect()
        const centerFlow = screenToFlowPosition({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        })

        // Tính bounding box của clipboard nodes để paste vào center
        const xs = clipboard.current.map((n) => n.position.x)
        const ys = clipboard.current.map((n) => n.position.y)
        const clipCenterX = (Math.min(...xs) + Math.max(...xs)) / 2
        const clipCenterY = (Math.min(...ys) + Math.max(...ys)) / 2

        const pasted = clipboard.current.map((n) =>
          createFlowNode(n.data.type, {
            x: centerFlow.x + (n.position.x - clipCenterX),
            y: centerFlow.y + (n.position.y - clipCenterY),
          })
        )
        addNodes(pasted)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [getNodes, addNodes, screenToFlowPosition, undo, redo])

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const type = e.dataTransfer.getData('application/reactflow') as TaskType
      if (!type) return
      const position = screenToFlowPosition({ x: e.clientX, y: e.clientY })
      addNodes(createFlowNode(type, position))
    },
    [screenToFlowPosition, addNodes]
  )

  const onConnect = useCallback(
    (connection: Connection) => {
      const currentNodes = getNodes() as AppNode[]
      const currentEdges = getEdges()
      if (!isValidConnection(connection, currentNodes, currentEdges)) return

      const sourceNode = currentNodes.find((n) => n.id === connection.source)
      const color = getEdgeColor(sourceNode, connection.sourceHandle ?? null)

      const newEdge: AppEdge = {
        ...connection,
        id: getEdgeId(connection),
        type: 'status',
        animated: false,
        data: { status: 'idle' },
        style: { stroke: color, strokeWidth: 2 },
      }

      setEdges((eds) => addEdge(newEdge, eds))
    },
    [getNodes, getEdges, setEdges]
  )

  const validateConnection = useCallback(
    (connection: Connection | AppEdge) =>
      isValidConnection(connection, getNodes(), getEdges()),
    [getNodes, getEdges]
  )

  const onNodesDelete = useCallback(
    (deleted: AppNode[]) => {
      const deletedIds = new Set(deleted.map((n) => n.id))
      setEdges((eds) => eds.filter((e) => !deletedIds.has(e.source) && !deletedIds.has(e.target)))
    },
    [setEdges]
  )

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      snapToGrid
      snapGrid={snapGrid}
      fitView
      fitViewOptions={fitViewOpts}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onConnect={onConnect}
      isValidConnection={validateConnection}
      deleteKeyCode={['Delete', 'Backspace']}
      onNodesDelete={onNodesDelete}
    >
      <Controls position="top-left" />
      <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
    </ReactFlow>
  )
}
