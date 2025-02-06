import { type GraphNode } from '@vue-flow/core'
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
export interface VariableSelectionType {
  label: string
  value: string
}
export const BaseVariableTypeSelections = [
  { label: '字符串 String', value: 'String' },
  { label: '整数 Integer', value: 'Integer' },
  { label: '数字 Number', value: 'Number' },
  { label: '布尔 Boolean', value: 'Boolean' },
]

export const VariableTypeSelectionsWRef = [
  ...BaseVariableTypeSelections,
  { label: '引用', value: 'Ref' },
]

export const VariableTypesSelectionsWCode = [
  ...BaseVariableTypeSelections,
  { label: '字典 Dictionary', value: 'Dict' },
  { label: '列表 List', value: 'List' },
]

export const FileVariableTypesSelections = [
  { label: '图片 Image', value: 'Image' },
  { label: 'Word文档 Docx', value: 'Docx' },
  { label: 'PowerPoint PPT', value: 'PPT' },
  { label: '文本文件 Txt', value: 'Txt' },
  { label: 'Excel表格 Excel', value: 'Excel' },
  { label: '音频 Audio', value: 'Audio' },
  { label: '压缩包 Zip', value: 'Zip' },
  { label: '视频 Video', value: 'Video' },
  { label: 'PDF文件 PDF', value: 'PDF' },
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

export interface AggregateBranchData {
  node: string
  refdata: string
  key: string // 只用作vuedraggable的key
}

export interface CondBranchData {
  refdata: string
  operator: string
  comparetype: VariableTypeName
  value: string
}

export interface CondBranchDict {
  label: string
  data: {
    condType: string
    conditions: CondBranchData[]
  }
}
