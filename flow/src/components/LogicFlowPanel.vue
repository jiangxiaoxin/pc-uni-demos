<template>
  <div class="logic-flow-wrapper">
    <div ref="containerRef" class="logic-flow-container"></div>
    <TeleportContainer :flow-id="flowId" />
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted, watch } from "vue";
  import LogicFlow from "@logicflow/core";
  import { MiniMap, Menu } from "@logicflow/extension";
  import { register, getTeleport } from "@logicflow/vue-node-registry";
  import "@logicflow/core/dist/index.css";
  import "@logicflow/extension/lib/style/index.css";
  import ApproveNode from "./nodes/ApproveNode/ApproveNode.vue";
  import StartNode from "./nodes/StartNode/StartNode.vue";
  import EndNode from "./nodes/EndNode/EndNode.vue";
  import CopyNode from "./nodes/CopyNode/CopyNode.vue";
  import LogicNodeModel from "./nodes/LogicNodeModel";
  import { InteractiveEdge } from "./edges";

  //TODO 注册插件,需要吗？？
  // LogicFlow.use(MiniMap);
  // LogicFlow.use(Menu);

  // 获取 TeleportContainer 组件
  const TeleportContainer = getTeleport();

  interface Props {
    readonly?: boolean;
    initData?: any;
  }

  const props = withDefaults(defineProps<Props>(), {
    readonly: false,
    initData: () => null,
  });

  const emit = defineEmits<{
    (e: "node:click", data: any): void;
    (e: "edge:click", data: any): void;
    (e: "edge:circle-click", edgeId: string): void;
    (e: "blank:click"): void;
    (e: "graph:rendered", data: any): void;
    (e: "connection:not-allowed", msg: string): void;
  }>();

  const containerRef = ref<HTMLElement>();
  const flowId = ref("");
  let lf: LogicFlow | null = null;

  // const validateConnection = (sourceNode?: LogicFlow.NodeData, targetNode?:LogicFlow.NodeData) => {
  //   if(!sourceNode || !targetNode) {
  //     return false
  //   }
  //   if(targetNode.type == 'start-node') {
  //     return false
  //   }
  //   if(sourceNode.type == 'end-node') {
  //     return false
  //   }
  //   if(targetNode.id == sourceNode.id) {
  //     return false
  //   }
  //   return true
  // }

  // 初始化 LogicFlow
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
      isSilentMode: props.readonly,
      stopScrollGraph: false,
      stopZoomGraph: false,
      stopMoveGraph: false,
      adjustEdge: true, // 不允许拖动边，边是跟着节点的拖动自动改变的
      adjustEdgeStartAndEnd: true, // 虽然上面不让拖动边，但允许拖动改变边的开始和结束连接点
      adjustNodePosition: true,
      hideAnchors: props.readonly,
      hoverOutline: !props.readonly,
      nodeSelectedOutline: !props.readonly,
      snapline: true,
      plugins: [MiniMap, Menu],
      nodeTextEdit: false,
      edgeTextEdit: false,
      edgeType: "polyline", // 边连接的样式，polyline 折线。line 直线
      style: {
        baseEdge: {
          // strokeDasharray: '5 5', // 定义全局的边都是灰色的虚线
          stroke: "#aaa",
        },
      },
    });

    // 注册自定义 Vue 节点
    register(
      {
        type: "my-logic-node",
        component: ApproveNode,
        model: LogicNodeModel,
      },
      lf,
    );

    register(
      {
        type: "start-node",
        component: StartNode,
        model: LogicNodeModel, // !!!使用vue组件做view，自定义model 做model，这个model 继承自 VueNodeModel
      },
      lf,
    );

    register(
      {
        type: "end-node",
        component: EndNode,
        model: LogicNodeModel,
      },
      lf,
    );

    register(
      {
        type: "copy-node",
        component: CopyNode,
        model: LogicNodeModel,
      },
      lf,
    );

    // 注册自定义交互边
    lf.register(InteractiveEdge);
    // 设置默认边类型为交互边
    // lf.setDefaultEdgeType('interactive-edge');

    // 监听圆点点击事件（由 InteractiveEdge 通过 eventCenter 触发）
    lf.on("edge:circle-click", ({ data }: any) => {
      if (data && data.id) {
        emit("edge:circle-click", data.id);
      }
    });

    // 获取 flowId 用于 TeleportContainer
    lf.on("graph:rendered", ({ graphModel }) => {
      flowId.value = graphModel.flowId!;
      emit("graph:rendered", { graphModel });
    });

    lf.on("connection:not-allowed", (data) => {
      // console.log(data);
      emit("connection:not-allowed", data.msg);
    });

    // 节点click事件监听。 edge 有单独的 edge:click
    lf.on("node:click", ({ data }) => {
      console.log("🚀 ~ LogicFlowPanel.vue:137 ~ data:", data);

      const nodeModel = lf?.getNodeModelById(data.id);
      console.log("🚀 ~ LogicFlowPanel.vue:142 ~ nodeModel:", nodeModel);

      const edges = nodeModel?.graphModel.getNodeEdges(data.id);
      console.log("🚀 ~ LogicFlowPanel.vue:144 ~ edges:", edges);

      emit("node:click", data);
    });

    lf.on("blank:click", () => {
      emit("blank:click");
    });

    // 边点击事件
    lf.on("edge:click", ({ data }) => {
      emit("edge:click", data);
    });

    // lf.on("edge:add", (edgeData) => {
    //   // 使用这种add以后再根据判断删除的方式屏蔽了不能加edge的情况
    //   // 但最好的实现应该是定义什么时候可以add edge，在自定义node 里设置 rules
    // // console.log("🚀 ~ LogicFlowPanel.vue:123 ~ a,b,c:", edgeData)
    //   const {sourceNodeId, targetNodeId, id: edgeId} = edgeData.data
    //   const sourceNodeData = lf?.getNodeDataById(sourceNodeId)

    //   const targetNodeData = lf?.getNodeDataById(targetNodeId)

    //   const canConnect = validateConnection(sourceNodeData, targetNodeData)
    //   if(!canConnect) {
    //     lf?.deleteEdge(edgeId)
    //   }

    // })

    // 如果有初始数据，渲染
    if (props.initData) {
      lf.render(props.initData);
    } else {
      lf.render({});
    }

    window.addEventListener("click", (e) => {
      console.log("eeee", e);
    });
  });

  // 监听 initData 变化
  watch(
    () => props.initData,
    (newData) => {
      if (lf && newData) {
        lf.render(newData);
      }
    },
    { deep: true },
  );

  onUnmounted(() => {
    if (lf) {
      lf.destroy(); // !!! 这里会销毁所有的事件监听，所以不需要自己手动off 事件了
      lf = null;
    }
  });

  // 暴露方法
  defineExpose({
    getData: () => lf?.getGraphData(),
    setData: (data: any) => lf?.render(data),
    zoomIn: () => lf?.zoom(true),
    zoomOut: () => lf?.zoom(false),
    fitView: () => lf?.fitView(),
    resetZoom: () => lf?.resetZoom(),
    undo: () => lf?.undo(),
    redo: () => lf?.redo(),
    addNode: (nodeConfig: any) => lf?.addNode(nodeConfig),
    deleteNode: (nodeId: string) => lf?.deleteNode(nodeId),
    deleteEdge: (edgeId: string) => lf?.deleteEdge(edgeId),
    lf: () => lf,
  });
</script>

<style scoped>
  .logic-flow-wrapper {
    width: 100%;
    height: 100%;
    position: relative;
  }

  .logic-flow-container {
    width: 100%;
    height: 100%;
  }
</style>
