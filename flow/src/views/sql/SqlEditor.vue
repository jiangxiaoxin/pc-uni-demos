<template>
  <div class="sql-editor">
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

    <div class="right-area">
      <editor
        ref="editorRef"
        class="editor-area"
        @node-select="handleNodeSelect"
        @blank-click="handleBlankClick"
      />
      <property
        :visible="propertyVisible"
        :node-data="selectedNode"
        @submit-name="handleSubmitName"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { nextTick, ref } from "vue";
  import { nodeTypes } from "./menus";
  import editor from "./editor.vue";
  import property from "./property.vue";

  interface EditorExpose {
    resize: () => void;
    focusNode: (nodeId: string) => void;
    updateNodeName: (nodeId: string, name: string) => void;
  }

  interface SqlNodeData {
    id: string;
    type: string;
    properties?: Record<string, unknown>;
  }

  const editorRef = ref<EditorExpose | null>(null);
  const propertyVisible = ref(false);
  const selectedNode = ref<SqlNodeData | null>(null);

  const handleDragStart = (event: DragEvent, node: unknown) => {
    if (event.dataTransfer) {
      event.dataTransfer.setData("application/json", JSON.stringify(node));
    }
  };

  const handleNodeSelect = async (node: SqlNodeData) => {
    selectedNode.value = node;
    propertyVisible.value = true;
    await nextTick();
    editorRef.value?.resize();
    // editorRef.value?.focusNode(node.id);
  };

  const handleBlankClick = async () => {
    selectedNode.value = null;
    propertyVisible.value = false;
    await nextTick();
    editorRef.value?.resize();
  };

  const handleSubmitName = (name: string) => {
    const currentNode = selectedNode.value;
    if (!currentNode) return;

    editorRef.value?.updateNodeName(currentNode.id, name);
    selectedNode.value = {
      ...currentNode,
      properties: {
        ...currentNode.properties,
        title: name,
        name,
      },
    };
  };
</script>

<style scoped lang="scss">
  .sql-editor {
    display: flex;
    width: 100%;
    height: 100%;
    background: #f5f5f5;
  }

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

  .right-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    min-width: 0;
  }

  .editor-area {
    flex: 1;
    min-height: 0;
  }
</style>
