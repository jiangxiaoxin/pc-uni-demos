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
          <div
            class="node-icon-wrap"
            :style="{ backgroundColor: node.iconBgColor }"
          >
            <span class="node-icon-text" :style="{ color: node.color }">
              {{ node.icon }}
            </span>
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
import { getDetail } from "./request";

const canvasRef = ref<InstanceType<typeof FlowCanvas> | null>(null);

const handleDragStart = (event: DragEvent, node: any) => {
  if (event.dataTransfer) {
    event.dataTransfer.setData("application/json", JSON.stringify(node));
  }
};

onMounted(() => {
  getDetail().then((res) => {
    canvasRef.value?.renderGraph(res);
  })
});
</script>

<style lang="scss">
.compute-eng-layout {
  display: flex;
  width: 100%;
  height: 100%;

  .left-panel {
    width: 250px;
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
    gap: 10px;
    padding: 10px 12px;
    margin-bottom: 8px;
    background: #fafafa;
    border: 1px solid #e8e8e8;
    border-radius: 6px;
    cursor: move;
    transition: background-color 0.2s, border-color 0.2s, transform 0.2s;

    &:hover {
      background: #f0f0f0;
      border-color: #d9d9d9;
      transform: translateX(2px);
    }
  }

  .node-icon-wrap {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .node-icon-text {
    font-size: 14px;
    font-weight: 600;
  }

  .node-name {
    font-size: 13px;
    color: #262626;
    font-weight: 500;
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
