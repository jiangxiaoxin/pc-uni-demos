<template>
  <div class="compute-eng-layout">
    <div class="left-panel">
      <div class="panel-title">可用节点</div>
      <div class="node-list">
        <div
          v-for="node in nodeTypes"
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
      <FlowCanvas ref="canvasRef" class="flow-canvas" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import FlowCanvas from "./FlowCanvas.vue";
import { nodeTypes } from "./menus";

const canvasRef = ref<InstanceType<typeof FlowCanvas> | null>(null);

const handleDragStart = (event: DragEvent, node: any) => {
  if (event.dataTransfer) {
    event.dataTransfer.setData("application/json", JSON.stringify(node));
  }
};

const loadMockData = () => {
  const mockData = {
    nodes: [
      {
        id: "start_1",
        type: "start",
        x: 200,
        y: 100,
        properties: {
          name: "开始节点",
          title: "开始",
          color: "#52c41a",
          icon: "▶",
          hoverOutlineColor: "#52c41a",
          width: 160,
          height: 36,
        },
      },
      {
        id: "action_1",
        type: "action",
        x: 200,
        y: 220,
        properties: {
          name: "动作节点",
          title: "处理数据",
          color: "#1890ff",
          icon: "⚡",
          hoverOutlineColor: "#1890ff",
          width: 160,
          height: 36,
        },
      },
      {
        id: "action_2",
        type: "action",
        x: 200,
        y: 340,
        properties: {
          name: "动作节点",
          title: "验证结果",
          color: "#1890ff",
          icon: "⚡",
          hoverOutlineColor: "#1890ff",
          width: 160,
          height: 36,
        },
      },
      {
        id: "end_1",
        type: "end",
        x: 200,
        y: 460,
        properties: {
          name: "结束节点",
          title: "结束",
          color: "#ff4d4f",
          icon: "■",
          hoverOutlineColor: "#ff4d4f",
          width: 160,
          height: 36,
        },
      },
    ],
    edges: [
      {
        id: "edge_1",
        type: "bezier",
        sourceNodeId: "start_1",
        targetNodeId: "action_1",
      },
      {
        id: "edge_2",
        type: "bezier",
        sourceNodeId: "action_1",
        targetNodeId: "action_2",
      },
      {
        id: "edge_3",
        type: "bezier",
        sourceNodeId: "action_2",
        targetNodeId: "end_1",
      },
    ],
  };

  canvasRef.value?.renderGraph(mockData);
};

onMounted(() => {
  loadMockData();
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
