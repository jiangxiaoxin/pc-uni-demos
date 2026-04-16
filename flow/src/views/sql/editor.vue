<template>
  <div class="editor-wrapper" @drop="handleDrop" @dragover.prevent>
    <div class="toolbar-panel">
      <a-space>
        <a-button type="primary" @click="emit('save-request')">
          <template #icon><SaveOutlined /></template>
          保存
        </a-button>
        <a-button @click="handleLoad">
          <template #icon><UploadOutlined /></template>
          加载
        </a-button>
        <a-button @click="emit('preview-request')">
          <template #icon><EyeOutlined /></template>
          预览
        </a-button>
        <a-button @click="handleCenter">
          <template #icon><FullscreenOutlined /></template>
          居中
        </a-button>
        <a-button danger @click="handleClear">
          <template #icon><DeleteOutlined /></template>
          清空
        </a-button>
      </a-space>
    </div>

    <div ref="containerRef" class="logic-flow-container"></div>
    <TeleportContainer :flow-id="flowId" />

    <a-modal
      v-model:open="previewVisible"
      title="流程配置预览"
      width="800px"
      :footer="null"
    >
      <div class="preview-content">
        <a-alert
          message="以下是当前流程图的完整配置数据"
          type="info"
          show-icon
          style="margin-bottom: 16px"
        />
        <div class="preview-actions">
          <a-button type="primary" @click="handleCopyConfig">
            <template #icon><CopyOutlined /></template>
            复制配置
          </a-button>
        </div>
        <pre class="preview-data">{{ previewData }}</pre>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
  import LogicFlow from "@logicflow/core";
  import "@logicflow/core/dist/index.css";
  import { nextTick, onMounted, onUnmounted, ref } from "vue";
  import { message, Modal } from "ant-design-vue";
  import {
    SaveOutlined,
    UploadOutlined,
    EyeOutlined,
    DeleteOutlined,
    CopyOutlined,
    FullscreenOutlined,
  } from "@ant-design/icons-vue";
  import { register, getTeleport } from "@logicflow/vue-node-registry";
  import SqlNode from "./nodes/SqlNode.vue";
  import SqlNodeModel from "./nodes/SqlNodeModel";
  import { nodeTypes } from "./menus";
  import type { SqlGraphData } from "./nodeContext";

  interface SqlNodeData {
    id: string;
    type: string;
    x: number;
    y: number;
    properties?: Record<string, unknown>;
  }

  interface EdgeEventPayload {
    data?: {
      targetNodeId?: string;
    };
  }

  const emit = defineEmits<{
    (
      e: "node-select",
      payload: { node: SqlNodeData; incomingCount: number },
    ): void;
    (e: "node-delete", nodeId: string): void;
    (
      e: "connection-change",
      payload: { nodeId: string; incomingCount: number },
    ): void;
    (e: "blank-click"): void;
    (e: "save-request"): void;
    (e: "preview-request"): void;
  }>();

  const TeleportContainer = getTeleport();

  let lf: LogicFlow | null = null;
  let resizeObserver: ResizeObserver | null = null;
  const containerRef = ref<HTMLElement>();
  const flowId = ref("");
  const previewVisible = ref(false);
  const previewData = ref("");

  const STORAGE_KEY = "sql_editor_flow_data";

  const resizeEditor = () => {
    lf?.resize();
  };

  const focusNode = (nodeId: string) => {
    if (!lf) return;
    resizeEditor();
    lf.focusOn(nodeId);
  };

  const updateNodeTitle = (nodeId: string, title: string) => {
    if (!lf) return;
    lf.setProperties(nodeId, {
      title,
    });
  };

  const updateNodeProperties = (
    nodeId: string,
    properties: Record<string, unknown>,
  ) => {
    console.log('editor updateNodeProperties');
    
    if (!lf) return;
    lf.setProperties(nodeId, properties);
  };

  const getGraphNodes = () => lf?.getGraphData()?.nodes || [];
  const getGraphData = () => lf?.getGraphData();
  const renderGraph = async (data: SqlGraphData) => {
    if (!lf) return;
    lf.render(data as any);
    await nextTick();
    resizeEditor();
  };
  const getIncomingCountByNodeId = (nodeId: string): number => {
    const edges = lf?.getGraphData()?.edges || [];
    return edges.filter((edge) => edge.targetNodeId === nodeId).length;
  };

  const centerGraph = () => {
    if (!lf) return false;
    lf.translateCenter();

    return true;
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
      // edgeType: "polyline",
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
        },
      },
    });

    lf.setTheme({
      snapline: {
        stroke: "#1E90FF",
        strokeWidth: 1,
      },
    });

    nodeTypes.forEach((nodeType) => {
      register(
        {
          type: nodeType.type,
          component: SqlNode,
          model: SqlNodeModel,
        },
        lf!,
      );
    });

    lf.on("graph:rendered", ({ graphModel }) => {
      flowId.value = graphModel.flowId!;
    });

    lf.on("node:click", ({ data }) => {
      const node = data as SqlNodeData;
      console.log("🚀 ~ editor.vue:223 ~ node:", node)

      emit("node-select", {
        node,
        incomingCount: getIncomingCountByNodeId(node.id), // 连接了几条线进来
      });
    });

    lf.on("blank:click", () => {
      console.log("blank:clickkkkkkkkkkkkkkk");
      emit("blank-click");
    });

    lf.on("node:delete", ({ data }) => {
      if (data?.id) {
        emit("node-delete", data.id);
      }
    });

    const emitConnectionChangeByTarget = ({ data }: EdgeEventPayload) => {
      const targetNodeId = data?.targetNodeId;
      if (!targetNodeId) return;
      emit("connection-change", {
        nodeId: targetNodeId,
        incomingCount: getIncomingCountByNodeId(targetNodeId),
      });
    };

    lf.on("edge:add", emitConnectionChangeByTarget);
    lf.on("edge:delete", emitConnectionChangeByTarget);

    lf.on("connection:not-allowed", ({ msg }) => {
      console.warn("连接被阻止:", msg);
      message.warning(msg || "当前连接不被允许");
    });

    resizeObserver = new ResizeObserver(() => {
      resizeEditor();
    });
    resizeObserver.observe(containerRef.value);
  });

  const hasNodeType = (type: string): boolean => {
    if (!lf) return false;
    return getGraphNodes().some((node) => node.type === type);
  };

  const handleDrop = (event: DragEvent) => {
    event.preventDefault();
    const data = event.dataTransfer?.getData("application/json");
    if (!data || !lf) return;

    const nodeType = JSON.parse(data);
    const container = containerRef.value;
    if (!container) return;

    if (nodeType.type === "out-node" && hasNodeType("out-node")) {
      message.warning("画布中只能有一个数据输出节点");
      return;
    }

    const rect = container.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    lf.addNode({
      id: `${nodeType.type}_${Date.now()}`,
      type: nodeType.type,
      x,
      y,
      properties: {
        name: nodeType.name,
        title: nodeType.title || nodeType.name,
        color: nodeType.color,
        icon: nodeType.icon,
        anchors: nodeType.anchors,
        hoverOutlineColor: nodeType.color,
        width: nodeType.defaultConfig.width,
        height: nodeType.defaultConfig.height,
      },
    });

    message.success(`已添加 ${nodeType.name} 节点`);
  };

  //TODO 未来调用接口存到数据库
  const saveToLocal = () => {
    if (!lf) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lf.getGraphData()));
    console.log("流程配置已保存到本地");
  };

  const handleLoad = async () => {
    const savedData = localStorage.getItem(STORAGE_KEY); //TODO 从后端获取配置
    if (!savedData) {
      message.warning("没有找到已保存的配置");
      return;
    }

    if (!lf) return;

    try {
      lf.render(JSON.parse(savedData));
      await nextTick();
      resizeEditor();
      message.success("流程配置已加载");
    } catch {
      message.error("加载失败：配置数据损坏");
    }
  };

  const openPreview = () => {
    if (!lf) return;
    previewData.value = JSON.stringify(lf.getGraphData(), null, 2);
    previewVisible.value = true;
  };

  const handleCopyConfig = async () => {
    try {
      await navigator.clipboard.writeText(previewData.value);
      message.success("配置已复制到剪贴板");
    } catch {
      message.error("复制失败，请手动复制");
    }
  };

  const handleCenter = async () => {
    if (!lf) return;
    await nextTick();
    resizeEditor();
    if (centerGraph()) {
      message.success("节点已居中显示");
    }
  };

  const handleClear = () => {
    Modal.confirm({
      title: "确认清空",
      content: "确定要清空所有节点和连线吗？此操作不可恢复。",
      okText: "清空",
      okType: "danger",
      cancelText: "取消",
      onOk: () => {
        if (!lf) return;
        lf.clearData();
        emit("blank-click");
        message.success("画布已清空");
      },
    });
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
    focusNode,
    centerGraph,
    updateNodeTitle,
    updateNodeProperties,
    getGraphData,
    saveToLocal,
    openPreview,
    renderGraph,
  });
</script>

<style lang="scss" scoped>
  .editor-wrapper {
    flex: 1;
    position: relative;
    overflow: hidden;
    min-height: 0;
  }

  .logic-flow-container {
    width: 100%;
    height: 100%;
  }

  .toolbar-panel {
    position: absolute;
    top: 16px;
    right: 16px;
    z-index: 10;
    background: #fff;
    padding: 12px 16px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }

  .preview-content {
    .preview-actions {
      margin-bottom: 12px;
      display: flex;
      justify-content: flex-end;
    }

    .preview-data {
      max-height: 500px;
      overflow: auto;
      font-size: 12px;
      background: #f5f5f5;
      padding: 16px;
      border-radius: 4px;
      border: 1px solid #e8e8e8;
      margin: 0;
    }
  }
</style>
