import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useVueFlow, type XYPosition } from '@vue-flow/core'
import { useVFlowInitial } from '@/hooks/useVFlowInitial'
import { getUuid, setValueByPath } from '@/utils/tools.js'
import { useMessage } from 'naive-ui'
import {
  VFNodeFlag,
  VFNodeAttachingPos,
  VFNodeConnectionDataAttachedType,
} from '@/components/nodes/VFNodeInterface'
import type VFNode from '@/components/nodes/VFNodeClass'

interface NodeManagementInstance {}
interface NestedNodeType {
  parentNode: string | null
  children: string[]
}
interface NodeAddInfo {
  type: 'client' | 'attached'
  ntype: string
  nid: string | null
  parentNodeId: string | null
  pos: XYPosition
}

let instance: NodeManagementInstance | null = null

export const useVFlowManager = (): NodeManagementInstance => {
  if (instance) return instance
  const { getNodes, findNode, addNodes } = useVueFlow()
  const { AllTestNodes, createVFNode } = useVFlowInitial()

  const AllNodeCounters = ref<Record<string, number>>({})
  const NestedNodeGraph = ref<Record<string, NestedNodeType>>({})

  const initNodeManagement = () => {
    for (const ntype in AllTestNodes.value) {
      AllNodeCounters.value[ntype] = 0
    }
  }

  const getNestedNodeById = (nid: string): NestedNodeType => {
    return NestedNodeGraph.value[nid]
  }
  const buildNestedNodeGraph = (): void => {
    NestedNodeGraph.value = {}
    for (const node of getNodes.value) {
      NestedNodeGraph.value[node.id] = { parentNode: node.parentNode || null, children: [] }
    }
    for (const [nid, node] of Object.entries(NestedNodeGraph.value)) {
      if (node.parentNode) {
        NestedNodeGraph.value[node.parentNode].children.push(nid)
      }
    }
    console.debug('getNodes', getNodes.value)
    console.debug('buildNestedNodeGraph', NestedNodeGraph.value)
  }

  const recursiveUpdateNodeSize = (nodeId: string | null) => {
    if (!nodeId) return
    let vf_node = findNode(nodeId)
    let nested_node = getNestedNodeById(nodeId)
    if (!vf_node || !nested_node) return
    const nested_node_childs = nested_node.children.reduce((acc, childId) => {
      let vf_node_child = findNode(childId)
      // 子节点不计算
      if (!(VFNodeFlag.isAttached & vf_node_child!.data.flag)) acc += 1
      return acc
    }, 0)
    if (nested_node_childs <= 0) return

    let vf_node_pos = vf_node.position
    const vf_node_data = vf_node.data as VFNode
    // 遍历子节点，计算最小包围盒
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity
    nested_node.children.forEach((childId) => {
      let vf_node_child = findNode(childId)
      // 固定位置的子节点不计算
      const cdata = vf_node_child!.data as VFNode
      if (VFNodeFlag.isAttached & cdata.flag) return
      minX = Math.min(minX, vf_node_child!.position.x + vf_node_pos.x)
      minY = Math.min(minY, vf_node_child!.position.y + vf_node_pos.y)
      maxX = Math.max(
        maxX,
        vf_node_child!.position.x + vf_node_pos.x + vf_node_child!.data.size.width,
      )
      maxY = Math.max(
        maxY,
        vf_node_child!.position.y + vf_node_pos.y + vf_node_child!.data.size.height,
      )
    })

    // 按照最小尺寸更新父节点尺寸
    let vf_node_tgt_wd =
      maxX - minX + vf_node_data.nesting!.pad.left + vf_node_data.nesting!.pad.right
    let vf_node_tgt_ht =
      maxY - minY + vf_node_data.nesting!.pad.top + vf_node_data.nesting!.pad.bottom
    vf_node_data.size.width = Math.max(vf_node_tgt_wd, vf_node_data.min_size!.width)
    vf_node_data.size.height = Math.max(vf_node_tgt_ht, vf_node_data.min_size!.height)
    vf_node.width = `${vf_node_data.size.width}px`
    vf_node.height = `${vf_node_data.size.height}px`

    // 更新子节点位置
    nested_node.children.forEach((childId) => {
      let vf_node_child = findNode(childId)
      const cdata = vf_node_child!.data as VFNode
      // 固定位置的子节点
      if (VFNodeFlag.isAttached & cdata.flag) {
        const [yPart, yPos, xPart, xPos] = cdata.attaching!.pos
        if (yPart == VFNodeAttachingPos.bottom) {
          const yOffset = yPos * vf_node_data.nesting!.attached_pad.gap!
          vf_node_child!.position.y =
            vf_node_data.size.height - vf_node_data.nesting!.attached_pad.bottom - yOffset
        } else if (yPart == VFNodeAttachingPos.center) {
          vf_node_child!.position.y =
            vf_node_data.size.height / 2 - vf_node_data.nesting!.attached_pad.bottom
        }
        if (xPart == VFNodeAttachingPos.right) {
          vf_node_child!.position.x =
            vf_node_data.size.width - vf_node_data.nesting!.attached_pad.right
        } else if (xPart == VFNodeAttachingPos.center) {
          vf_node_child!.position.x =
            vf_node_data.size.width / 2 - vf_node_data.nesting!.attached_pad.right
        }
        if (yPart != VFNodeAttachingPos.top)
          vf_node_child!.position.y -= vf_node_child!.data.size.height / 2
        if (xPart != VFNodeAttachingPos.left)
          vf_node_child!.position.x -= vf_node_child!.data.size.width / 2
      } else {
        vf_node_child!.position.x += vf_node_pos.x - (minX - vf_node_data.nesting!.pad.left)
        vf_node_child!.position.y += vf_node_pos.y - (minY - vf_node_data.nesting!.pad.top)
      }
    })

    // 更新父节点位置
    vf_node.position = {
      x: minX - vf_node_data.nesting!.pad.left,
      y: minY - vf_node_data.nesting!.pad.top,
    }

    // 递归更新父节点大小
    recursiveUpdateNodeSize(nested_node.parentNode)
  }

  const recursiveAddNodeToVFlow = (nodeinfo: NodeAddInfo) => {
    console.debug(' nodeinfo:', nodeinfo)
    const nodetype = nodeinfo.ntype
    const parentNode = findNode(nodeinfo.parentNodeId)

    const initnode = createVFNode(nodetype)
    const offset_size = {
      width: initnode.size.width + 8,
      height: initnode.size.height + 8,
    }
    let new_node_id = nodeinfo.nid || getUuid()
    if (nodeinfo.type === 'client' && parentNode) {
      const nest_regex = /#(\w+)/g
      const pid_matches = parentNode.id.match(nest_regex) || []
      console.debug('pid_matches', pid_matches)
      if (VFNodeFlag.isNested & (parentNode.data as VFNode).flag) {
        new_node_id += pid_matches.join('') + `#${(parentNode.data as VFNode).nesting!.tag}`
      }
    }
    const new_node = {
      id: new_node_id,
      type: initnode.vtype,
      data: initnode,
      style: {
        width: `${offset_size.width}px`,
        height: `${offset_size.height}px`,
      },
      draggable: true,
      selectable: true,
      parentNode: undefined as string | undefined,
      position: { x: 0, y: 0 },
    }
    new_node.data.size.width = offset_size.width
    new_node.data.size.height = offset_size.height
    const nodecount = AllNodeCounters.value[nodetype]
    const new_node_label = nodecount > 0 ? `${initnode.label}${nodecount}` : initnode.label
    AllNodeCounters.value[nodetype] += 1
    new_node.data.placeholderlabel = new_node_label
    new_node.data.label = new_node_label

    // 设置全局position
    let new_node_position = { x: 0, y: 0 }
    if (nodeinfo.type === 'attached' && !!parentNode) {
      const [yPart, yPos, xPart, xPos] = initnode.attaching!.pos
      if (yPart == VFNodeAttachingPos.top) {
        const yOffset = yPos * parentNode.data.nesting.attached_pad.gap
        new_node_position.y =
          parentNode.position.y + parentNode.data.nesting.attached_pad.top + yOffset
      } else if (yPart == VFNodeAttachingPos.bottom) {
        const yOffset = yPos * parentNode.data.nesting.attached_pad.gap
        new_node_position.y =
          parentNode.position.y +
          parentNode.data.size.height -
          parentNode.data.nesting.attached_pad.bottom -
          yOffset
      } else if (yPart == VFNodeAttachingPos.center) {
        new_node_position.y =
          parentNode.position.y +
          parentNode.data.size.height / 2 -
          parentNode.data.nesting.attached_pad.bottom
      }
      if (xPart == VFNodeAttachingPos.left) {
        new_node_position.x = parentNode.position.x + parentNode.data.nesting.attached_pad.left
      } else if (xPart == VFNodeAttachingPos.right) {
        new_node_position.x =
          parentNode.position.x +
          parentNode.data.size.width -
          parentNode.data.nesting.attached_pad.right
      } else if (xPart == VFNodeAttachingPos.center) {
        new_node_position.x =
          parentNode.position.x +
          parentNode.data.size.width / 2 -
          parentNode.data.nesting.attached_pad.right
      }

      new_node.draggable = false
      new_node.selectable = false
      new_node_position.x -= offset_size.width / 2
      new_node_position.y -= offset_size.height / 2
      console.debug('add attached node in', new_node.data.attaching!.pos)
    } else if (nodeinfo.type === 'client') {
      new_node_position = { x: nodeinfo.pos.x, y: nodeinfo.pos.y }
    }
    // 递归设置局部position
    if (nodeinfo.parentNodeId) {
      new_node.parentNode = nodeinfo.parentNodeId
      let curparentnode: string | null = nodeinfo.parentNodeId
      while (curparentnode) {
        if (curparentnode) {
          new_node_position.x -= findNode(curparentnode)!.position.x
          new_node_position.y -= findNode(curparentnode)!.position.y
        }
        curparentnode = getNestedNodeById(curparentnode)?.parentNode
      }
    }

    new_node.position = new_node_position

    addNodes(new_node)
    if (new_node.data.nesting?.attached_nodes) {
      console.log(
        `add ${Object.keys(new_node.data.nesting.attached_nodes).length} fixed nested nodes`,
      )
      for (const antype of Object.keys(new_node.data.nesting.attached_nodes)) {
        const anid = getUuid()
        recursiveAddNodeToVFlow({
          ntype: antype,
          nid: anid,
          type: 'attached',
          parentNodeId: new_node.id,
          pos: { x: 0, y: 0 },
        })
        new_node.data.nesting!.attached_nodes[antype as VFNodeConnectionDataAttachedType]!.nid =
          anid
      }
    }
  }

  instance = {}
  return instance
}
