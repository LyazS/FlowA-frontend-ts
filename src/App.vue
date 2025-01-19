<script setup lang="ts">
import { ref } from 'vue'
import {
  VFNodeConnectionDataType,
  VFNodeConnectionDataAttachedType,
  VFNodeConnectionType,
  VFNodeAttachingType,
} from '@/components/nodes/VFNodeInterface'

import VFNode from '@/components/nodes/VFNodeClass'
const node = ref(new VFNode("asd", "qwe", "zxc"))
node.value.setNodeFlag(0x01)
node.value.setMinSize(100, 100)
node.value.label = "New Label"
node.value.initConnectionsAttribute()
node.value.addHandle(VFNodeConnectionType.inputs, "input")
node.value.addHandle(VFNodeConnectionType.outputs, "output")
node.value.addHandle(VFNodeConnectionType.callbackUsers, "callbackUser")
node.value.addHandle(VFNodeConnectionType.callbackFuncs, "callbackFunc")
node.value.initNestedAttribute()
node.value.addAttachedNode(VFNodeConnectionDataAttachedType.attached_node_input)
node.value.addAttachedNode(VFNodeConnectionDataAttachedType.attached_node_output)
node.value.addAttachedNode(VFNodeConnectionDataAttachedType.attached_node_next)
node.value.addAttachedNode(VFNodeConnectionDataAttachedType.attached_node_callbackUser)
node.value.addAttachedNode(VFNodeConnectionDataAttachedType.attached_node_callbackFunc)
node.value.initPayloads()
node.value.initResults()
node.value.addHandleData(VFNodeConnectionType.self, "self", { type: VFNodeConnectionDataType.FromOuter, inputKey: "input" })
let pid = node.value.addPayload({ label: "迭代1", type: "List", key: "iter_list", data: "", hid: "", oid: "", config: {}, uitype: "iter_input" }, 'D_ITERLIST');
node.value.addHandleData(VFNodeConnectionType.attach, "attach", { type: VFNodeConnectionDataType.FromInner, path: ["payloads", pid] })
pid = node.value.addPayload({ label: "迭代2", type: "List", key: "iter_list", data: "", hid: "", oid: "", config: {}, uitype: "iter_input" }, 'D_ITERLIST2');
node.value.addHandleData(VFNodeConnectionType.attach, "attach", { type: VFNodeConnectionDataType.FromInner, path: ["payloads", pid] })
node.value.addResultWConnect({ label: "迭代1", type: "List", key: "iter_list", data: "", hid: "", oid: "", config: {}, uitype: "iter_input" }, "output", 'D_ITERLIST123')
node.value.initState()
node.value.initConfig()
node.value.setOutputsUIType("iter_output")
</script>

<template>
  <pre>
    {{ node }}
  </pre>
</template>

<style scoped></style>
