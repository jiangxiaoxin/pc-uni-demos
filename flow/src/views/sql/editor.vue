<template>
  <div class="editor-wrapper" @drop="handleDrop" @dragover.prevent>
    <div ref="containerRef" class="logic-flow-container"></div>
    <TeleportContainer :flow-id="flowId" />
  </div>
</template>

<script setup lang="ts">
  import LogicFlow from "@logicflow/core";
  import "@logicflow/core/dist/index.css";
  import { onMounted, onUnmounted, ref } from "vue";
  import { message } from "ant-design-vue";
  import { register, getTeleport } from "@logicflow/vue-node-registry";
  import SqlNode from "./nodes/SqlNode.vue";
  import SqlNodeModel from "./nodes/SqlNodeModel";
  import { nodeTypes } from "./menus";

  // 获取 TeleportContainer 组件
  const TeleportContainer = getTeleport();

  let lf: LogicFlow | null = null;
  const containerRef = ref<HTMLElement>();
  const flowId = ref("");

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
      keyboard: {
        enabled: true,
      },
      style: {
        baseEdge: {
          stroke: "#aaa",
        },
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
        lf
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

    // 渲染空数据
    lf.render({});
  });

  // 拖拽放置
  const handleDrop = (event: DragEvent) => {
    event.preventDefault();
    const data = event.dataTransfer?.getData("application/json");
    if (!data || !lf) return;

    const nodeType = JSON.parse(data);
    const container = containerRef.value;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // 使用自定义节点类型
    const newNode = {
      id: `${nodeType.type}_${Date.now()}`,
      type: nodeType.type, // 使用实际的节点类型，而非 "rect"
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
</style>
