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
      <FlowCanvas
        ref="canvasRef"
        class="flow-canvas"
        @node-select="handleNodeSelect"
        @blank-click="handleBlankClick"
      />
    </div>

    <PropertyPanel v-model:visible="panelVisible" :node-id="selectedNodeId" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import FlowCanvas from "./FlowCanvas.vue";
import PropertyPanel from "./PropertyPanel.vue";
import { nodeTypes } from "./menus";
import { getDetail } from "./request";

const canvasRef = ref<InstanceType<typeof FlowCanvas> | null>(null);
const panelVisible = ref(false);
const selectedNodeId = ref("");

const handleNodeSelect = (node: any) => {
  selectedNodeId.value = node.id || "";
  panelVisible.value = true;
};

const handleBlankClick = () => {
  panelVisible.value = false;
  selectedNodeId.value = "";
};

const handleDragStart = (event: DragEvent, node: any) => {
  if (event.dataTransfer) {
    event.dataTransfer.setData("application/json", JSON.stringify(node));
  }
};

const loadData = async () => {
  const data = await getDetail();
  canvasRef.value?.renderGraph(data);
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
