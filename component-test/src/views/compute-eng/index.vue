<template>
  <div class="compute-eng-layout">
    <div class="left-panel">
      <div class="panel-title">可用节点</div>
      <div class="node-list">
        <div
          v-for="node in allNodeTypes"
          :key="node.type"
          class="node-item"
          draggable="true"
          @dragstart="handleDragStart($event, node)"
        >
          <div class="node-left-bar" :style="{ backgroundColor: node.color }"></div>
          <div class="node-icon" :style="{ backgroundColor: node.iconBgColor }">
            <span class="icon-text" :style="{ color: node.color }">{{ node.icon }}</span>
          </div>
          <div class="node-name">{{ node.name }}</div>
        </div>
      </div>
    </div>

    <div class="right-panel">
      <FlowCanvas
        ref="canvasRef"
        class="flow-canvas"
        @node-select="handleNodeSelect"
        @blank-click="handleBlankClick"
        @save-request="handleSaveRequest"
        @clear-request="handleClearRequest"
      />
    </div>

    <PropertyPanel
      ref="propertyPanelRef"
      @update-title="handleUpdateTitle"
    />
    <TaskPropertyPanel
      ref="taskPropertyPanelRef"
      @update-title="handleUpdateTitle"
    />
    <EndPropertyPanel
      ref="endPropertyPanelRef"
      @update-title="handleUpdateTitle"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, provide, ref } from "vue";
import FlowCanvas from "./FlowCanvas.vue";
import PropertyPanel from "./PropertyPanel.vue";
import TaskPropertyPanel from "./TaskPropertyPanel.vue";
import EndPropertyPanel from "./EndPropertyPanel.vue";
import { nodeTypes, allNodeTypes, NODE_TYPE } from "./menus";
import { getDetail } from "./request";
import { GET_GRAPH_DATA_FN_KEY, NODE_CONFIGS_KEY } from "./symbols";

const canvasRef = ref<InstanceType<typeof FlowCanvas> | null>(null);
const propertyPanelRef = ref<InstanceType<typeof PropertyPanel> | null>(null);
const taskPropertyPanelRef = ref<InstanceType<typeof TaskPropertyPanel> | null>(null);
const endPropertyPanelRef = ref<InstanceType<typeof EndPropertyPanel> | null>(null);
const nodeConfigs = ref<Record<string, any>>({});

provide(NODE_CONFIGS_KEY, nodeConfigs);
provide(GET_GRAPH_DATA_FN_KEY, () => {
  const data = canvasRef.value?.getGraphData?.();
  return data
});

const handleNodeSelect = (node: any) => {
  console.log("🚀 选中节点", node);
  if (node.type === NODE_TYPE.TASK) {
    propertyPanelRef.value?.close();
    endPropertyPanelRef.value?.close();
    taskPropertyPanelRef.value?.open(node);
  } else if (node.type === NODE_TYPE.END) {
    propertyPanelRef.value?.close();
    taskPropertyPanelRef.value?.close();
    endPropertyPanelRef.value?.open(node);
  } else {
    taskPropertyPanelRef.value?.close();
    endPropertyPanelRef.value?.close();
    propertyPanelRef.value?.open(node);
  }
};

const handleBlankClick = () => {
  propertyPanelRef.value?.close();
  taskPropertyPanelRef.value?.close();
  endPropertyPanelRef.value?.close();
};

const handleClearRequest = () => {
  nodeConfigs.value = {};
  propertyPanelRef.value?.close();
  taskPropertyPanelRef.value?.close();
  endPropertyPanelRef.value?.close();
};

const handleUpdateTitle = (payload: { nodeId: string; title: string }) => {
  canvasRef.value?.updateNodeProperties(payload.nodeId, { title: payload.title });
};

const handleSaveRequest = (graphData: any) => {
  const fullData = {
    nodes: graphData.nodes,
    edges: graphData.edges,
    configs: nodeConfigs.value,
  };
  console.log("[index.vue] 保存的完整数据:", fullData);
  localStorage.setItem("compute_eng_full_data", JSON.stringify(fullData));
  alert("流程配置已保存到本地");
};

const handleDragStart = (event: DragEvent, node: any) => {
  if (event.dataTransfer) {
    event.dataTransfer.setData("application/json", JSON.stringify(node));
  }
};

const loadData = async () => {
  const data: any = await getDetail();
  const {nodes=[], edges=[], configs = {}} = data
  nodeConfigs.value = configs;
  
  canvasRef.value?.renderGraph({nodes, edges});
};

onMounted(() => {
  loadData();
});
</script>

<style lang="scss">
.compute-eng-layout {
  display: flex;
  width: 100%;
  height: 100%;

  .left-panel {
    width: 200px;
    flex-shrink: 0;
    height: 100%;
    background: #fff;
    border-right: 1px solid #e8e8e8;
    display: flex;
    flex-direction: column;
  }

  .panel-title {
    padding: 14px 16px;
    border-bottom: 1px solid #e8e8e8;
    font-size: 14px;
    font-weight: 600;
    color: #262626;
  }

  .node-list {
    flex: 1;
    padding: 12px;
    overflow-y: auto;
  }

  .node-item {
    display: flex;
    align-items: center;
    background: #fff;
    border: 1px solid #d9d9d9;
    padding: 0 12px;
    position: relative;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
    border-radius: 6px;
    cursor: move;
    transition: all 0.2s;
    height: 36px;
    margin-bottom: 8px;

    &:hover {
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      border-color: #bfbfbf;
      transform: translateX(2px);
    }
  }

  .node-left-bar {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
  }

  .node-icon {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: 4px;
    margin-right: 8px;
    flex-shrink: 0;
  }

  .icon-text {
    font-size: 12px;
    font-weight: 600;
    color: #262626;
  }

  .node-name {
    flex: 1;
    font-size: 13px;
    font-weight: 500;
    color: #262626;
    line-height: 1.4;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .right-panel {
    flex: 1;
    min-width: 0;
    height: 100%;
    overflow: hidden;
  }

  .flow-canvas {
    width: 100%;
    height: 100%;
  }
}
</style>
