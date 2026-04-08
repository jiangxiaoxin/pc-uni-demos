<template>
  <div class="sql-editor">
    <!-- 左侧节点列表 -->
    <div class="node-panel">
      <div class="panel-title">SQL 节点</div>
      <div class="node-list">
        <div
          v-for="node in nodeTypes"
          :key="node.type"
          class="node-item"
          draggable="true"
          @dragstart="handleDragStart($event, node)"
        >
          <div
            class="node-circle"
            :style="{ backgroundColor: node.color }"
          ></div>
          <div class="node-name">{{ node.name }}</div>
        </div>
      </div>
    </div>

    <!-- 右侧区域 -->
    <div class="right-area">
      <!-- 上方：LogicFlow 编辑器 -->
      <editor />

      <!-- 下方：属性编辑区域 -->
      <property />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { nodeTypes } from "./menus";
  import editor from "./editor.vue";
  import property from "./property.vue";

  // 拖拽开始
  const handleDragStart = (event: DragEvent, node: any) => {
    if (event.dataTransfer) {
      event.dataTransfer.setData("application/json", JSON.stringify(node));
    }
  };
</script>

<style scoped lang="scss">
  .sql-editor {
    display: flex;
    width: 100%;
    height: 100%;
    background: #f5f5f5;
  }

  /* 左侧节点面板 */
  .node-panel {
    width: 160px;
    background: #fff;
    border-right: 1px solid #e8e8e8;
    display: flex;
    flex-direction: column;
  }

  .panel-title {
    padding: 12px 16px;
    font-size: 14px;
    font-weight: 600;
    color: #262626;
    border-bottom: 1px solid #e8e8e8;
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
    transition: all 0.2s;
  }

  .node-item:hover {
    background: #f0f0f0;
    border-color: #d9d9d9;
    transform: translateX(2px);
  }

  .node-circle {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .node-name {
    font-size: 13px;
    color: #262626;
    font-weight: 500;
  }

  /* 右侧区域 */
  .right-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
</style>
