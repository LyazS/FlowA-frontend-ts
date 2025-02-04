<script setup lang="ts">
import {
  type Ref,
  computed,
  ref,
  watch,
  nextTick,
  inject,
  defineAsyncComponent,
  onUnmounted,
  onMounted,
  h,
  type VNode,
} from 'vue'
import { NFlex, NH2, NCard, NScrollbar, NInput, NIcon, NText, NDivider } from 'naive-ui'
import { Panel, useVueFlow, type Node } from '@vue-flow/core'
import { CreateOutline } from '@vicons/ionicons5'
import { useNodeUtils } from '@/hooks/useNodeUtils'
import { mapVarItemToSelect } from '@/utils/tools'
import { selectedNodeId, isEditorMode, isEditing } from '@/hooks/useVFlowAttribute'
import {
  type VFNodeData,
  VFNodeFlag,
  VFNodeAttachingPos,
  VFNodeAttachingType,
} from '@/components/nodes/VFNodeInterface'
import type VFNode from '@/components/nodes/VFNodeClass'

const { findVarFromIO, recursiveFindVariables } = useNodeUtils()

// const editable_tagoutputs = defineAsyncComponent(() => import('./editables/tagoutputs.vue')) as EditableComponent;
// const editable_packoutputs = defineAsyncComponent(() => import('./editables/packoutputs.vue')) as EditableComponent;
// const editable_condoutputs = defineAsyncComponent(() => import('./editables/condoutputs.vue')) as EditableComponent;
// const editable_codeoutputs = defineAsyncComponent(() => import('./editables/codeoutputs.vue')) as EditableComponent;
// const editable_iter_input = defineAsyncComponent(() => import('./editables/iter_input.vue')) as EditableComponent;
// const editable_textinput = defineAsyncComponent(() => import('./editables/textinput.vue')) as EditableComponent;
// const editable_textprint = defineAsyncComponent(() => import('./editables/textprint.vue')) as EditableComponent;
// const editable_texttag = defineAsyncComponent(() => import('./editables/texttag.vue')) as EditableComponent;
const editable_header = defineAsyncComponent(() => import('./editables/common/header.vue'))
// const editable_codeeditor = defineAsyncComponent(() => import('./editables/codeeditor.vue')) as EditableComponent;
const editable_vars_input = defineAsyncComponent(() => import('./editables/vars_input.vue'))
// const editable_llmprompts = defineAsyncComponent(() => import('./editables/llmprompts.vue')) as EditableComponent;
// const editable_aggregatebranchs = defineAsyncComponent(() => import('./editables/aggregatebranchs.vue')) as EditableComponent;
// const editable_llmmodel = defineAsyncComponent(() => import('./editables/llmmodel.vue')) as EditableComponent;
// const editable_httprequests = defineAsyncComponent(() => import('./editables/httprequests.vue')) as EditableComponent;
// const editable_httptimeout = defineAsyncComponent(() => import('./editables/httptimeout.vue')) as EditableComponent;

const { findNode, getHandleConnections } = useVueFlow()

const nodeId = computed(() => selectedNodeId.value as string)
// 获取节点
type NodeWithVFData = Omit<Node, 'data'> & { data: VFNode }

const thisnode = computed<NodeWithVFData | undefined>(() => {
  const node = findNode(nodeId.value)
  if (node && node.data) return node as NodeWithVFData
  return undefined
})
watch(
  () => thisnode.value?.data,
  () => {
    // autoSaveWorkflow()
  },
  { deep: true },
)

// 节点标题相关
const isEditingTitle = ref(false)
const titleInputRef = ref<HTMLInputElement | null>(null)
const titleInputText = ref('')
watch(
  () => nodeId.value,
  (newVal) => {
    titleInputText.value = thisnode.value?.data.label || ''
  },
  { immediate: true },
)

const startEditTilte = () => {
  if (!isEditorMode.value) return
  isEditingTitle.value = true
  isEditing!.value = true
  nextTick(() => {
    titleInputRef.value?.focus()
  })
}

const saveTitle = () => {
  isEditing!.value = false
  isEditingTitle.value = false
  const newLabel = titleInputText.value.trim()
  if (thisnode.value) {
    thisnode.value.data.label = newLabel || thisnode.value.data.placeholderlabel
  }
}

// 输出变量字典{列表}
const outputVarSelections = computed(() => {
  const selections: Record<string, any[]> = {}
  if (!thisnode.value) return selections
  for (const hid of Object.keys(thisnode.value.data.connections.outputs)) {
    selections[hid] = recursiveFindVariables(nodeId.value, [], [], [], false, [], false, [hid]).map(
      (item) => mapVarItemToSelect(item),
    )
  }
  return selections
})

// 自身可用变量
const selfVarSelections = computed(() => {
  return recursiveFindVariables(nodeId.value, ['self'], [], [], false, [], false, []).map((item) =>
    mapVarItemToSelect(item),
  )
})

const selfVarSelections_aouput = computed(() => {
  return recursiveFindVariables(nodeId.value, ['attach_output'], [], [], false, [], false, []).map(
    (item) => mapVarItemToSelect(item),
  )
})

// 渲染节点payload的内置变量
const payloadInnerComponents = computed<Record<string, VNode>>(() => {
  const components: Record<string, VNode> = {}
  if (!thisnode.value) return components
  thisnode.value.data.payloads.order.forEach((pid) => {
    const payload = thisnode.value!.data.payloads.byId[pid]
    // if (payload.uitype === 'texttag') {
    //   components[pid] = h(editable_texttag, { nodeId: nodeId.value, pid })
    // }
  })
  return components
})

// 渲染节点payload数据
const payloadComponents = computed<Record<string, VNode>>(() => {
  const components: Record<string, VNode> = {}
  if (!thisnode.value) return components
  thisnode.value.data.payloads.order.forEach((pid) => {
    const payload = thisnode.value!.data.payloads.byId[pid]
    let component: VNode | null = null
    switch (payload.uitype) {
      // case 'textinput':
      //   component = h(editable_textinput, { nodeId: nodeId.value, pid })
      //   break
      // case 'textprint':
      //   component = h(editable_textprint, {
      //     nodeId: nodeId.value,
      //     pid,
      //     selfVarSelections: selfVarSelections.value,
      //   })
      //   break
      // case 'codeeditor':
      //   component = h(editable_codeeditor, { nodeId: nodeId.value, pid })
      //   break
      case 'vars_input':
        component = h(editable_vars_input, {
          nodeId: nodeId.value,
          pid,
          selfVarSelections: selfVarSelections.value,
        })
        break
      // case 'llmprompts':
      //   component = h(editable_llmprompts, { nodeId: nodeId.value, pid })
      //   break
      // case 'iter_input':
      //   component = h(editable_iter_input, {
      //     nodeId: nodeId.value,
      //     pid,
      //     selfVarSelections: selfVarSelections.value,
      //   })
      //   break
      // case 'aggregatebranch':
      //   component = h(editable_aggregatebranchs, {
      //     nodeId: nodeId.value,
      //     pid,
      //     selfVarSelections: selfVarSelections.value,
      //     inputNodes: inputNodes.value,
      //   })
      //   break
      // case 'llmmodel':
      //   component = h(editable_llmmodel, {
      //     nodeId: nodeId.value,
      //     pid,
      //     selfVarSelections: selfVarSelections.value,
      //   })
      //   break
      // case 'httprequests':
      //   component = h(editable_httprequests, {
      //     nodeId: nodeId.value,
      //     pid,
      //     selfVarSelections: selfVarSelections.value,
      //   })
      //   break
      // case 'httptimeout':
      //   component = h(editable_httptimeout, { nodeId: nodeId.value, pid })
      //   break
    }
    if (component) components[pid] = component
  })
  return components
})

// 渲染输出的连接
const outputsComponents = computed<VNode | null>(() => {
  if (!thisnode.value) return null
  const uitype = thisnode.value.data.config.outputsUIType
  switch (uitype) {
    // case 'tagoutputs':
    //   return h(editable_tagoutputs, {
    //     nodeId: nodeId.value,
    //     outputVarSelections: outputVarSelections.value,
    //   })
    // case 'packoutputs':
    //   return h(editable_packoutputs, {
    //     nodeId: nodeId.value,
    //     selfVarSelections: selfVarSelections_aouput.value,
    //   })
    // case 'condoutputs':
    //   return h(editable_condoutputs, {
    //     nodeId: nodeId.value,
    //     selfVarSelections: selfVarSelections.value,
    //   })
    // case 'codeoutputs':
    //   return h(editable_codeoutputs, { nodeId: nodeId.value })
    default:
      return null
  }
})

interface InputNode {
  srcid: string
  srcohid: string
}

const inputNodes = computed<Record<string, InputNode[]>>(() => {
  const preNodes: Record<string, InputNode[]> = {}
  if (!thisnode.value) return preNodes
  for (const hid of Object.keys(thisnode.value.data.connections.inputs)) {
    const edges = getHandleConnections({ id: hid, type: 'target', nodeId: nodeId.value })
    preNodes[hid] = edges.map((edge) => ({
      srcid: edge.source,
      srcohid: edge.sourceHandle,
    })) as InputNode[]
  }
  return preNodes
})

const nodedatatext = computed(() => {
  return thisnode.value ? JSON.stringify(thisnode.value.data, null, 2) : ''
})

onMounted(() => {})
onUnmounted(() => {
  if (isEditing) isEditing.value = false
})
</script>

<template>
  <n-scrollbar style="max-height: calc(100vh - 80px); border-radius: 10px">
    <n-card header-style="height: 70px;" closable @close="selectedNodeId = null">
      <template #header>
        <n-h2
          prefix="bar"
          align-text
          v-if="!isEditingTitle"
          class="card-title"
          @click="startEditTilte"
        >
          <n-text type="success" strong>{{ thisnode?.data.label }}</n-text>
          <n-icon size="17" depth="2">
            <CreateOutline />
          </n-icon>
        </n-h2>
        <n-input
          v-else
          v-model:value="titleInputText"
          :placeholder="thisnode?.data.placeholderlabel"
          ref="titleInputRef"
          :bordered="false"
          @blur="saveTitle"
          class="title-input"
        />
      </template>
      <n-flex vertical :key="`${nodeId}-main`">
        <n-flex
          vertical
          v-if="Object.keys(payloadInnerComponents).length > 0"
          :style="{ 'padding-bottom': '10px' }"
          :key="`${nodeId}-inner`"
        >
          <editable_header type="default">内置变量</editable_header>
          <n-flex vertical>
            <template v-for="(comp, pid) in payloadInnerComponents" :key="`${nodeId}-${pid}-inner`">
              <component v-if="comp" :is="comp" />
            </template>
          </n-flex>
        </n-flex>
        <n-flex
          vertical
          v-if="Object.keys(payloadComponents).length > 0"
          :key="`${nodeId}-payloads`"
        >
          <template v-for="(comp, pid) in payloadComponents" :key="`${nodeId}-${pid}-payloads`">
            <component v-if="comp" :is="comp" :style="{ 'padding-bottom': '10px' }" />
          </template>
        </n-flex>
        <component v-if="outputsComponents" :is="outputsComponents" :key="`${nodeId}-outputs`" />
        <n-divider />
        <pre>{{ inputNodes }}</pre>
        <pre>{{ nodeId }}</pre>
        <pre>{{ nodedatatext }}</pre>
      </n-flex>
    </n-card>
  </n-scrollbar>
</template>

<style scoped>
.card-title {
  cursor: pointer;
  padding: 0;
  font-weight: 500;
}

.title-input {
  font-weight: 500;
}
</style>
