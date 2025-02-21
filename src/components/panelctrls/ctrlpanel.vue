<script setup lang="ts">
import { computed, provide, ref, h, watch, inject, onMounted, onUnmounted, nextTick } from 'vue'
import {
  useMessage,
  useDialog,
  darkTheme,
  NConfigProvider,
  NMessageProvider,
  NCard,
  NButton,
  NButtonGroup,
  NDropdown,
  NInput,
  NPopover,
  NFlex,
  NIcon,
  NEllipsis,
} from 'naive-ui'
import {
  Add,
  Play,
  ArrowUndo,
  ArrowBack,
  PlayCircleOutline,
  Stop,
  DocumentText,
} from '@vicons/ionicons5'
import { useVFlowRequest } from '@/services/useVFlowRequest'
import {
  WorkflowModeType,
  selectedNodeId,
  isEditorMode,
  isEditing,
  isShowCodeEditor,
  WorkflowID,
  WorkflowMode,
  WorkflowName,
  isShowVFlowMgr,
  isShowJinja2Render,
} from '@/hooks/useVFlowAttribute'
const { switchWorkflow, runflow, stopflow } = useVFlowRequest()
interface RunflowParams {
  before: () => Promise<void>
  success: (data: { success: boolean }) => void
  error: (err: string) => void
}

const message = useMessage()
const dialog = useDialog()

const run_loading = ref<boolean>(false)
// const click2runflow = async (): Promise<void> => {
//   const res = await runflow({
//     before: async () => {
//       run_loading.value = true
//       console.log('before run')
//     },
//     success: (data: { success: boolean }) => {
//       console.log('success run')
//       run_loading.value = false
//       if (data.success) {
//         message.success('已发送运行')
//       } else {
//         message.error(`工作流验证失败，请检查`)
//       }
//     },
//     error: (err: string) => {
//       run_loading.value = false
//       message.error(`运行失败: ${err}`)
//     },
//   } as RunflowParams)
//   console.log(res)
// }
</script>

<template>
  <n-flex justify="flex-end">
    <n-button
      class="glow-btn"
      round
      tertiary
      type="primary"
      style="min-width: 200px"
      @click="isShowVFlowMgr = true"
    >
      <n-ellipsis v-if="WorkflowName" style="max-width: 240px"> - {{ WorkflowName }} - </n-ellipsis>
      <n-ellipsis v-else style="max-width: 240px"> - 工作流管理器 - </n-ellipsis>
    </n-button>
    <!-- <n-button
      v-if="TaskID"
      class="glow-btn"
      round
      tertiary
      type="primary"
      style="width: 100px"
      @click="isShowJinja2Render = true && !!TaskID"
    >
      Jinja2渲染
    </n-button> -->
    <template v-if="WorkflowMode === WorkflowModeType.Edit">
      <n-popover trigger="hover">
        <template #trigger>
          <n-button class="glow-btn" circle tertiary type="success" @click="runflow()">
            <template #icon>
              <n-icon>
                <Play />
              </n-icon>
            </template>
            <!-- 运行 -->
          </n-button>
        </template>
        <span>增量运行</span>
      </n-popover>
      <n-popover trigger="hover">
        <template #trigger>
          <n-button class="glow-btn" circle tertiary type="success">
            <template #icon>
              <n-icon>
                <PlayCircleOutline />
              </n-icon>
            </template>
            <!-- 运行 -->
          </n-button>
        </template>
        <span>全量运行</span>
      </n-popover>
    </template>
    <template v-else-if="WorkflowMode === WorkflowModeType.View">
      <n-popover trigger="hover">
        <template #trigger>
          <n-button
            class="glow-btn"
            circle
            tertiary
            type="success"
            @click="switchWorkflow(WorkflowID)"
          >
            <template #icon>
              <n-icon>
                <ArrowBack />
              </n-icon>
            </template>
          </n-button>
        </template>
        <span>返回编辑</span>
      </n-popover>
    </template>
    <template v-else-if="WorkflowMode === WorkflowModeType.Run">
      <n-popover trigger="hover">
        <template #trigger>
          <n-button class="glow-btn" circle tertiary type="success">
            <template #icon>
              <n-icon>
                <DocumentText />
              </n-icon>
            </template>
          </n-button>
        </template>
        <span>Jinja2渲染</span>
      </n-popover>
      <n-popover trigger="hover">
        <template #trigger>
          <n-button class="glow-btn" tertiary circle type="success" @click="stopflow()">
            <template #icon>
              <n-icon>
                <Stop />
              </n-icon>
            </template>
          </n-button>
        </template>
        <span>中止运行</span>
      </n-popover>
    </template>
  </n-flex>
</template>
<style scoped>
.glow-btn:hover {
  box-shadow: 0 0 20px rgb(138, 203, 236);
  transition: box-shadow 0.2s ease;
}
</style>
