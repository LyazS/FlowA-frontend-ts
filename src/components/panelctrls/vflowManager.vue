<script setup lang="ts">
import { type Ref, ref, onMounted, reactive, h, inject, computed, watch } from 'vue'
import {
  useDialog,
  NText,
  NButton,
  NIcon,
  NButtonGroup,
  NScrollbar,
  NModal,
  NCard,
  NFlex,
  NGrid,
  NGridItem,
  NDivider,
  NDropdown,
  NEllipsis,
  NUpload,
  NSkeleton,
  useMessage,
  NInput,
  type UploadCustomRequestOptions,
} from 'naive-ui'
import {
  Ellipse,
  Close,
  Add,
  Pencil,
  DownloadOutline,
  CloudUploadOutline,
  CloudDownloadOutline,
  CaretDown,
} from '@vicons/ionicons5'
import {
  type WorkflowModeType,
  selectedNodeId,
  isEditorMode,
  isEditing,
  isShowCodeEditor,
  WorkflowID,
  WorkflowMode,
  WorkflowName,
  isShowVFlowMgr,
} from '@/hooks/useVFlowAttribute'
import { useVFlowRequest } from '@/services/useVFlowRequest'
import type { FAWorkflowInfo, FAReleaseWorkflowInfo } from '@/services/useVFlowRequest'
import type { ButtonType } from '@/schemas/naiveui_schemas'
import { renderIcon } from '@/utils/tools'
const { createNewWorkflow, getWorkflows, uploadWorkflow } = useVFlowRequest()

const message = useMessage()
const dialog = useDialog()
const release_wfs = ref<FAReleaseWorkflowInfo[]>([])
const workflows = ref<(FAWorkflowInfo & { type: ButtonType })[]>([])

const release_titlename = computed(() => {
  if (!WorkflowID.value) {
    return '选择工作流以查看版本记录'
  }
  return `【${WorkflowName.value}】的版本记录`
})

const createNewWorkflow_btn = async () => {
  const new_name = ref('')
  dialog.warning({
    title: '新建工作流',
    content: () =>
      h(
        NInput,
        {
          value: new_name.value,
          onUpdateValue: (value) => {
            new_name.value = value
          },
        },
        {},
      ),
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      if (new_name.value.trim() === '') {
        message.error('名称不能为空')
        return
      }
      selectedNodeId.value = null
      await createNewWorkflow(new_name.value)
      isShowVFlowMgr.value = false
    },
  })
}

const updateWorkflows = async () => {
  const res = await getWorkflows()
  console.log(res)
  workflows.value = []
  for (const item of res) {
    let wf_type: ButtonType = 'default'
    if (item.wid == WorkflowID.value) {
      wf_type = 'success'
    }
    workflows.value.push({
      ...item,
      type: wf_type,
    })
  }
}
const wfOperations = [
  {
    label: '重命名',
    key: 'rename',
    icon: renderIcon(Pencil),
  },
  {
    label: '导出工作流',
    key: 'exportWF',
    icon: renderIcon(CloudDownloadOutline),
  },
  {
    label: '删除工作流',
    key: 'deleteWF',
    icon: renderIcon(Close),
  },
]
const handleSelectWFOperator = (key: string, wid: string, wname: string) => {
  // if (key === 'rename') {
  //   remaneWorkflow_btn(wid, wname)
  // } else if (key === 'exportWF') {
  //   downloadWorkflow_btn(wid)
  // } else if (key === 'deleteWF') {
  //   deleteWorkflow_btn(wid, wname)
  // }
}

const uploadWF = async ({
  file,
  data,
  headers,
  withCredentials,
  action,
  onFinish,
  onError,
  onProgress,
}: UploadCustomRequestOptions): Promise<void> => {
  if (file.file?.type === 'application/json') {
    const reader = new FileReader()

    reader.onload = async (event: ProgressEvent<FileReader>) => {
      try {
        if (!event.target?.result) {
          throw new Error('读取文件内容为空')
        }
        const jsonContent = JSON.parse(event.target.result as string)
        await uploadWorkflow(file.name.replace('.json', ''), jsonContent)
        isShowVFlowMgr.value = false
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : '未知错误'
        message.error(`JSON 解析失败: ${errorMessage}`)
      }
    }

    reader.onerror = () => {
      const error = reader.error || new Error('文件读取失败')
      message.error(`读取文件失败: ${error}`)
    }

    reader.readAsText(file.file)
  } else {
    const error = new Error('不支持的文件类型')
    message.error(error.message)
  }
}

watch(isShowVFlowMgr, async (newVal) => {
  if (newVal) {
    await updateWorkflows()
    // await updateResults()
  }
})

onMounted(async () => {
  await updateWorkflows()
  // await updateResults()
})
</script>
<template>
  <n-modal v-model:show="isShowVFlowMgr" :close-on-esc="true" transform-origin="center">
    <n-card
      title="工作流管理器"
      closable
      @close="isShowVFlowMgr = false"
      :style="{ width: '80%', maxWidth: '1000px' }"
    >
      <n-grid x-gap="0" :cols="15">
        <n-grid-item :span="8">
          <n-flex>
            <n-flex :style="{ flexWrap: 'nowrap', width: '100%' }">
              <n-button type="info" text @click="createNewWorkflow_btn">
                <template #icon>
                  <n-icon>
                    <Add />
                  </n-icon>
                </template>
                新建工作流
              </n-button>
              <n-upload :show-file-list="false" :custom-request="uploadWF">
                <n-flex justify="center" align="center" :style="{ height: '100%' }">
                  <n-button type="info" text>
                    <template #icon>
                      <n-icon>
                        <CloudUploadOutline />
                      </n-icon>
                    </template>
                    导入工作流
                  </n-button>
                </n-flex>
              </n-upload>
            </n-flex>
            <n-scrollbar style="max-height: 50vh">
              <n-flex vertical :style="{ width: '100%' }">
                <template v-for="(item, idx) in workflows" :key="'workflow_' + idx">
                  <n-flex class="flexctitem" :style="{ width: '100%' }" :wrap="false">
                    <n-button
                      @click="loadWorkflow_btn(item.wid)"
                      secondary
                      :type="item.type"
                      :style="{ flex: '1' }"
                    >
                      <n-ellipsis style="max-width: 12em"> {{ item.name }}</n-ellipsis>
                    </n-button>
                    <n-dropdown
                      :options="wfOperations"
                      @select="(value) => handleSelectWFOperator(value, item.wid, item.name)"
                    >
                      <n-button size="large" text>
                        <template #icon>
                          <n-icon>
                            <CaretDown />
                          </n-icon>
                        </template>
                      </n-button>
                    </n-dropdown>
                  </n-flex>
                </template>
              </n-flex>
            </n-scrollbar>
          </n-flex>
        </n-grid-item>
        <n-grid-item :span="1">
          <n-flex justify="center" align="center" :style="{ height: '100%' }">
            <n-divider vertical :style="{ height: '100%' }" />
          </n-flex>
        </n-grid-item>
        <n-grid-item :span="6">
          <n-text>{{ release_titlename }}</n-text>
          <n-skeleton v-if="!WorkflowID" text :repeat="5" :sharp="false" size="medium" />
          <n-scrollbar v-else style="max-height: 50vh">
            <n-flex vertical :style="{ width: '100%' }">
              <n-button
                v-for="(item, idx) in release_wfs"
                :key="'result_' + idx"
                @click="loadResult_btn(item.tid)"
                secondary
                :type="item.type"
                style="text-align: left"
              >
                <template #icon>
                  <n-icon size="10" :color="item.status">
                    <Ellipse />
                  </n-icon>
                </template>
                {{ item.label }}
              </n-button>
            </n-flex>
          </n-scrollbar>
        </n-grid-item>
      </n-grid>
    </n-card>
  </n-modal>
</template>

<style scoped>
.flexctitem {
  align-content: center;
  align-items: center;
}
</style>
