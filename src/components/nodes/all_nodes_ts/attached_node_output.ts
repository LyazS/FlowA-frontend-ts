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
import NodeVue from '@/components/nodes/all_nodes_vue/attached_node.vue'
export { NodeVue }
export function createNode(): VFNode {
  const node = new VFNode('attached_node_output', 'attached_node', '附属节点').initAsAttachedNode(
    VFNodeAttachingType.output,
    [VFNodeAttachingPos.bottom, 0, VFNodeAttachingPos.right, 0],
    'OUTPUT',
  )
  node.setNodeFlag(VFNodeFlag.isAttached).setSize(20, 6)
  node.addHandle(VFNodeConnectionType.inputs, 'input')
  node.addHandleData(VFNodeConnectionType.self, 'self', {
    type: VFNodeConnectionDataType.FromOuter,
    inputKey: 'input',
  })
  return node
}
