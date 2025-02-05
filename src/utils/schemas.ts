import { Panel, useVueFlow, type GraphNode } from '@vue-flow/core'
import type VFNode from '@/components/nodes/VFNodeClass'

export type NodeWithVFData = Omit<GraphNode, 'data'> & { data: VFNode }

export type HeaderType = 'default' | 'error' | 'info' | 'success' | 'warning'

export type VariableTypeName =
  | 'Ref'
  | 'Value'
  | 'String'
  | 'Integer'
  | 'Number'
  | 'Boolean'
  | 'List'
  | 'Dict'

export type VariableType = string | boolean | number | null

export const BaseVariableTypeSelections = [
  { label: 'String', value: 'String' },
  { label: 'Integer', value: 'Integer' },
  { label: 'Number', value: 'Number' },
  { label: 'Boolean', value: 'Boolean' },
]

export const ExVariableTypeSelections = [
  ...BaseVariableTypeSelections,
  { label: '引用', value: 'Ref' },
]

export interface VarItem4Selections {
  nodeId: string | number
  nlabel: string
  dpath: (string | number)[]
  dlabel: string
  dkey: string
  dtype: string
}

export interface InputNode {
  srcid: string
  srcohid: string
}

export interface BranchData {
  node: string
  refdata: string
  key?: string
}
