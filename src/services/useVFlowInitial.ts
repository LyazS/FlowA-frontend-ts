import { ref, reactive, markRaw, onBeforeMount, type Ref, type Component } from "vue";
import { cloneDeep } from "lodash";
import { useVueFlow, type Node } from "@vue-flow/core";
import { getUuid } from "@/utils/tools";
import { type VFNodeData, VFNodeFlag, VFNodeAttachingPos, VFNodeAttachingType } from "@/components/nodes/VFNodeInterface";

// 定义类型
interface InitInfo {
  data: VFNodeData;
  position: { x: number; y: number };
  [key: string]: any;
}

interface NodeModule {
  initInfo: InitInfo;
  NodeVue: Component;
}

interface VFlowInstance {
  AllVFNodeTypes: Record<string, Component>;
  initAllNodeInfos: () => Promise<void>;
  getAddNodeList: () => InitInfo[];
  cloneVFNodeInitInfo: (ntype: string) => InitInfo;
  getVFNodeCount: (ntype: string) => number;
  increaseVFNodeCount: (ntype: string, value: number) => void;
  reBuildCounter: () => void;
}

// 单例模式
let instance: VFlowInstance | null = null;

export const useVFlowInitial = (): VFlowInstance => {
  if (instance) return instance;

  const { getNodes, addNodes, findNode, removeNodes, addEdges } = useVueFlow();

  const AllNodeInitInfos: Ref<Record<string, InitInfo>> = ref({});
  const AllNodeCounters: Ref<Record<string, number>> = ref({});
  const AllVFNodeTypes = reactive<Record<string, Component>>({});
  const AddNodeListFromInitInfos: Ref<InitInfo[]> = ref([]);

  const initAllNodeInfos = async () => {
    const modules: Record<string, () => Promise<NodeModule>> = import.meta.glob(
      "../components/nodes/all_node_js/**.js"
    );

    const promises = Object.keys(modules).map(async (key) => {
      const module = await modules[key]();
      const initInfo = module.initInfo;
      AllNodeInitInfos.value[initInfo.data.ntype] = initInfo;
      AllNodeCounters.value[initInfo.data.ntype] = 0;
      if (!AllVFNodeTypes.hasOwnProperty(initInfo.data.vtype)) {
        AllVFNodeTypes[initInfo.data.vtype] = markRaw(module.NodeVue);
      }
    });

    await Promise.all(promises);

    // 排序节点列表
    AddNodeListFromInitInfos.value = Object.values(AllNodeInitInfos.value)
      .sort((a, b) => a.data.ntype.localeCompare(b.data.ntype))
      .filter((item) => !(VFNodeFlag.isAttached & item.data.flag));
  };

  const getAddNodeList = () => {
    return AddNodeListFromInitInfos.value;
  };

  const cloneVFNodeInitInfo = (ntype: string): InitInfo => {
    return cloneDeep(AllNodeInitInfos.value[ntype]);
  };

  const getVFNodeCount = (ntype: string): number => {
    return AllNodeCounters.value[ntype] || 0;
  };

  const increaseVFNodeCount = (ntype: string, value: number) => {
    AllNodeCounters.value[ntype] = (AllNodeCounters.value[ntype] || 0) + value;
  };

  const reBuildCounter = () => {
    Object.keys(AllNodeCounters.value).forEach((key) => {
      AllNodeCounters.value[key] = 0;
    });
    getNodes.value.forEach((node: Node<VFNodeData>) => {
      const ntype = node.data.ntype;
      AllNodeCounters.value[ntype] = (AllNodeCounters.value[ntype] || 0) + 1;
    });
  };

  instance = {
    AllVFNodeTypes,
    initAllNodeInfos,
    getAddNodeList,
    cloneVFNodeInitInfo,
    getVFNodeCount,
    increaseVFNodeCount,
    reBuildCounter,
  };

  return instance;
};