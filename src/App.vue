<script setup lang="ts">
import { ref } from 'vue'
import {
  VFNodeConnectionDataType,
  VFNodeConnectionDataAttachedType,
  VFNodeConnectionType,
  VFNodeAttachingType,
} from '@/components/nodes/VFNodeInterface'

import VFNode from '@/components/nodes/VFNodeClass'
import { createNode as createNode_code_interpreter } from '@/components/nodes/all_nodes_ts/code_interpreter'
import { createNode as createNode_jinja2_template } from '@/components/nodes/all_nodes_ts/jinja2_template'
const node1 = createNode_code_interpreter()
const node2 = createNode_jinja2_template()
const nodes = ref([node1, node2])
node1.payloads!.byId['D_CODE'].data = 2
</script>

<template>
  <pre>
    {{ nodes }}
  </pre>
</template>

<style scoped></style>
