import { ref, computed } from 'vue'
import type { CodeEditorLanguage } from '@/components/nodes/VFNodeInterface'

export const selectedNodeId = ref<string | null>(null)
export const isEditing = ref(false)

export const isShowCodeEditor = ref(false)
export const CodeEditorPath = ref<(string | number)[]>([])
export const CodeEditorLangType = ref<CodeEditorLanguage>('text')

export const AutoSaveMessage = ref<string>('')
export const Jinja2RenderNodeIDs = ref<string[]>([])

export enum WorkflowModeType {
  Edit = 'Edit',
  View = 'View',
  Run = 'Run',
}
export const WorkflowMode = ref(WorkflowModeType.Edit)
export const isEditorMode = computed(() => WorkflowMode.value === WorkflowModeType.Edit)
export const WorkflowID = ref<string | null>(null)
export const WorkflowName = ref<string | null>(null)

export const isShowFlowResults = ref(false)
