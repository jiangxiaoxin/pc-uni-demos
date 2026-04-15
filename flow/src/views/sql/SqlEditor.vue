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
            class="node-icon-wrap"
            :style="{ backgroundColor: node.iconBgColor }"
          >
            <component
              :is="getPanelNodeIcon(node.type)"
              class="node-icon"
              :style="{ color: node.color }"
            />
          </div>
          <div class="node-name">{{ node.name }}</div>
        </div>
      </div>
    </div>

    <div class="right-area">
      <editor
        ref="editorRef"
        class="editor-area"
        @node-select="handleNodeSelect"
        @connection-change="handleConnectionChange"
        @node-delete="handleNodeDelete"
        @blank-click="handleBlankClick"
        @save-request="handleSaveRequest"
        @preview-request="handlePreviewRequest"
      />
      <property
        ref="propertyRef"
        :visible="propertyVisible"
        :node-data="selectedNode"
        :incoming-count="selectedIncomingCount"
        @submit-name="handleSubmitName"
        @submit-properties="handleSubmitProperties"
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
  import { message } from "ant-design-vue";
  import { nextTick, onMounted, provide, ref, watch } from "vue";
  import { nodeTypes } from "./menus";
  import { sqlNodeIconMap } from "./nodes/iconMap";
  import editor from "./editor.vue";
  import property from "./property.vue";
  import InputNodeBindModal from "./node-config/InputNodeBindModal.vue";
  import { buildNodeContext, sqlNodeContextKey, type SqlGraphData } from "./nodeContext";
  import { inputNodeMockSources, resolveInputBinding } from "./inputNodeMock";
  import type { InputBindingPersisted } from "./types";

  interface EditorExpose {
    resize: () => void;
    focusNode: (nodeId: string) => void;
    updateNodeTitle: (nodeId: string, title: string) => void;
    updateNodeProperties: (
      nodeId: string,
      properties: Record<string, unknown>,
    ) => void;
    getGraphData: () => SqlGraphData | undefined;
    saveToLocal: () => void;
    openPreview: () => void;
    load: () => Promise<void>;
    renderGraph: (data: SqlGraphData) => Promise<void>;
  }

  interface PropertyExpose {
    flushDraftProperties: () => void;
  }

  interface SqlNodeData {
    id: string;
    type: string;
    properties?: Record<string, unknown>;
  }

  interface NodeSelectPayload {
    node: SqlNodeData;
    incomingCount: number;
  }

  interface ConnectionChangePayload {
    nodeId: string;
    incomingCount: number;
  }

  // LogicFlow 编辑器实例，用于操作画布、节点和读取当前图数据。
  const editorRef = ref<EditorExpose | null>(null);
  // 属性面板暴露的能力，目前只用于在切换节点前冲刷本地草稿配置。
  const propertyRef = ref<PropertyExpose | null>(null);
  // 当前是否显示底部 property 面板。
  const propertyVisible = ref(false);
  // 当前选中的节点，property 面板和节点配置都围绕它展开。
  const selectedNode = ref<SqlNodeData | null>(null);
  // 当前选中节点的入边数量，只用于连线有效性校验提示。
  const selectedIncomingCount = ref(0);
  // 输入节点选择数据源弹框的显隐状态。
  const bindModalVisible = ref(false);
  // 当前正在绑定数据源的输入节点。
  const pendingBindNode = ref<SqlNodeData | null>(null);
  // 输入节点弹框打开时的初始回显绑定值。
  const pendingInputBinding = ref<InputBindingPersisted | null>(null);
  // TODO: 输入节点弹窗当前直接消费 inputNodeMockSources，目的是先把 SQL 画布的数据源绑定流程跑通，后续应替换为真实数据源列表接口。

  const getNodeContext = (nodeId: string) => {
    return buildNodeContext(editorRef.value?.getGraphData(), nodeId);
  };

  provide(sqlNodeContextKey, getNodeContext);

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

  const getPanelNodeIcon = (nodeType: string) => {
    return sqlNodeIconMap[nodeType] || null;
  };

  const handleNodeSelect = async (payload: NodeSelectPayload) => {
    const node = payload.node;
    selectedIncomingCount.value = payload.incomingCount || 0;

    if (selectedNode.value?.id && selectedNode.value.id !== node.id) {
      propertyRef.value?.flushDraftProperties();
    }

    if (node.type === "in-node" && !node.properties?.inputBinding) {
      // 如果当前是输入节点，且没有绑定数据源，则弹出绑定数据源弹框。
      pendingBindNode.value = node;
      pendingInputBinding.value = null;
      propertyVisible.value = false;
      selectedNode.value = null;
      selectedIncomingCount.value = 0;
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
    propertyRef.value?.flushDraftProperties();
    selectedNode.value = null;
    selectedIncomingCount.value = 0;
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
    selectedIncomingCount.value = 0;
    propertyVisible.value = false;
    await nextTick();
    editorRef.value?.resize();
  };

  const handleConnectionChange = (payload: ConnectionChangePayload) => {
    if (selectedNode.value?.id !== payload.nodeId) return;
    selectedIncomingCount.value = payload.incomingCount;
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

  const handleSubmitProperties = (properties: Record<string, unknown>) => {
    const currentNode = selectedNode.value;
    if (!currentNode) return;

    editorRef.value?.updateNodeProperties(currentNode.id, properties);
    Object.assign(ensureNodeProperties(currentNode), properties);
  };

  const handleChangeInputSource = () => {
    const currentNode = selectedNode.value;
    if (!currentNode || currentNode.type !== "in-node") return;

    propertyRef.value?.flushDraftProperties();

    pendingBindNode.value = currentNode;
    pendingInputBinding.value = (currentNode.properties?.inputBinding ||
      null) as InputBindingPersisted | null;
    bindModalVisible.value = true;
    propertyVisible.value = false;
  };

  const handleConfirmInputBinding = async (binding: InputBindingPersisted) => {
    const currentNode = pendingBindNode.value;
    if (!currentNode) return;
    // TODO: 这里用 mock 元数据把 sourceId 解析成 sourceName/fields 做回填，后续接真实接口后应改成以后端返回的绑定结果为准。
    const resolvedBinding = resolveInputBinding(binding);
    if (!resolvedBinding) return;

    editorRef.value?.updateNodeProperties(currentNode.id, {
      inputBinding: binding,
      title: resolvedBinding.sourceName,
    });

    ensureNodeProperties(currentNode).inputBinding = binding;
    ensureNodeProperties(currentNode).title = resolvedBinding.sourceName;
    selectedNode.value = currentNode;
    pendingBindNode.value = null;
    pendingInputBinding.value = binding;
    bindModalVisible.value = false;
    propertyVisible.value = true;

    await nextTick();
    editorRef.value?.resize();
  };

  const flushPropertyDrafts = async () => {
    propertyRef.value?.flushDraftProperties();
    await nextTick();
  };

  const handleSaveRequest = async () => {
    // 保存数据时，先让property flush 一遍本地的配置，写入到 lf 的节点配置里，然后调用editor 里的saveToLocal方法，将当前画布上的数据保存到本地。
    await flushPropertyDrafts();
    editorRef.value?.saveToLocal();
  };

  const handlePreviewRequest = async () => {
    await flushPropertyDrafts();
    editorRef.value?.openPreview();
  };

  const loadGraphData = async () => {
    // TODO: 后续替换为真实接口获取配置
    const STORAGE_KEY = "sql_editor_flow_data";
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        await editorRef.value?.renderGraph(data);
        message.success("流程配置已加载");
      } catch {
        await editorRef.value?.renderGraph({});
        message.error("加载失败：配置数据损坏");
      }
    }
  };

  onMounted(() => {
    // mock 延迟获取配置
    setTimeout(() => {
      void loadGraphData();
    }, 1000);
  });
</script>

<style scoped lang="scss">
  .sql-editor {
    display: flex;
    inline-size: 100%;
    block-size: 100%;
    background: #f5f5f5;
  }

  .node-panel {
    display: flex;
    flex-direction: column;
    width: 160px;
    background: #fff;
    border-right: 1px solid #e8e8e8;
  }

  .panel-title {
    padding: 12px 16px;
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
  }

  .node-item:hover {
    background: #f0f0f0;
    border-color: #d9d9d9;
    transform: translateX(2px);
  }

  .node-icon-wrap {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .node-icon {
    width: 16px;
    height: 16px;
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
    min-width: 0;
    overflow: hidden;
  }

  .editor-area {
    flex: 1;
    min-height: 0;
  }
</style>
