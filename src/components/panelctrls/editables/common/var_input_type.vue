<template>
  <!-- 值输入 -->
  <cp_var_select
    v-if="itemType === 'Ref'"
    :size="size"
    :options="selfVarSelections"
    :value="stringValue"
    @update:value="updateValue"
  />
  <n-switch
    v-else-if="itemType === 'Boolean'"
    :size="nswitchSize"
    :disabled="!isEditorMode"
    :value="booleanValue"
    @update:value="updateValue"
  />
  <n-input
    v-else-if="itemType === 'String'"
    :size="size"
    :value="stringValue"
    :disabled="!isEditorMode"
    @blur="isEditing = false"
    @focus="isEditing = true"
    @update:value="updateValue"
  />
  <n-input-number
    v-else-if="itemType === 'Integer'"
    :size="size"
    :value="numberValue"
    :disabled="!isEditorMode"
    @blur="isEditing = false"
    @focus="isEditing = true"
    @update:value="updateValue"
    :show-button="false"
    :precision="0"
  />
  <n-input-number
    v-else-if="itemType === 'Number'"
    :size="size"
    :value="numberValue"
    :disabled="!isEditorMode"
    @blur="isEditing = false"
    @focus="isEditing = true"
    @update:value="updateValue"
    :show-button="false"
  />
</template>

<script setup lang="ts">
import { type Ref, ref, computed, h, inject, defineAsyncComponent } from 'vue'
import { NSwitch, NInput, NInputNumber, type SelectOption } from 'naive-ui'
import { isEditorMode, isEditing } from '@/hooks/useVFlowAttribute'
import { type VariableTypeName, type VariableType } from '@/utils/schemas.ts'
const cp_var_select = defineAsyncComponent(() => import('./var_select.vue'))

type SizeType = 'tiny' | 'small' | 'medium' | 'large'
type NSwitchSize = 'small' | 'medium' | 'large'

interface Props {
  itemType: VariableTypeName
  itemValue: VariableType
  selfVarSelections: SelectOption[]
  size?: SizeType
}

const props = withDefaults(defineProps<Props>(), {
  size: 'small',
})

const emit = defineEmits<{
  'update:itemValue': [value: VariableType]
}>()

// 更新 value
const updateValue = (newValue: VariableType): void => {
  emit('update:itemValue', newValue)
}

const nswitchSize = computed((): NSwitchSize => {
  switch (props.size) {
    case 'large':
    case 'medium':
      return 'large'
    case 'small':
      return 'medium'
    case 'tiny':
      return 'small'
    default:
      return 'medium'
  }
})

// 计算属性确保类型安全
const stringValue = computed(() => {
  if (props.itemType === 'String') {
    if (typeof props.itemValue !== 'string') {
      throw new Error('Expected string value')
    }
    return props.itemValue
  }
  return undefined
})

const numberValue = computed(() => {
  if (props.itemType === 'Integer' || props.itemType === 'Number') {
    if (typeof props.itemValue !== 'number') {
      throw new Error('Expected number value')
    }
    return props.itemValue
  }
  return undefined
})

const booleanValue = computed(() => {
  if (props.itemType === 'Boolean') {
    if (typeof props.itemValue !== 'boolean') {
      throw new Error('Expected boolean value')
    }
    return props.itemValue
  }
  return undefined
})
</script>

<style scoped>
.flexctitem {
  align-content: center;
  align-items: center;
}
</style>
