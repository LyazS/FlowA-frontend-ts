import { ref } from 'vue'
import type { CodeEditorLanguage } from '@/components/nodes/VFNodeInterface'

export const selectedNodeId = ref<string | null>(null)
export const isEditorMode = ref(true)
export const isEditing = ref(false)

export const isShowCodeEditor = ref(false)
export const CodeEditorPath = ref<(string | number)[]>([])
export const CodeEditorLangType = ref<CodeEditorLanguage>('text')
