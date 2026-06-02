<template>
  <div class="resize-edge-test">
    <div class="test-toolbar">
      <div class="toolbar-main">
        <div class="page-title">节点宽高与边修正测试</div>
        <div class="status-text">{{ statusText }}</div>
      </div>

      <div class="actions">
        <button
          class="btn"
          @click="loadLocalGraph"
        >
          重新读取
        </button>
        <button
          class="btn btn-primary"
          :disabled="!selectedNode"
          @click="increaseWidth"
        >
          增加宽度
        </button>
        <button
          class="btn btn-primary"
          :disabled="!selectedNode"
          @click="increaseHeight"
        >
          增加高度
        </button>
        <button
          class="btn btn-primary"
          :disabled="!hasGraphData"
          @click="increaseRandomNode"
        >
          随机增大
        </button>
        <button
          class="btn"
          :disabled="!hasGraphData"
          @click="toggleTaskMeta"
        >
          {{ showTaskMeta ? "隐藏任务信息" : "显示任务信息" }}
        </button>
        <button
          class="btn"
          :disabled="!hasGraphData"
          @click="toggleRandomNodeMeta"
        >
          随机切换节点信息
        </button>
      </div>
    </div>

    <div v-if="!hasGraphData" class="empty-state">
      没有本地数据，请先在计算引擎页面保存流程。
    </div>

    <FlowCanvas
      v-else
      ref="canvasRef"
      class="test-canvas"
      :show-toolbar="false"
      @lf-inited="renderCurrentGraph"
      @node-select="handleNodeSelect"
      @blank-click="handleBlankClick"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import FlowCanvas from "./FlowCanvas.vue";

const STORAGE_KEY = "compute-data";
const RESIZE_STEP = 20;
const TASK_META_HEIGHT_DELTA = 56;
const NODE_META_HEIGHT_DELTA = 48;

const canvasRef = ref<InstanceType<typeof FlowCanvas> | null>(null);
const selectedNode = ref<any>(null);
const graphData = ref<{ nodes: any[]; edges: any[] } | null>(null);
const message = ref("");
const showTaskMeta = ref(false);
const taskOriginalHeights = new Map<string, number>();
const nodeOriginalHeights = new Map<string, number>();

const hasGraphData = computed(() => {
  return Boolean(graphData.value?.nodes?.length);
});

const statusText = computed(() => {
  if (message.value) return message.value;
  if (!hasGraphData.value) return "未读取到本地流程数据";
  if (!selectedNode.value) return "请选择一个节点";
  const props = selectedNode.value.properties || {};
  return `已选中：${props.title || props.name || selectedNode.value.id}`;
});

const readLocalGraph = () => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const data = JSON.parse(raw);
    const nodes = Array.isArray(data?.nodes) ? data.nodes : [];
    const edges = Array.isArray(data?.edges) ? data.edges : [];
    if (!nodes.length) return null;
    return { nodes, edges };
  } catch (error) {
    console.error("[ResizeEdgeTest] localStorage 数据解析失败", error);
    return null;
  }
};

const loadLocalGraph = () => {
  const localGraph = readLocalGraph();
  selectedNode.value = null;
  showTaskMeta.value = false;
  taskOriginalHeights.clear();
  nodeOriginalHeights.clear();
  graphData.value = localGraph;

  if (!localGraph) {
    message.value = "没有本地数据";
    return;
  }

  message.value = "";
  canvasRef.value?.renderGraph(localGraph);
};

const renderCurrentGraph = () => {
  selectedNode.value = null;
  showTaskMeta.value = false;
  taskOriginalHeights.clear();
  nodeOriginalHeights.clear();

  if (!graphData.value) {
    message.value = "没有本地数据";
    return;
  }

  message.value = "";
  canvasRef.value?.renderGraph(graphData.value);
};

const handleNodeSelect = (node: any) => {
  selectedNode.value = node;
  message.value = "";
};

const handleBlankClick = () => {
  selectedNode.value = null;
  message.value = "";
};

const resizeSelectedNode = (delta: { deltaWidth?: number; deltaHeight?: number }) => {
  const result = canvasRef.value?.resizeSelectedNode(delta);
  if (!result) {
    message.value = "请先选中节点";
    return;
  }

  selectedNode.value = {
    ...selectedNode.value,
    id: result.id,
    properties: {
      ...(selectedNode.value?.properties || {}),
      width: result.width,
      height: result.height,
    },
  };
};

const increaseWidth = () => {
  resizeSelectedNode({ deltaWidth: RESIZE_STEP });
};

const increaseHeight = () => {
  resizeSelectedNode({ deltaHeight: RESIZE_STEP });
};

const increaseRandomNode = () => {
  const currentGraph = canvasRef.value?.getGraphData?.();
  const nodes = currentGraph?.nodes || graphData.value?.nodes || [];
  if (!nodes.length) {
    message.value = "没有可调整的节点";
    return;
  }

  const node = nodes[Math.floor(Math.random() * nodes.length)];
  const props = node.properties || {};
  const width = Math.max(30, (props.width || 160) + RESIZE_STEP);
  const height = Math.max(30, (props.height || 36) + RESIZE_STEP);

  canvasRef.value?.updateNodeProperties(node.id, {
    width,
    height,
  });

  // 上面是更新logicflow内部数据, 下面是更新本地的缓存数据，这样保持两边数据同步
  if (selectedNode.value?.id === node.id) {
    selectedNode.value = {
      ...selectedNode.value,
      properties: {
        ...(selectedNode.value.properties || {}),
        width,
        height,
      },
    };
  }

  message.value = `随机增大：${props.title || props.name || node.id}`;
};

const toggleTaskMeta = () => {
  const currentGraph = canvasRef.value?.getGraphData?.();
  const nodes = currentGraph?.nodes || graphData.value?.nodes || [];
  const taskNodes = nodes.filter((node: any) => node.type === "task");
  if (!taskNodes.length) {
    message.value = "没有任务节点";
    return;
  }

  const nextVisible = !showTaskMeta.value;
  taskNodes.forEach((node: any) => {
    const props = node.properties || {};
    const currentHeight = props.height || 64;

    if (nextVisible && !taskOriginalHeights.has(node.id)) {
      taskOriginalHeights.set(node.id, currentHeight);
    }

    const height = nextVisible
      ? currentHeight + TASK_META_HEIGHT_DELTA
      : taskOriginalHeights.get(node.id) || Math.max(64, currentHeight - TASK_META_HEIGHT_DELTA);

    canvasRef.value?.updateNodeProperties(node.id, {
      showTaskMeta: nextVisible,
      height,
    });

    if (!nextVisible) {
      taskOriginalHeights.delete(node.id);
    }
  });

  showTaskMeta.value = nextVisible;
  message.value = nextVisible ? "已显示任务节点信息" : "已隐藏任务节点信息";
};

const toggleRandomNodeMeta = () => {
  const currentGraph = canvasRef.value?.getGraphData?.();
  const nodes = currentGraph?.nodes || graphData.value?.nodes || [];
  if (!nodes.length) {
    message.value = "没有可切换的节点";
    return;
  }

  const node = nodes[Math.floor(Math.random() * nodes.length)];
  const props = node.properties || {};
  const isTask = node.type === "task";
  const metaKey = isTask ? "showTaskMeta" : "showNodeMeta";
  const originalHeights = isTask ? taskOriginalHeights : nodeOriginalHeights;
  const heightDelta = isTask ? TASK_META_HEIGHT_DELTA : NODE_META_HEIGHT_DELTA;
  const defaultHeight = isTask ? 64 : 36;
  const currentHeight = props.height || defaultHeight;
  const nextVisible = !Boolean(props[metaKey]);

  if (nextVisible && !originalHeights.has(node.id)) {
    originalHeights.set(node.id, currentHeight);
  }

  const height = nextVisible
    ? currentHeight + heightDelta
    : originalHeights.get(node.id) || Math.max(defaultHeight, currentHeight - heightDelta);

  canvasRef.value?.updateNodeProperties(node.id, {
    [metaKey]: nextVisible,
    height,
  });

  if (!nextVisible) {
    originalHeights.delete(node.id);
  }

  if (selectedNode.value?.id === node.id) {
    selectedNode.value = {
      ...selectedNode.value,
      properties: {
        ...(selectedNode.value.properties || {}),
        [metaKey]: nextVisible,
        height,
      },
    };
  }

  message.value = `${nextVisible ? "显示" : "隐藏"}节点信息：${props.title || props.name || node.id}`;
};

onMounted(() => {
  graphData.value = readLocalGraph();
  if (!graphData.value) {
    message.value = "没有本地数据";
  }
});
</script>

<style scoped lang="scss">
.resize-edge-test {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background: #eef2f6;
}

.test-toolbar {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: 56px;
  padding: 10px 16px;
  background: #fff;
  border-bottom: 1px solid #d9e2ec;
}

.toolbar-main {
  min-width: 0;
}

.page-title {
  font-size: 15px;
  font-weight: 600;
  line-height: 22px;
  color: #1f2933;
}

.status-text {
  margin-top: 2px;
  font-size: 12px;
  line-height: 18px;
  color: #66788a;
}

.actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.btn {
  height: 32px;
  padding: 0 14px;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  background: #fff;
  color: #1f2933;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    border-color: #0369a1;
    color: #0369a1;
  }

  &:disabled {
    cursor: not-allowed;
    color: #94a3b8;
    background: #f8fafc;
  }
}

.btn-primary {
  color: #fff;
  background: #0369a1;
  border-color: #0369a1;

  &:hover:not(:disabled) {
    color: #fff;
    background: #075985;
    border-color: #075985;
  }
}

.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  color: #66788a;
  font-size: 14px;
}

.test-canvas {
  flex: 1;
  min-height: 0;
}
</style>
