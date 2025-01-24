// hooks/useContextMenu.ts
import { ref, reactive, type Ref } from 'vue'
import { useVueFlow, type GraphNode, type GraphEdge } from '@vue-flow/core'
import { useVFlowManager } from './useVFlowManager'
import { useVFlowInitial } from './useVFlowInitial'
import { VFNodeFlag } from '@/components/nodes/VFNodeInterface'
import VFNode from '@/components/nodes/VFNodeClass'
// 定义菜单项类型
interface MenuItem {
  label: string
  onClick?: () => void
  children?: MenuItem[]
}

// 定义菜单选项类型
interface MenuOptions {
  theme: string
  zIndex: number
  minWidth: number
  x: number
  y: number
  items: MenuItem[]
}

interface ContextMenuEvent {
  type: 'node' | 'edge' | 'pane'
  event: MouseEvent
  node?: GraphNode
  edge?: GraphEdge
}
// 定义上下文菜单实例类型
interface ContextMenuInstance {
  showMenu: Ref<boolean>
  menuOptions: MenuOptions
  showContextMenu: (event_cm: ContextMenuEvent) => void
}

// 单例模式
let instance: ContextMenuInstance | null = null

export const useContextMenu = (): ContextMenuInstance => {
  if (instance) return instance
  const { screenToFlowCoordinate, removeEdges } = useVueFlow()
  const { AllTestNodes } = useVFlowInitial()
  const {} = useVFlowManager()

  const AddNodesInPane = ref<VFNode[]>([])
  const AddNodesInNest = ref<VFNode[]>([])
  const showMenu = ref(false)
  const menuOptions = reactive<MenuOptions>({
    theme: 'mac dark',
    zIndex: 3,
    minWidth: 50,
    x: 0,
    y: 0,
    items: [],
  })

  const initContextMenu = () => {
    AddNodesInPane.value = Object.entries(AllTestNodes.value)
      .sort((a, b) => a[0].localeCompare(b[0])) // 按key排序
      .map(([key, item]) => item)
      .filter((item) => !(VFNodeFlag.isAttached & item.flag))
    AddNodesInNest.value = Object.entries(AllTestNodes.value)
      .sort((a, b) => a[0].localeCompare(b[0])) // 按key排序
      .map(([key, item]) => item)
      .filter((item) => !(VFNodeFlag.isAttached & item.flag) && !(VFNodeFlag.isPassive & item.flag))
    console.debug('AddNodesInPane', AddNodesInPane.value)
    console.debug('AddNodesInNest', AddNodesInNest.value)
  }

  const onClickContextMenuRmNode = (event_cm: ContextMenuEvent) => {
    console.debug('删除节点')
  }

  const AddNodeList = (event_cm: ContextMenuEvent) => {}

  const onClickContextMenuRmEdge = (event_cm: ContextMenuEvent) => {
    console.debug('删除边')
  }

  const showContextMenu = (event_cm: ContextMenuEvent) => {}

  instance = {
    showMenu,
    menuOptions,
    showContextMenu,
  }

  return instance
}
