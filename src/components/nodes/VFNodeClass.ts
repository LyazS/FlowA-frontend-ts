import type {
  VFNodeContentData,
  VFNodeContents,
  VFNodeHandleData,
  VFNodeHandle,
  VFNodeConnections,
  VFNodeAttaching,
  VFNodeAttachedNode,
  VFNodePadding,
  VFNodeSize,
  VFNodeNesting,
  VFNodeState,
  VFNodeConfig,
  VFNodeData,
} from '@/components/nodes/VFNodeInterface'

import {
  VFNodeConnectionDataType,
  VFNodeConnectionDataAttachedType,
  VFNodeConnectionType,
  VFNodeFlag,
  VFNodeAttachingPos,
  VFNodeAttachingType,
} from '@/components/nodes/VFNodeInterface'

import { cloneDeep } from 'lodash'
import { getUuid } from '@/utils/tools'

class VFNode implements VFNodeData {
  ntype: string
  vtype: string
  flag: number
  label: string
  placeholderlabel: string
  size: VFNodeSize
  min_size?: VFNodeSize | undefined
  attaching?: VFNodeAttaching | undefined
  nesting?: VFNodeNesting | undefined
  connections?: VFNodeConnections | undefined
  payloads?: VFNodeContents | undefined
  results?: VFNodeContents | undefined
  state?: VFNodeState | undefined
  config?: VFNodeConfig | undefined
  constructor(ntype: string, vtype: string, label: string) {
    this.ntype = ntype
    this.vtype = vtype
    this.size = {
      width: -1,
      height: -1,
    }
    this.flag = 0
    this.label = label
    this.placeholderlabel = label
  }

  initNestedAttribute(): void {
    this.min_size = {
      width: 200,
      height: 200,
    }
    this.nesting = {
      pad: {
        top: 60,
        bottom: 40,
        left: 60,
        right: 60,
      },
      attached_pad: {
        top: 30,
        bottom: 25,
        left: 17,
        right: 17,
        gap: 20,
      },
      attached_nodes: {},
    }
  }

  initConnectionsAttribute(): void {
    this.connections = {
      // 自身可用变量，默认存在
      self: {
        self: { label: 'self', data: {} },
      },
      // 附属节点可用变量，默认存在
      attach: {
        attach: { label: 'attach', data: {} },
      },
      // 用于嵌套节点的下一次迭代的连接
      next: {
        next: { label: 'next', data: {} },
      },
      inputs: {},
      callbackUsers: {},
      callbackFuncs: {},
      outputs: {},
    }
  }
  initPayloads(): void {
    this.payloads = { byId: {}, order: [] }
  }
  initResults(): void {
    this.results = { byId: {}, order: [] }
  }
  initState(): void {
    this.state = {
      status: 'Default',
      copy: {},
      copyCount: {
        Running: 0,
        Success: 0,
        Error: 0,
      },
    }
  }
  initConfig(): void {
    this.config = {
      outputsUIType: '',
    }
  }
  // =========================================================
  setLabel(label: string): void {
    this.label = label
  }

  setMinSize(width: number, height: number): void {
    this.min_size = { width, height }
  }

  setSize(width: number, height: number): void {
    this.size = { width, height }
  }

  setNodeFlag(flag: number): void {
    this.flag = flag
  }

  setAttachedAttribute(attribute: VFNodeAttaching): void {
    this.attaching = attribute
  }
  addAttachedNode(ntype: VFNodeConnectionDataAttachedType): void {
    if (!this.nesting) {
      console.error('Node is not a nested node')
      return
    }
    this.nesting.attached_nodes[ntype] = { nid: null }
  }

  setAttaching(
    type: VFNodeAttachingType,
    pos: [VFNodeAttachingPos, VFNodeAttachingPos],
    label: string,
  ): void {
    if (!this.attaching) {
      console.error('Node is not a attaching node')
      return
    }
    this.attaching.type = type
    this.attaching.pos = pos
    this.attaching.label = label
  }

  // Node data operations =======================================
  setOutputsUIType(uitype: string): void {
    if (!this.config) {
      console.error('Node has no config attribute')
      return
    }
    this.config.outputsUIType = uitype
  }

  addHandle(
    connecttype: VFNodeConnectionType,
    handleId: string,
    label: string | null = null,
  ): void {
    if (!this.connections) {
      console.error('Node has no connections attribute')
      return
    }
    this.connections[connecttype][handleId] = { label: label || handleId, data: {} }
  }

  rmHandle(connecttype: VFNodeConnectionType, handleId: string): void {
    if (this.connections && this.connections[connecttype].hasOwnProperty(handleId)) {
      delete this.connections[connecttype][handleId]
    }
  }

  addHandleData(
    connecttype: VFNodeConnectionType,
    handleId: string,
    handleData: VFNodeHandleData,
    did: string | null = null,
  ): string {
    const _did = did || getUuid()
    if (!this.connections || !this.connections[connecttype].hasOwnProperty(handleId)) {
      this.addHandle(connecttype, handleId)
    }
    this.connections![connecttype][handleId].data[_did] = handleData
    return _did
  }

  rmHandleData(connecttype: VFNodeConnectionType, handleId: string, did: string): void {
    if (
      this.connections &&
      this.connections[connecttype].hasOwnProperty(handleId) &&
      this.connections[connecttype][handleId].data.hasOwnProperty(did)
    ) {
      delete this.connections![connecttype][handleId]!.data[did]
    }
  }

  addPayload(payload: VFNodeContentData, pid: string | null = null): string {
    const _pid = pid || getUuid()
    if (!this.payloads) {
      console.error('Node has no payloads attribute')
      return ''
    }
    this.payloads.byId[_pid] = payload
    this.payloads.order.push(_pid)
    return _pid
  }

  rmPayload(pid: string): void {
    if (this.payloads && this.payloads.byId.hasOwnProperty(pid)) {
      delete this.payloads.byId[pid]
      this.payloads.order.splice(this.payloads.order.indexOf(pid), 1)
    }
  }

  addResult(result: VFNodeContentData, rid: string | null = null): string {
    const _rid = rid || getUuid()
    if (!this.results) {
      console.error('Node has no results attribute')
      return ''
    }
    this.results.byId[_rid] = result
    this.results.order.push(_rid)
    return _rid
  }

  rmResult(rid: string): void {
    if (this.results && this.results.byId.hasOwnProperty(rid)) {
      delete this.results.byId[rid]
      this.results.order.splice(this.results.order.indexOf(rid), 1)
    }
  }

  addResultWConnect(
    result: VFNodeContentData,
    hid: string,
    rid: string | null = null,
    did: string | null = null,
  ): string {
    const _rid = rid || getUuid()
    const _did = this.addHandleData(
      VFNodeConnectionType.outputs,
      hid,
      { type: VFNodeConnectionDataType.FromInner, path: ['results', _rid], useid: [] },
      did,
    )
    this.addResult({ ...result, hid, did: _did }, _rid)
    return _rid
  }

  rmResultWConnect(rid: string): void {
    if (this.results && this.results.byId.hasOwnProperty(rid)) {
      const hid = this.results.byId[rid].hid
      const did = this.results.byId[rid].did
      if (!hid || !did) {
        console.error('Result has no hid or did')
        return
      }
      this.rmHandleData(VFNodeConnectionType.outputs, hid, did)
      delete this.results.byId[rid]
      this.results.order.splice(this.results.order.indexOf(rid), 1)
    }
  }

  resetState(): void {
    this.state = {
      status: 'Default',
      copy: {},
      copyCount: {
        Running: 0,
        Success: 0,
        Error: 0,
      },
    }
  }
}

export default VFNode
