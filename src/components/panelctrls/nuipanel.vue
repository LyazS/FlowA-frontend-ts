<script setup lang="ts">
import { computed, ref, watch, provide, defineAsyncComponent, inject } from 'vue'
import {
  useMessage,
  darkTheme,
  NConfigProvider,
  NMessageProvider,
  NCard,
  NButton,
  NFlex,
  NText,
  NSelect,
  NInputGroup,
  NInputGroupLabel,
  NEllipsis,
} from 'naive-ui'
import { Panel, useVueFlow } from '@vue-flow/core'
// import { useFlowAOperation } from '@/services/useFlowAOperation'
import {
  selectedNodeId,
  isEditorMode,
  isEditing,
  isShowCodeEditor,
  AutoSaveMessage,
} from '@/hooks/useVFlowAttribute'
import nodepanel from './nodepanel.vue'
// import ctrlpanel from './ctrlpanel.vue';

const AceCodeEditor = defineAsyncComponent(() => import('./AceCodeEditor.vue'))
// const FlowResults = defineAsyncComponent(() => import('./FlowResults.vue'));
// const Jinja2Render = defineAsyncComponent(() => import('@/components/panelctrls/Jinja2Render.vue'));

// const { TaskID, WorkflowID, WorkflowName, AutoSaveMessage } = useFlowAOperation();

// const isShowFlowResults_inner = ref(false);
// const isShowFlowResults = computed<boolean>({
//     get: () => {
//         if (!!WorkflowID.value) { return isShowFlowResults_inner.value; }
//         else { return true; }
//     },
//     set: (val: boolean) => {
//         if (!!WorkflowID.value) { isShowFlowResults_inner.value = val; }
//         else { isShowFlowResults_inner.value = true; }
//     }
// });
// provide('isShowFlowResults', isShowFlowResults);

// const isShowJinja2Render = ref(false);
// provide("isShowJinja2Render", isShowJinja2Render);
</script>

<template>
  <Panel position="top-left" :style="{ width: 'auto' }">
    <n-flex justify="flex-start">
      <n-text depth="3">{{ AutoSaveMessage }}</n-text>
    </n-flex>
  </Panel>
  <!-- <Panel position="top-right" :style="{ width: 'auto' }">
        <ctrlpanel />
    </Panel> -->
  <Panel class="nodepanel" position="top-right">
    <nodepanel v-if="!!selectedNodeId" />
  </Panel>
  <AceCodeEditor />
  <!-- <FlowResults />
  <Jinja2Render v-if="TaskID" /> -->
</template>

<style scoped>
.nodepanel {
  margin-top: 65px;
  width: 600px;
  border-radius: 10px;
}

.nodepanel:hover {
  box-shadow: 0 0 20px rgb(138, 203, 236);
  transition: box-shadow 0.2s ease;
}
</style>
