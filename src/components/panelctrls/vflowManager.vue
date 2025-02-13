<script setup lang="ts">
import { type Ref, ref, onMounted, reactive, h, inject, computed, watch } from 'vue'
import {
  useDialog,
  NText,
  NH3,
  NH4,
  NH5,
  NH6,
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
  SaveOutline,
  EllipsisVertical,
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
import { renderIcon, formatDateString } from '@/utils/tools'
import type { pad } from 'lodash'
const {
  createNewWorkflow,
  getWorkflows,
  loadWorkflow,
  renameWorkflow,
  uploadWorkflow,
  returnEditMode,
  downloadWorkflow,
  deleteWorkflow,
  loadReleaseWorkflow,
  recordReleaseWorkflow,
  getReleaseWorkflows,
  downloadReleaseWorkflow,
  deleteReleaseWorkflow,
  editReleaseWorkflow,
} = useVFlowRequest()

const message = useMessage()
const dialog = useDialog()
const release_wfs = ref<FAReleaseWorkflowInfo[]>([])
const workflows = ref<(FAWorkflowInfo & { type: ButtonType })[]>([])

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
  // console.debug(res)
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

const updateReleaseWorkflows = async () => {
  if (!WorkflowID.value) return
  const res = await getReleaseWorkflows(WorkflowID.value)
  release_wfs.value = res
}

const remaneWorkflow_btn = async (wid: string, wname: string) => {
  const new_name = ref(wname)
  dialog.info({
    title: '重命名工作流',
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
      await renameWorkflow(wid, new_name.value, {
        success: async (data) => {
          message.success(`重命名为【${new_name.value}】`)
        },
        error: async (err) => {
          message.error(`重命名【${new_name.value}】失败: ${err}`)
        },
      })
      await updateWorkflows()
    },
  })
}

const downloadWorkflow_btn = async (wid: string) => {
  await downloadWorkflow(wid)
}

const deleteWorkflow_btn = async (wid: string, wname: string) => {
  dialog.warning({
    title: '即将删除工作流',
    content: `【${wname}】`,
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      await deleteWorkflow(wid)
      await updateWorkflows()
    },
  })
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
  if (key === 'rename') {
    remaneWorkflow_btn(wid, wname)
  } else if (key === 'exportWF') {
    downloadWorkflow_btn(wid)
  } else if (key === 'deleteWF') {
    deleteWorkflow_btn(wid, wname)
  }
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

const loadWorkflow_btn = async (wid: string) => {
  if (WorkflowID.value == wid) return
  await loadWorkflow(wid)
  isShowVFlowMgr.value = false
}

const loadReleaseWorkflow_btn = async (rwid: string, rname: string) => {
  await loadReleaseWorkflow(WorkflowID.value, rwid)
  isShowVFlowMgr.value = false
  message.success(`【${rname}】版本加载成功`)
}

const recordReleaseWF_btn = async () => {
  const record_name = ref('')
  const record_desc = ref('')
  dialog.warning({
    title: '记录当前版本工作流',
    content: () =>
      h(
        NFlex,
        {
          vertical: true,
          size: 'medium', // 可调整间距大小或使用[水平间距, 垂直间距]格式
        },
        {
          default: () => [
            h(NInput, {
              value: record_name.value,
              onUpdateValue: (value) => {
                record_name.value = value
              },
              placeholder: '版本名称',
            }),
            h(NInput, {
              type: 'textarea',
              autosize: { minRows: 3, maxRows: 5 },
              value: record_desc.value,
              onUpdateValue: (value) => {
                record_desc.value = value
              },
              placeholder: '版本描述',
            }),
          ],
        },
      ),
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      if (record_name.value.trim() === '') {
        message.error('名称不能为空')
        return
      }
      await recordReleaseWorkflow(record_name.value, record_desc.value)
      await updateReleaseWorkflows()
    },
  })
}

const rwfOperations = [
  {
    label: '编辑',
    key: 'edit',
    icon: renderIcon(Pencil),
  },
  {
    label: '导出',
    key: 'export',
    icon: renderIcon(CloudDownloadOutline),
  },
  {
    label: '删除',
    key: 'delete',
    icon: renderIcon(Close),
  },
]

const editReleaseWorkflow_btn = async (
  wid: string,
  rwid: string,
  rwname: string,
  rwdesc: string,
) => {
  const edit_name = ref(rwname)
  const edit_desc = ref(rwdesc)
  dialog.info({
    title: '编辑版本记录',
    content: () =>
      h(
        NFlex,
        {
          vertical: true,
          size: 'medium', // 可调整间距大小或使用[水平间距, 垂直间距]格式
        },
        {
          default: () => [
            h(NInput, {
              value: edit_name.value,
              onUpdateValue: (value) => {
                edit_name.value = value
              },
              placeholder: '版本名称',
            }),
            h(NInput, {
              type: 'textarea',
              autosize: { minRows: 3, maxRows: 5 },
              value: edit_desc.value,
              onUpdateValue: (value) => {
                edit_desc.value = value
              },
              placeholder: '版本描述',
            }),
          ],
        },
      ),
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      if (edit_name.value.trim() === '') {
        message.error('名称不能为空')
        return
      }
      if (!WorkflowID.value) return
      await editReleaseWorkflow(WorkflowID.value, rwid, edit_name.value, edit_desc.value)
      await updateReleaseWorkflows()
    },
  })
}

const deleteReleaseWorkflow_btn = async (wid: string, rwid: string, rwname: string) => {
  dialog.warning({
    title: '即将删除版本记录',
    content: `【${rwname}】`,
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      await deleteReleaseWorkflow(wid, rwid)
      await updateWorkflows()
    },
  })
}

const downloadReleaseWorkflow_btn = async (wid: string, rwid: string) => {
  await downloadReleaseWorkflow(wid, rwid)
}

const handleSelectRWFOperator = (key: string, item: FAReleaseWorkflowInfo) => {
  if (!WorkflowID.value) return
  if (key === 'edit') {
    editReleaseWorkflow_btn(WorkflowID.value, item.rwid, item.name, item.description)
  } else if (key === 'export') {
    downloadReleaseWorkflow_btn(WorkflowID.value, item.rwid)
  } else if (key === 'delete') {
    deleteReleaseWorkflow_btn(WorkflowID.value, item.rwid, item.name)
  }
}

watch(isShowVFlowMgr, async (newVal) => {
  if (newVal) {
    await updateWorkflows()
    await updateReleaseWorkflows()
  }
})

onMounted(async () => {
  await updateWorkflows()
  await updateReleaseWorkflows()
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
      <n-grid x-gap="0" :cols="31">
        <n-grid-item :span="16">
          <n-flex vertical>
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
            <n-scrollbar style="max-height: 50vh; padding-right: 5px">
              <n-flex vertical :style="{ width: '100%' }">
                <template v-for="(item, idx) in workflows" :key="'workflow_' + idx">
                  <n-flex
                    class="flexctitem"
                    :style="{ paddingRight: '12px' }"
                    :wrap="false"
                    :size="4"
                  >
                    <n-button
                      @click="loadWorkflow_btn(item.wid)"
                      secondary
                      size="large"
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
                            <EllipsisVertical />
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
        <n-grid-item :span="14">
          <template v-if="WorkflowID">
            <n-flex vertical>
              <n-flex
                justify="space-between"
                align="center"
                :style="{ height: '100%' }"
                :wrap="false"
              >
                <n-text>共 {{ release_wfs.length }} 个记录</n-text>
                <n-button type="info" text @click="recordReleaseWF_btn">
                  <template #icon>
                    <n-icon>
                      <SaveOutline />
                    </n-icon>
                  </template>
                  记录当前版本
                </n-button>
              </n-flex>
              <n-scrollbar style="max-height: 50vh">
                <n-flex vertical :style="{ width: '100%' }">
                  <template v-for="(item, idx) in release_wfs" :key="'result_' + idx">
                    <n-flex
                      class="flexctitem"
                      :style="{ paddingRight: '12px' }"
                      :size="4"
                      :wrap="false"
                    >
                      <n-button
                        @click="loadReleaseWorkflow_btn(item.rwid, item.name)"
                        tertiary
                        :style="{
                          display: 'block',
                          justifyContent: 'flex-start',
                          height: 'auto',
                          // width: '100%',
                          flex: '1',
                          padding: '6px',
                        }"
                      >
                        <n-flex vertical :style="{ width: '100%' }">
                          <n-text style="text-align: left" type="info">{{ item.name }} </n-text>
                          <n-ellipsis style="max-width: 240px; text-align: left">
                            <n-text style="text-align: left">{{ item.description }}</n-text>
                          </n-ellipsis>
                          <n-flex justify="space-between" align="center">
                            <n-text style="text-align: left" italic depth="3">
                              {{ formatDateString(item.releaseTime) }}
                            </n-text>
                          </n-flex>
                        </n-flex>
                      </n-button>
                      <n-dropdown
                        :options="rwfOperations"
                        @select="(value) => handleSelectRWFOperator(value, item)"
                        :style="{ padding: '0px' }"
                      >
                        <n-button size="large" text>
                          <template #icon>
                            <n-icon>
                              <EllipsisVertical />
                            </n-icon>
                          </template>
                        </n-button>
                      </n-dropdown>
                    </n-flex>
                  </template>
                </n-flex>
              </n-scrollbar>
            </n-flex>
          </template>
          <template v-else>
            <n-text>选择工作流以查看版本记录</n-text>
            <n-skeleton v-if="!WorkflowID" text :repeat="5" :sharp="false" size="medium" />
          </template>
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
