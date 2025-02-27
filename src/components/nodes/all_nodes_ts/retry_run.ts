import { ref } from 'vue'
import {
  VFNodeConnectionDataType,
  VFNodeConnectionDataAttachedType,
  VFNodeConnectionType,
  VFNodeFlag,
  VFNodeAttachingPos,
  VFNodeAttachingType,
} from '@/components/nodes/VFNodeInterface'
import { VFNode } from '@/components/nodes/VFNodeClass'
import NodeVue from '@/components/nodes/all_nodes_vue/basenode.vue'
export { NodeVue }
export function createNode(): VFNode {
  const node = new VFNode('retry_run', 'basenode', '多次重试').initAsNestedNode('RETRY')
  node.setNodeFlag(VFNodeFlag.isTask | VFNodeFlag.isNested).setSize(200, 200)

  node.addAttachedNode(VFNodeConnectionDataAttachedType.attached_node_input)
  node.addAttachedNode(VFNodeConnectionDataAttachedType.attached_node_output)

  node.addHandle(VFNodeConnectionType.inputs, 'input')
  node.addHandle(VFNodeConnectionType.outputs, 'output')
  node.addHandle(VFNodeConnectionType.self, 'attach_output')
  node.addHandleData(VFNodeConnectionType.self, 'self', {
    type: VFNodeConnectionDataType.FromOuter,
    inputKey: 'input',
  })
  node.addHandleData(VFNodeConnectionType.self, 'attach_output', {
    type: VFNodeConnectionDataType.FromAttached,
    atype: VFNodeConnectionDataAttachedType.attached_node_output,
  })

  node.addPayload(
    { label: '重试次数', type: 'Integer', key: 'retry_num', data: 5, uitype: '' },
    'D_RETRY_NUM',
  )
  node.addPayload(
    {
      label: '重试机制',
      type: 'Dict',
      key: 'retry_type',
      data: {
        type: 'fixed', // fixed|exponential
        fixed_interval: 1000,
        exponential_base: 2,
        exponential_growth: 1.5,
      },
      uitype: '',
    },
    'D_RETRY_TYPE',
  )

  node.setOutputsUIType('packoutputs')
  return node
}
