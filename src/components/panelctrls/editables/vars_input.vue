<template>
  <n-flex vertical>
    <n-flex class="flexctitem" justify="space-between">
      <editable_header type="success"> 输入变量 </editable_header>
      <n-button text type="success" @click="addVariable" :disabled="!isEditorMode">
        <template #icon>
          <n-icon>
            <Add />
          </n-icon>
        </template>
        新增变量
      </n-button>
    </n-flex>
    <cp_var_input
      v-for="(pvar, vindex) in thisnode.data.payloads.byId[pid].data"
      :key="vindex"
      v-model:itemKey="pvar.key"
      v-model:itemType="pvar.type"
      v-model:itemValue="pvar.value"
      :selfVarSelections="selfVarSelections"
      :itemIdx="vindex"
      @remove="rmVariable(vindex)"
    />
  </n-flex>
</template>

<script lang="ts" setup>
import { ref, computed, defineAsyncComponent, inject, type ComputedRef } from 'vue'
import { useMessage, NFlex, NButton, NIcon } from 'naive-ui'
import { Add } from '@vicons/ionicons5'
import { useVueFlow } from '@vue-flow/core'
import type { Node } from '@vue-flow/core'
import { isEditorMode } from '@/hooks/useVFlowAttribute'

interface VariableItem {
  key: string
  type: string
  value: string
}

interface Props {
  nodeId: string
  selfVarSelections: Array<{ label: string; value: string }>
  pid: string
}

const props = defineProps<Props>()
const { findNode } = useVueFlow()

const thisnode = computed(() => findNode(props.nodeId)) as ComputedRef<Node>

const addVariable = (): void => {
  const newVar: VariableItem = { key: '', type: 'String', value: '' }
  thisnode.value.data.payloads.byId[props.pid].data.push(newVar)
}

const rmVariable = (index: number): void => {
  thisnode.value.data.payloads.byId[props.pid].data.splice(index, 1)
}

const editable_header = defineAsyncComponent(() => import('./common/header.vue'))
const cp_var_input = defineAsyncComponent(() => import('./common/var_input.vue'))
</script>

<style scoped>
.flexctitem {
  align-content: center;
  align-items: center;
}
</style>
