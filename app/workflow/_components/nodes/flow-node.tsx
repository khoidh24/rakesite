import { NodeProps } from '@xyflow/react'
import { memo } from 'react'
import NodeCard from './node-card'
import NodeHeader from './node-header'
import NodeInputs from './node-inputs'
import NodeOutputs from './node-outputs'
import MergeJsonNode from './merge-json-node'
import { AppNodeData } from '@/types/app-node'
import { TaskType } from '@/types/task'

const FlowNode = memo((props: NodeProps) => {
  const nodeData = props.data as AppNodeData
  const isMergeJson = nodeData.type === TaskType.MERGE_JSON
  const isZipArrays = nodeData.type === TaskType.ZIP_ARRAYS
  const useDynamicInputs = isMergeJson || isZipArrays

  return (
    <NodeCard nodeId={props.id} isSelected={!!props.selected}>
      <NodeHeader taskType={nodeData.type} nodeId={props.id} />
      {useDynamicInputs ? (
        <MergeJsonNode nodeId={props.id} />
      ) : (
        <NodeInputs nodeId={props.id} taskType={nodeData.type} />
      )}
      <NodeOutputs taskType={nodeData.type} />
    </NodeCard>
  )
})

FlowNode.displayName = 'FlowNode'
export default FlowNode
