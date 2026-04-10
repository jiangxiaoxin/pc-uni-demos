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
        @node-delete="handleNodeDelete"
        @blank-click="handleBlankClick"
      />
      <property
        :visible="propertyVisible"
        :node-data="selectedNode"
        @submit-name="handleSubmitName"
        @submit-property="handleSubmitProperty"
        @change-input-source="handleChangeInputSource"
      />
    </div>

    <InputNodeBindModal
      v-model:open="bindModalVisible"
      :sources="inputNodeMockSources"
      :initial-binding="pendingInputBinding"
      @confirm="handleConfirmInputBinding"
    />
  </div>
</template>

<script setup lang="ts">
  import { nextTick, ref, watch } from "vue";
  import { nodeTypes } from "./menus";
  import editor from "./editor.vue";
  import property from "./property.vue";
  import InputNodeBindModal from "./InputNodeBindModal.vue";
  import {
    inputNodeMockSources,
    type BoundInputSource,
  } from "./inputNodeMock";

  interface EditorExpose {
    resize: () => void;
    focusNode: (nodeId: string) => void;
    updateNodeTitle: (nodeId: string, title: string) => void;
    updateNodeProperties: (
      nodeId: string,
      properties: Record<string, unknown>,
    ) => void;
  }

  interface SqlNodeData {
    id: string;
    type: string;
    properties?: Record<string, unknown>;
  }

  const editorRef = ref<EditorExpose | null>(null);
  const propertyVisible = ref(false);
  const selectedNode = ref<SqlNodeData | null>(null);
  const bindModalVisible = ref(false);
  const pendingBindNode = ref<SqlNodeData | null>(null);
  const pendingInputBinding = ref<BoundInputSource | null>(null);

  watch(bindModalVisible, (visible) => {
    if (visible) return;
    if (!pendingBindNode.value?.properties?.inputBinding) {
      pendingBindNode.value = null;
      pendingInputBinding.value = null;
      return;
    }
    if (selectedNode.value?.id === pendingBindNode.value.id) {
      propertyVisible.value = true;
    }
    pendingBindNode.value = null;
    pendingInputBinding.value = null;
  });

  const handleDragStart = (event: DragEvent, node: unknown) => {
    if (event.dataTransfer) {
      event.dataTransfer.setData("application/json", JSON.stringify(node));
    }
  };

  const handleNodeSelect = async (node: SqlNodeData) => {
    if (node.type === "in-node" && !node.properties?.inputBinding) {
      pendingBindNode.value = node;
      pendingInputBinding.value = null;
      propertyVisible.value = false;
      selectedNode.value = null;
      bindModalVisible.value = true;
      await nextTick();
      editorRef.value?.resize();
      return;
    }

    selectedNode.value = node;
    propertyVisible.value = true;
    bindModalVisible.value = false;
    await nextTick();
    editorRef.value?.resize();
  };

  const handleBlankClick = async () => {
    selectedNode.value = null;
    propertyVisible.value = false;
    bindModalVisible.value = false;
    pendingBindNode.value = null;
    pendingInputBinding.value = null;
    await nextTick();
    editorRef.value?.resize();
  };

  const handleNodeDelete = async (nodeId: string) => {
    if (selectedNode.value?.id !== nodeId) return;

    selectedNode.value = null;
    propertyVisible.value = false;
    await nextTick();
    editorRef.value?.resize();
  };

  const ensureNodeProperties = (node: SqlNodeData) => {
    if (!node.properties) {
      node.properties = {};
    }
    return node.properties;
  };

  const handleSubmitName = (name: string) => {
    const currentNode = selectedNode.value;
    if (!currentNode) return;

    editorRef.value?.updateNodeTitle(currentNode.id, name);

    ensureNodeProperties(currentNode).title = name;
  };

  const handleSubmitProperty = (payload: { key: string; value: unknown }) => {
    const currentNode = selectedNode.value;
    if (!currentNode) return;

    editorRef.value?.updateNodeProperties(currentNode.id, {
      [payload.key]: payload.value,
    });

    ensureNodeProperties(currentNode)[payload.key] = payload.value;
  };

  const handleChangeInputSource = () => {
    const currentNode = selectedNode.value;
    if (!currentNode || currentNode.type !== "in-node") return;

    pendingBindNode.value = currentNode;
    pendingInputBinding.value = (currentNode.properties?.inputBinding ||
      null) as BoundInputSource | null;
    bindModalVisible.value = true;
    propertyVisible.value = false;
  };

  const handleConfirmInputBinding = async (binding: BoundInputSource) => {
    const currentNode = pendingBindNode.value;
    if (!currentNode) return;

    editorRef.value?.updateNodeProperties(currentNode.id, {
      inputBinding: binding,
      title: binding.sourceName,
    });

    ensureNodeProperties(currentNode).inputBinding = binding;
    ensureNodeProperties(currentNode).title = binding.sourceName;
    selectedNode.value = currentNode;
    pendingBindNode.value = null;
    pendingInputBinding.value = binding;
    bindModalVisible.value = false;
    propertyVisible.value = true;

    await nextTick();
    editorRef.value?.resize();
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
