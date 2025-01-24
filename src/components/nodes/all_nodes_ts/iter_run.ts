import { ref } from 'vue'
import {
  VFNodeConnectionDataType,
  VFNodeConnectionDataAttachedType,
  VFNodeConnectionType,
  VFNodeFlag,
  VFNodeAttachingPos,
  VFNodeAttachingType,
} from '@/components/nodes/VFNodeInterface'
import VFNode from '@/components/nodes/VFNodeClass'
import NodeVue from '@/components/nodes/all_nodes_vue/basenode.vue'
export { NodeVue }
export function createNode(): VFNode {
  const node = new VFNode('iter_run', 'basenode', '迭代运行')
  node.setNodeFlag(VFNodeFlag.isPassive)
  node.setSize(200, 200)

  node.initNestedAttribute("ITER")
  node.addAttachedNode(VFNodeConnectionDataAttachedType.attached_node_input)
  node.addAttachedNode(VFNodeConnectionDataAttachedType.attached_node_callbackUser)
  node.addAttachedNode(VFNodeConnectionDataAttachedType.attached_node_output)
  node.addAttachedNode(VFNodeConnectionDataAttachedType.attached_node_next)
  node.addAttachedNode(VFNodeConnectionDataAttachedType.attached_node_callbackFunc)

  node.initConnectionsAttribute()
  node.addHandle(VFNodeConnectionType.inputs, 'input')
  node.addHandle(VFNodeConnectionType.outputs, 'output')
  node.addHandle(VFNodeConnectionType.callbackUsers, 'callbackUser')
  node.addHandle(VFNodeConnectionType.callbackFuncs, 'callbackFunc')
  node.addHandleData(VFNodeConnectionType.self, 'self', {
    type: VFNodeConnectionDataType.FromOuter,
    inputKey: 'input',
  })
  node.addHandleData(VFNodeConnectionType.self, 'attach_output', {
    type: VFNodeConnectionDataType.FromAttached,
    atype: VFNodeConnectionDataAttachedType.attached_node_output,
  })
  node.addHandleData(VFNodeConnectionType.next, 'next', {
    type: VFNodeConnectionDataType.FromAttached,
    atype: VFNodeConnectionDataAttachedType.attached_node_next,
  })

  node.initPayloads()
  node.addPayload(
    { label: '迭代数组', type: 'List', key: 'iter_list', data: '', uitype: 'iter_input' },
    'D_ITERLIST',
  )
  const pid1 = node.addPayload({
    label: '迭代索引',
    type: 'IterIndex',
    key: 'iter_index',
    data: null,
    uitype: 'texttag',
  })
  node.addHandleData(VFNodeConnectionType.attach, 'attach', {
    type: VFNodeConnectionDataType.FromInner,
    path: ['payloads', pid1],
  })

  const pid2 = node.addPayload({
    label: '迭代项目',
    type: 'IterItem',
    key: 'iter_item',
    data: null,
    uitype: 'texttag',
  })
  node.addHandleData(VFNodeConnectionType.attach, 'attach', {
    type: VFNodeConnectionDataType.FromInner,
    path: ['payloads', pid2],
  })
  node.addHandleData(VFNodeConnectionType.attach, 'attach', {
    type: VFNodeConnectionDataType.FromOuter,
    inputKey: 'input',
  })
  node.initResults()
  node.initState()
  node.initConfig()
  node.setOutputsUIType('packoutputs')
  return node
}
