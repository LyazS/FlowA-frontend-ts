import { type SelectOption } from 'naive-ui'
const _BaseVariableTypeSelections = [
  { label: '字符串 String', value: 'String' },
  { label: '整数 Integer', value: 'Integer' },
  { label: '数字 Number', value: 'Number' },
  { label: '布尔 Boolean', value: 'Boolean' },
] as const satisfies readonly SelectOption[]

const _VariableTypeSelectionsWRef = [
  ..._BaseVariableTypeSelections,
  { label: '引用', value: 'Ref' },
] as const satisfies readonly SelectOption[]

const _VariableTypesSelectionsWCode = [
  ..._BaseVariableTypeSelections,
  { label: '字典 Dictionary', value: 'Dict' },
  { label: '列表 List', value: 'List' },
] as const satisfies readonly SelectOption[]

const _FileVariableTypesSelections = [
  { label: '图片 Image', value: 'Image' },
  { label: 'Word文档 Docx', value: 'Docx' },
  { label: 'PowerPoint PPT', value: 'PPT' },
  { label: '文本文件 Txt', value: 'Txt' },
  { label: 'Excel表格 Excel', value: 'Excel' },
  { label: '音频 Audio', value: 'Audio' },
  { label: '压缩包 Zip', value: 'Zip' },
  { label: '视频 Video', value: 'Video' },
  { label: 'PDF文件 PDF', value: 'PDF' },
] as const satisfies readonly SelectOption[]

export const BaseVariableTypeSelections = [..._BaseVariableTypeSelections] as SelectOption[]
export const VariableTypeSelectionsWRef = [..._VariableTypeSelectionsWRef] as SelectOption[]
export const VariableTypesSelectionsWCode = [..._VariableTypesSelectionsWCode] as SelectOption[]
export const FileVariableTypesSelections = [..._FileVariableTypesSelections] as SelectOption[]

type VariableTypeBase = (typeof _BaseVariableTypeSelections)[number]['value']
type VariableTypeWithRef = (typeof _VariableTypeSelectionsWRef)[number]['value']
type VariableTypeWithCode = (typeof _VariableTypesSelectionsWCode)[number]['value']
type VariableTypeFile = (typeof _FileVariableTypesSelections)[number]['value']

export type AllVariableTypes =
  | VariableTypeBase
  | VariableTypeWithRef
  | VariableTypeWithCode
  | VariableTypeFile
export type TSVariableType = string | boolean | number | null
