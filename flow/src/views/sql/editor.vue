<template>
  <div class="editor-wrapper" @drop="handleDrop" @dragover.prevent>
    <!-- 右上角按钮面板 -->
    <div class="toolbar-panel">
      <a-space>
        <a-button type="primary" @click="handleSave">
          <template #icon><SaveOutlined /></template>
          保存
        </a-button>
        <a-button @click="handleLoad">
          <template #icon><UploadOutlined /></template>
          加载
        </a-button>
        <a-button @click="handlePreview">
          <template #icon><EyeOutlined /></template>
          预览
        </a-button>
        <a-button danger @click="handleClear">
          <template #icon><DeleteOutlined /></template>
          清空
        </a-button>
      </a-space>
    </div>
    <div ref="containerRef" class="logic-flow-container"></div>
    <TeleportContainer :flow-id="flowId" />

    <!-- 预览弹框 -->
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
  import { onMounted, onUnmounted, ref } from "vue";
  import { message, Modal } from "ant-design-vue";
  import {
    SaveOutlined,
    UploadOutlined,
    EyeOutlined,
    DeleteOutlined,
    CopyOutlined,
  } from "@ant-design/icons-vue";
  import { register, getTeleport } from "@logicflow/vue-node-registry";
  import SqlNode from "./nodes/SqlNode.vue";
  import SqlNodeModel from "./nodes/SqlNodeModel";
  import { nodeTypes } from "./menus";

  // 获取 TeleportContainer 组件
  const TeleportContainer = getTeleport();

  let lf: LogicFlow | null = null;
  const containerRef = ref<HTMLElement>();
  const flowId = ref("");

  // 预览弹框状态
  const previewVisible = ref(false);
  const previewData = ref("");

  // localStorage key
  const STORAGE_KEY = "sql_editor_flow_data";

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
      edgeType: "polyline",
      hideAnchors: false,
      hoverOutline: true,
      nodeSelectedOutline: true,
      keyboard: {
        enabled: true,
      },
      style: {
        baseEdge: {
          stroke: "#aaa",
        },
      },
    });

    // 修改对齐线样式
    lf.setTheme({
      snapline: {
        stroke: "#1E90FF", // 对齐线颜色
        strokeWidth: 1, // 对齐线宽度
      },
    });

    // // 注册 Delete 键删除选中的元素
    // lf.keyboard.on("delete", () => {
    //   const selectedElements = lf?.getSelectElements(false);
    //   if (selectedElements) {
    //     lf?.deleteElements(selectedElements);
    //   }
    //   return false; // 阻止默认浏览器行为
    // });

    // 注册所有 SQL 节点类型（使用同一个组件和 Model）
    nodeTypes.forEach((nodeType) => {
      register(
        {
          type: nodeType.type,
          component: SqlNode,
          model: SqlNodeModel,
        },
        lf,
      );
    });

    // 获取 flowId 用于 TeleportContainer
    lf.on("graph:rendered", ({ graphModel }) => {
      flowId.value = graphModel.flowId!;
    });

    // 节点点击事件
    lf.on("node:click", ({ data }) => {
      console.log("选中节点:", data);
    });

    // 空白处点击
    lf.on("blank:click", () => {
      console.log("取消选中");
    });

    // 监听连接事件
    lf.on("edge:add", ({ data }) => {
      console.log("🚀 连线添加成功:", data);
    });

    lf.on("connection:not-allowed", ({ msg }) => {
      console.warn("🚫 连接被阻止:", msg);
      message.warning(msg || "当前连接不被允许");
    });

    // 渲染空数据
    lf.render({});
  });

  // 检查画布中是否已存在某类型节点
  const hasNodeType = (type: string): boolean => {
    if (!lf) return false;
    const graphData = lf.getGraphData();
    return graphData.nodes?.some((node) => node.type === type) || false;
  };

  // 拖拽放置
  const handleDrop = (event: DragEvent) => {
    event.preventDefault();
    const data = event.dataTransfer?.getData("application/json");
    if (!data || !lf) return;

    const nodeType = JSON.parse(data);
    const container = containerRef.value;
    if (!container) return;

    // 规则: 整个画布只能有一个数据输出节点
    if (nodeType.type === "out-node" && hasNodeType("out-node")) {
      message.warning("画布中只能有一个数据输出节点");
      return;
    }

    const rect = container.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // 使用自定义节点类型
    const newNode = {
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
    };

    lf.addNode(newNode);
    message.success(`已添加 ${nodeType.name} 节点`);
  };

  // 保存配置到本地
  const handleSave = () => {
    if (!lf) return;
    const data = lf.getGraphData();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    message.success("流程配置已保存到本地");
  };

  // 从本地加载配置
  const handleLoad = () => {
    if (!lf) return;
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        lf.render(data);
        message.success("流程配置已加载");
      } catch (e) {
        message.error("加载失败：配置数据损坏");
      }
    } else {
      message.warning("没有找到保存的配置");
    }
  };

  // 预览配置
  const handlePreview = () => {
    if (!lf) return;
    const data = lf.getGraphData();
    previewData.value = JSON.stringify(data, null, 2);
    previewVisible.value = true;
  };

  // 复制配置到剪贴板
  const handleCopyConfig = async () => {
    try {
      await navigator.clipboard.writeText(previewData.value);
      message.success("配置已复制到剪贴板");
    } catch (err) {
      message.error("复制失败，请手动复制");
    }
  };

  // 清空舞台
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
        message.success("舞台已清空");
      },
    });
  };

  onUnmounted(() => {
    if (lf) {
      lf.destroy();
      lf = null;
    }
  });
</script>

<style lang="scss" scoped>
  /* 上方编辑器区域 */
  .editor-wrapper {
    flex: 1;
    position: relative;
    overflow: hidden;
  }

  .logic-flow-container {
    width: 100%;
    height: 100%;
  }

  /* 右上角工具栏面板 */
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

  /* 预览弹框内容 */
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
