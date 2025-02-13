import { ref, watch, inject, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { type EventSourceMessage } from '@microsoft/fetch-event-source'
import { useVueFlow, type FlowExportObject } from '@vue-flow/core'
import { getUuid, setValueByPath, downloadJson } from '@/utils/tools'
import { postData, getData, type RequestCallbacks } from '@/utils/requestMethod'
import { useVFlowManager } from '@/hooks/useVFlowManager'
import { useVFlowSaver } from '@/services/useVFlowSaver'
import { SubscribeSSE } from '@/utils/SSEMethod'
import { type NodeWithVFData } from '@/schemas/schemas'
import { useMessage } from 'naive-ui'
import { selectedNodeId } from '@/hooks/useVFlowAttribute'
import {
  WorkflowID,
  WorkflowName,
  AutoSaveMessage,
  Jinja2RenderNodeIDs,
  isEditorMode,
  WorkflowMode,
  WorkflowModeType,
} from '@/hooks/useVFlowAttribute'

interface SSEResponseData {
  nid: string
  oriid: string
  data: {
    type: 'overwrite' | 'append' | 'remove' | 'dontcare'
    path?: (string | number)[]
    data?: any
  }[]
}

export interface FAWorkflowInfo {
  wid: string
  name: string
  lastModified: string
}
export interface FAReleaseWorkflowInfo {
  rwid: string
  name: string
  description: string
  releaseTime: string
}

interface FAResult {
  tid: string
  status: string
  starttime: string
  endtime: string
}

interface VFlowRequestInstance {
  loadWorkflow: (wid: string | null) => Promise<void>
  loadReleaseWorkflow: (wid: string | null, rwid: string | null) => Promise<void>
  createNewWorkflow: (name: string) => Promise<void>
  uploadWorkflow: (name: string, wf_json: any) => Promise<void>
  downloadWorkflow: (wid: string) => Promise<void>
  downloadReleaseWorkflow: (wid: string, rwid: string) => Promise<void>
  renameWorkflow: (wid: string, name: string, callback: RequestCallbacks) => Promise<void>
  recordReleaseWorkflow: (name: string, description: string) => Promise<void>
  editReleaseWorkflow: (
    wid: string,
    rwid: string,
    name: string,
    description: string,
    callback?: RequestCallbacks,
  ) => Promise<void>
  getReleaseWorkflows: (wid: string) => Promise<FAReleaseWorkflowInfo[]>
  // runflow: (callback: any) => Promise<void>
  // stopflow: () => Promise<void>
  getWorkflows: () => Promise<FAWorkflowInfo[]>
  // loadResult: (tid: string) => Promise<void>
  // getResults: (tid: string) => Promise<FAResult[]>
  // clearTaskID: () => void
  // setTaskID: (tid: string) => void
  returnEditMode: (isEdit: boolean) => Promise<void>
  deleteWorkflow: (wid: string) => Promise<void>
  deleteReleaseWorkflow: (wid: string, rwid: string) => Promise<void>
  // onMountedFunc: () => void
}
let instance: VFlowRequestInstance | null = null
// let instance: any = null

export const useVFlowRequest = () => {
  if (instance) return instance

  const {
    findNode,
    getNodes,
    toObject,
    fromObject,
    removeNodes,
    nodesDraggable,
    nodesConnectable,
  } = useVueFlow()

  const { loadVflow } = useVFlowManager()
  const { autoSaveWorkflow } = useVFlowSaver()

  const message = useMessage()

  const updateNodeFromSSE = (data: SSEResponseData) => {
    const { nid, oriid, data: updatedatas } = data
    for (const udata of updatedatas) {
      const { data, path, type } = udata
      if (type === 'overwrite') {
        // 更新状态
        if (nid.includes('#') && path?.[0] === 'state' && path?.[1] === 'status') {
          const vf_node = findNode(oriid)
          if (vf_node && (vf_node as NodeWithVFData).data.isAttachedNode()) {
            vf_node.data.state.copy[nid] = { status: data }
          }
        } else {
          // 更新其他数据
          const thenode = findNode(nid)
          if (thenode && !!path) {
            setValueByPath(thenode.data, path, data)
          }
        }
      } else if (type === 'append') {
      } else if (type === 'remove') {
      }
    }
  }

  const { subscribe, unsubscribe } = SubscribeSSE(
    async (response: Response) => {
      console.log('onopen SSE', response.ok)
    },
    (event: EventSourceMessage) => {
      if (event.event === 'updatenode') {
        const data: SSEResponseData = JSON.parse(event.data)
        updateNodeFromSSE(data)
      } else if (event.event === 'batchupdatenode') {
        const datas: SSEResponseData[] = JSON.parse(event.data)
        for (const data of datas) {
          updateNodeFromSSE(data)
        }
      } else if (event.event === 'internalerror') {
        const data: string = JSON.parse(event.data)
        message.error(`内部错误: ${data}`)
      } else if (event.event === 'flowfinish') {
        unsubscribe()
        message.success('工作流运行完成')
      }
    },
    () => {
      console.log('onclose SSE')
    },
    (err: Error) => {
      console.log('onerror SSE', err)
    },
  )

  const setWfModeEdit = () => {
    nodesDraggable.value = true
    nodesConnectable.value = true
    WorkflowMode.value = WorkflowModeType.Edit
  }
  const setWfModeView = () => {
    nodesDraggable.value = false
    nodesConnectable.value = false
    WorkflowMode.value = WorkflowModeType.View
  }
  const setWfModeRun = () => {
    nodesDraggable.value = false
    nodesConnectable.value = false
    WorkflowMode.value = WorkflowModeType.View
  }

  const returnEditMode = async (isLoad: boolean = false) => {
    selectedNodeId.value = null
    setWfModeEdit()
    unsubscribe()
    if (isLoad) {
      await loadWorkflow(WorkflowID.value)
    }
  }

  const setWFIdAndName = (wid: string, name: string) => {
    WorkflowID.value = wid
    WorkflowName.value = name
    localStorage.setItem('curWorkflowID', wid)
  }
  const clearWFIdAndName = () => {
    WorkflowID.value = null
    WorkflowName.value = null
    localStorage.removeItem('curWorkflowID')
  }

  const renameWorkflow = async (wid: string, name: string, callback: RequestCallbacks) => {
    const data = {
      wid: wid,
      items: [{ location: 'wfname', data: name }],
    }
    const res = await postData('workflow/update', data, callback)
    if (res.success && WorkflowID.value === wid) {
      WorkflowName.value = name
    }
  }

  const editReleaseWorkflow = async (
    wid: string,
    rwid: string,
    name: string,
    description: string,
    callback?: RequestCallbacks,
  ) => {
    const data = {
      wid: wid,
      items: [
        { rwid, location: 'rwfname', data: name },
        { rwid, location: 'rwfdescription', data: description },
      ],
    }
    const res = await postData('workflow/update', data, callback)
  }

  const getWorkflows = async (): Promise<FAWorkflowInfo[]> => {
    const res = await getData('workflow/readall')
    if (!res.success) {
      message.error(res.message)
      return []
    }
    return res.data
  }

  const createNewWorkflow = async (name: string) => {
    removeNodes(getNodes.value)
    await nextTick()
    const res = await postData(`workflow/create`, { type: 'new', name: name })
    console.log(`create Workflow: `, res)
    if (!res.success) return

    WorkflowID.value = res.data as string
    WorkflowName.value = name
    localStorage.setItem('curWorkflowID', WorkflowID.value)
    await returnEditMode(false)
  }

  const loadWorkflow = async (wid: string | null) => {
    if (!!wid) {
      const res = await postData(`workflow/read`, { wid, locations: ['wfname', 'vflow'] })
      console.log(`read Workflow: `, res)
      if (!res.success) {
        message.error(res.message)
      } else {
        await returnEditMode(false)
        const name = res.data['wfname']
        const flow = res.data['vflow']
        loadVflow(flow)
        setWFIdAndName(wid, name)
      }
    }
  }

  const loadReleaseWorkflow = async (wid: string | null, rwid: string | null) => {
    if (!!wid && !!rwid) {
      const res = await postData(`workflow/read`, { wid, rwid, locations: ['wfname', 'release'] })
      console.log(`read Workflow: `, res)
      if (!res.success) {
        message.error(res.message)
      } else {
        await returnEditMode(false)
        const name = res.data['wfname']
        const flow = res.data['release']
        loadVflow(flow)
        setWFIdAndName(wid, name)
        autoSaveWorkflow()
      }
    }
  }

  const getReleaseWorkflows = async (wid: string): Promise<FAReleaseWorkflowInfo[]> => {
    const res = await postData(`workflow/read`, { wid, locations: ['wfname', 'allReleases'] })
    if (!res.success) {
      message.error(res.message)
      return []
    } else {
      const releases: FAReleaseWorkflowInfo[] = []
      for (const release of res.data['allReleases']) {
        releases.push({
          rwid: release['rwid'],
          name: release['name'],
          description: release['description'],
          releaseTime: release['releaseTime'],
        })
      }
      return releases
    }
  }

  const uploadWorkflow = async (name: string, wf_json: any) => {
    const vflow = wf_json.vflow
    const res = await postData(`workflow/create`, { type: 'upload', name, vflow })
    if (!res.success) {
      message.error(res.message)
      return
    } else {
      const wid = res.data
      await loadWorkflow(wid)
      message.success(`上传工作流【${name}】成功`)
    }
  }

  const recordReleaseWorkflow = async (name: string, description: string) => {
    const vflow = toObject()
    const res = await postData(`workflow/create`, {
      type: 'release',
      wid: WorkflowID.value,
      name,
      description,
      vflow,
    })
    if (!res.success) {
      message.error(res.message)
    } else {
      message.success(`记录工作流【${name}】成功`)
    }
  }

  const downloadWorkflow = async (wid: string) => {
    const res = await postData(`workflow/read`, { wid: wid, locations: ['wfname', 'vflow'] })
    console.log(`Download Workflow ${wid}: `, res)
    if (!res.success) {
      message.error(res.message)
    } else {
      const wfname = res.data['wfname']
      const flow = JSON.stringify({ version: '0.0.1', vflow: res.data['vflow'] })
      const wfname_safe = wfname.replace(/[\\/:*?"<>|]/g, '_')
      downloadJson(flow, `${wfname_safe}.json`)
    }
  }

  const downloadReleaseWorkflow = async (wid: string, rwid: string) => {
    const res = await postData(`workflow/read`, { wid, rwid, locations: ['wfname', 'release'] })
    console.log(`Download Workflow ${wid}: `, res)
    if (!res.success) {
      message.error(res.message)
    } else {
      const rwfname = res.data['wfname']
      const rvflow = JSON.stringify({ version: '0.0.1', vflow: res.data['release'] })
      const rwfname_safe = rwfname.replace(/[\\/:*?"<>|]/g, '_')
      downloadJson(rvflow, `${rwfname_safe}.json`)
    }
  }

  const runflow = async (callback: any = null) => {
    const vflow = toObject()
    return await postData(
      `api/run`,
      { wid: WorkflowID.value, vflow: vflow },
      {
        before: callback?.before,
        success: async (data: any) => {
          if (callback?.success) callback.success(data)
          if (data.success) {
            console.log('start subscribe')
            if (data.data.hasOwnProperty('tid')) {
              setTaskID()
              subscribe(`${import.meta.env.VITE_API_URL}/api/progress`, 'POST', null, {
                tid: data.data['tid'],
                node_type: 'ALL_TASK_NODE',
                selected_nids: null,
              })
            } else {
              console.log(data.data)
            }
          } else {
            message.error(data.data['validation_errors'])
          }
        },
        error: callback?.error,
      },
    )
  }

  const deleteWorkflow = async (wid: string) => {
    const res = await postData(`workflow/delete?wid=${wid}`)
    console.log(`delete Workflow ${wid}: `, res)
    if (res.success) {
      if (WorkflowID.value === wid) {
        await returnEditMode(false)
        clearWFIdAndName()
        removeNodes(getNodes.value)
      }
    }
  }
  const deleteReleaseWorkflow = async (wid: string, rwid: string) => {
    const res = await postData(`workflow/delete`, { wid, rwid })
    console.log(`delete Workflow ${wid}: `, res)
    if (res.success) {
    }
  }

  const getResults = async (): Promise<FAResult[]> => {
    if (!WorkflowID.value) return []
    const res = await getData(`workflow/readallresults?wid=${WorkflowID.value}`)
    if (!res.success) return []
    return res.data
  }

  const loadResult = async (tid: string) => {
    if (!tid) return
    const res = await postData(`workflow/loadresult?wid=${WorkflowID.value}&tid=${tid}`)
    console.log(`load Result ${tid}: `, res)
    if (res.success) {
      loadVflow(res.data)
      // TaskID.value = tid
      nodesDraggable.value = false
      nodesConnectable.value = false
      console.log('loadResult Done.')
      subscribe(`${import.meta.env.VITE_API_URL}/api/progress`, 'POST', null, {
        tid: tid,
        node_type: 'ALL_TASK_NODE',
        selected_nids: null,
      })
    }
  }

  const onMountedFunc = async () => {
    const ls_wid = localStorage.getItem('curWorkflowID') || null
    if (ls_wid) {
      Jinja2RenderNodeIDs.value =
        JSON.parse(localStorage.getItem(`${ls_wid}:Jinja2RenderNodeIDs`) || '[]') ?? []
    }
    await loadWorkflow(ls_wid)
    console.log('loadWorkflow Done.')
  }

  onUnmounted(() => {
    unsubscribe()
  })

  instance = {
    // runflow,
    createNewWorkflow,
    uploadWorkflow,
    renameWorkflow,
    getWorkflows,
    loadWorkflow,
    loadReleaseWorkflow,
    recordReleaseWorkflow,
    getReleaseWorkflows,
    editReleaseWorkflow,
    // getResults,
    // loadResult,
    returnEditMode,
    deleteWorkflow,
    deleteReleaseWorkflow,
    downloadWorkflow,
    downloadReleaseWorkflow,
    // onMountedFunc,
  }
  return instance
}
