import { getUuid } from '@/components/utils/tools.ts'

interface VFNodeContentData {
  label: string
  type: string
  key: string
  data: any
  config: any
  hid: string
  oid: string
  uitype?: string
}

interface VFNodeContents {
  byId: Record<string, VFNodeContentData>
  order: string[]
}

enum VFNodeConnectionDataType {
  FromOuter = 'FromOuter',
  FromAttached = 'FromAttached',
  FromParent = 'FromParent',
  FromInner = 'FromInner',
}

enum VFNodeConnectionDataAttachedType {
  attached_node_input = 'attached_node_input',
  attached_node_callbackUser = 'attached_node_callbackUser',
  attached_node_output = 'attached_node_output',
  attached_node_next = 'attached_node_next',
  attached_node_callbackFunc = 'attached_node_callbackFunc',
}

interface VFNodeHandleData {
  type: VFNodeConnectionDataType
  inputKey?: string
  atype?: VFNodeConnectionDataAttachedType
  path?: (string | number)[]
  useid?: string[]
}

enum VFNodeConnectionType {
  self = 'self',
  attach = 'attach',
  next = 'next',
  inputs = 'inputs',
  outputs = 'outputs',
  callbackUsers = 'callbackUsers',
  callbackFuncs = 'callbackFuncs',
}

interface VFNodeHandle {
  label: string
  data: Record<string, VFNodeHandleData>
}

type VFNodeConnections = {
  // 连接类型：handleID：{handle标签，handle数据}
  [key in VFNodeConnectionType]: Record<string, VFNodeHandle>
}

enum VFNodeFlag {
  isNested = 0x01,
  isAttached = 0x02,
  isTask = 0x04,
  isPassive = 0x08,
}
enum VFNodeAttachingType {
  input = 'input',
  output = 'output',
  callbackFunc = 'callbackFunc',
  callbackUser = 'callbackUser',
}
enum VFNodeAttachingPos {
  top = 'top',
  bottom = 'bottom',
  left = 'left',
  right = 'right',
  center = 'center',
}
interface VFNodeAttaching {
  type: VFNodeAttachingType
  pos: [VFNodeAttachingPos, VFNodeAttachingPos]
  label: string
}

interface VFNodeAttachedNode {
  nid: string | null
}

interface VFNodePadding {
  top: number
  bottom: number
  left: number
  right: number
  gap?: number
}

interface VFNodeSize {
  width: number
  height: number
}

interface VFNodeNesting {
  pad: VFNodePadding
  attached_pad: VFNodePadding
  attached_nodes: Partial<Record<VFNodeConnectionDataAttachedType, VFNodeAttachedNode>>
}

interface VFNodeState {
  status: string
  copy: Record<string, any>
  copyCount: {
    Running: number
    Success: number
    Error: number
  }
}

interface VFNodeConfig {
  outputsUIType: string
}

interface VFNodeData {
  ntype: string
  vtype: string
  flag: number
  label: string
  placeholderlabel: string
  size: VFNodeSize
  min_size?: VFNodeSize
  attaching?: VFNodeAttaching
  nesting?: VFNodeNesting
  connections?: VFNodeConnections
  payloads?: VFNodeContents
  results?: VFNodeContents
  state?: VFNodeState
  config?: VFNodeConfig
}

export type {
  VFNodeContentData,
  VFNodeContents,
  VFNodeHandleData,
  VFNodeHandle,
  VFNodeConnections,
  VFNodeFlag,
  VFNodeAttachingPos,
  VFNodeAttaching,
  VFNodeAttachedNode,
  VFNodePadding,
  VFNodeSize,
  VFNodeNesting,
  VFNodeState,
  VFNodeConfig,
  VFNodeData,
}
export {
  VFNodeConnectionDataType,
  VFNodeConnectionDataAttachedType,
  VFNodeConnectionType,
  VFNodeAttachingType,
}
