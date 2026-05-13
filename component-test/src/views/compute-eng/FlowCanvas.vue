<template>
  <div class="flow-canvas-wrapper" @drop="handleDrop" @dragover.prevent>
    <div class="toolbar-panel">
      <button class="btn btn-primary" @click="handleSave">保存</button>
      <button class="btn btn-danger" @click="handleClear">清空</button>
    </div>

    <div ref="containerRef" class="logic-flow-container"></div>
    <TeleportContainer :flow-id="flowId" />
  </div>
</template>

<script setup lang="ts">
import LogicFlow from "@logicflow/core";
import "@logicflow/core/dist/index.css";
import { nextTick, onMounted, onUnmounted, ref } from "vue";
import { register, getTeleport } from "@logicflow/vue-node-registry";
import FlowNode from "./nodes/FlowNode.vue";
import FlowNodeModel from "./nodes/FlowNodeModel";
import TaskNode from "./nodes/TaskNode.vue";
import TaskNodeModel from "./nodes/TaskNodeModel";
import { allNodeTypes, NODE_TYPE } from "./menus";

const emit = defineEmits<{
  (e: "node-select", node: any): void;
  (e: "blank-click"): void;
  (e: "node-delete", nodeId: string): void;
  (e: "lf-inited"): void;
  (e: "save-request", data: any): void;
}>();

const TeleportContainer = getTeleport();

let lf: LogicFlow | null = null;
let resizeObserver: ResizeObserver | null = null;
const containerRef = ref<HTMLElement>();
const flowId = ref("");

const resizeEditor = () => {
  lf?.resize();
};

const getGraphData = () => lf?.getGraphData();

const updateNodeProperties = (nodeId: string, properties: Record<string, any>) => {
  if (!lf) return;
  lf.setProperties(nodeId, properties);
};

const renderGraph = async (data: any) => {
  await nextTick();
  if (!lf) return;
  lf.render(data);
  await nextTick();
  resizeEditor();
};

onMounted(() => {
  if (!containerRef.value) return;

  lf = new LogicFlow({
    container: containerRef.value,
    grid: {
      type: "dot",
      size: 20,
    },
    background: {
      backgroundColor: "#f8f9fa",
    },
    isSilentMode: false,
    stopScrollGraph: false,
    stopZoomGraph: false,
    stopMoveGraph: false,
    adjustEdge: true,
    adjustEdgeStartAndEnd: true,
    adjustNodePosition: true,
    snapline: true,
    nodeTextEdit: false,
    edgeTextEdit: false,
    edgeType: "bezier",
    hideAnchors: false,
    hoverOutline: true,
    nodeSelectedOutline: true,
    keyboard: {
      enabled: true,
    },
    style: {
      baseEdge: {
        stroke: "#0369A1",
        strokeDasharray: "5,5",
      },
    },
  });

  lf.setTheme({
    snapline: {
      stroke: "#1E90FF",
      strokeWidth: 1,
    },
  });

  allNodeTypes.forEach((nodeType) => {
    const isTask = nodeType.type === NODE_TYPE.TASK;
    register(
      {
        type: nodeType.type,
        component: isTask ? TaskNode : FlowNode,
        model: isTask ? TaskNodeModel : FlowNodeModel,
      },
      lf!,
    );
  });

  lf.on("graph:rendered", ({ graphModel }) => {
    flowId.value = graphModel.flowId!;
  });

  lf.on("node:click", ({ data }) => {
    emit("node-select", data);
  });

  lf.on("blank:click", () => {
    emit("blank-click");
  });

  lf.on("node:delete", ({ data }) => {
    if (data?.id) {
      emit("node-delete", data.id);
    }
  });

  lf.on("connection:not-allowed", ({ msg }) => {
    console.warn("连接被阻止:", msg);
    alert(msg || "当前连接不被允许");
  });

  // 取消默认的 backspace/delete 删除绑定，重新绑定只删除边的逻辑
  lf.keyboard.off(["backspace"]);
  lf.keyboard.on(["backspace", "del"], () => {
    // const elements = lf!.getGraphData();
    const selected = (lf as any).graphModel?.getSelectElements?.(true);
    if (!selected) return true;
    (lf as any).clearSelectElements();
    selected.edges?.forEach((edge: any) => {
      if (edge.id) lf!.deleteEdge(edge.id);
    });
    return false;
  });

  resizeObserver = new ResizeObserver(() => {
    resizeEditor();
  });
  resizeObserver.observe(containerRef.value);

  lf.render({});

  emit("lf-inited");
});

const handleDrop = (event: DragEvent) => {
  event.preventDefault();
  const data = event.dataTransfer?.getData("application/json");
  if (!data || !lf) return;

  const nodeType = JSON.parse(data);

  const {
    canvasOverlayPosition: { x, y },
  } = lf.getPointByClient(event.clientX, event.clientY);

  lf.addNode({
    id: `${nodeType.type}_${Date.now()}`,
    type: nodeType.type,
    x,
    y,
    properties: {
      name: nodeType.name,
      title: nodeType.title,
      color: nodeType.color,
      icon: nodeType.icon,
      hoverOutlineColor: nodeType.color,
      width: nodeType.defaultConfig.width,
      height: nodeType.defaultConfig.height,
    },
  });
};

const handleSave = () => {
  if (!lf) return;
  const data = lf.getGraphData();
  emit("save-request", data);
};

const handleClear = () => {
  if (!confirm("确定要清空所有节点和连线吗？此操作不可恢复。")) return;
  if (!lf) return;
  lf.clearData();
  emit("blank-click");
};

onUnmounted(() => {
  resizeObserver?.disconnect();
  resizeObserver = null;

  if (lf) {
    lf.destroy();
    lf = null;
  }
});

defineExpose({
  resize: resizeEditor,
  getGraphData,
  renderGraph,
  handleDrop,
  updateNodeProperties,
});
</script>

<style lang="scss" scoped>
.flow-canvas-wrapper {
  flex: 1;
  position: relative;
  overflow: hidden;
  min-height: 0;
  height: 100%;
}

.logic-flow-container {
  width: 100%;
  height: 100%;
}

.toolbar-panel {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 10;
  display: flex;
  gap: 8px;

  .btn {
    padding: 6px 14px;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    background: #fff;
    cursor: pointer;
    font-size: 13px;
    transition: all 0.2s;

    &:hover {
      border-color: #bfbfbf;
    }
  }

  .btn-primary {
    color: #fff;
    background: #1890ff;
    border-color: #1890ff;

    &:hover {
      background: #40a9ff;
      border-color: #40a9ff;
    }
  }

  .btn-danger {
    color: #ff4d4f;
    border-color: #ff4d4f;
    background: #fff;

    &:hover {
      color: #fff;
      background: #ff4d4f;
    }
  }
}
</style>
