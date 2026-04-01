<template>
  <div class="flow-editor">
    <!-- 工具栏 -->
    <div class="toolbar">
      <a-space>
        <a-button @click="handleZoomIn">
          <template #icon><zoom-in-outlined /></template>
          放大
        </a-button>
        <a-button @click="handleZoomOut">
          <template #icon><zoom-out-outlined /></template>
          缩小
        </a-button>
        <a-button @click="handleFitView">
          <template #icon><fullscreen-outlined /></template>
          适应屏幕
        </a-button>
        <a-button @click="handleReset">
          <template #icon><reload-outlined /></template>
          重置
        </a-button>
        <a-divider type="vertical" />
        <a-button @click="handleUndo">
          <template #icon><undo-outlined /></template>
          撤销
        </a-button>
        <a-button @click="handleRedo">
          <template #icon><redo-outlined /></template>
          重做
        </a-button>
        <a-divider type="vertical" />
        <a-button type="primary" @click="handleSave">
          <template #icon><save-outlined /></template>
          保存
        </a-button>
        <a-button @click="handleLoad">
          <template #icon><upload-outlined /></template>
          加载
        </a-button>
        <a-button @click="handleClear">
          <template #icon><delete-outlined /></template>
          清空
        </a-button>
        <a-divider type="vertical" />
        <a-button @click="handlePreview">
          <template #icon><eye-outlined /></template>
          预览
        </a-button>
      </a-space>
    </div>

    <div class="main-content">
      <!-- 左侧节点面板 -->
      <div class="node-panel">
        <div class="node-list">
          <div
            v-for="node in nodeTypes"
            :key="node.type"
            class="node-item"
            draggable="true"
            @dragstart="handleDragStart($event, node)"
          >
            <div class="node-preview custom-node-preview">
              <div
                class="custom-node-left-bar"
                :style="{ backgroundColor: node.color }"
              ></div>
              <div class="custom-node-content">
                <div>
                  <!-- @vue-ignore -->
                  <component :is="iconMap[node.defaultConfig.icon]" />
                </div>
                <div class="custom-node-info">
                  <div class="custom-node-title">
                    {{ node.defaultConfig.title }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 中间画布 -->
      <div class="canvas-wrapper" @drop="handleDrop" @dragover.prevent>
        <LogicFlowPanel
          ref="lfPanelRef"
          @node:click="handleNodeClick"
          @edge:click="handleEdgeClick"
          @edge:circle-click="handleEdgeCircleClick"
          @blank:click="handleBlankClick"
        />
      </div>

      <!-- 右侧属性面板 -->
      <div class="property-panel">
        <a-tabs v-model:activeKey="activeTabKey" type="card" size="small">
          <!-- Tab 1: 流程配置 -->
          <a-tab-pane key="flow" tab="流程配置">
            <div class="tab-content">
              <a-form layout="vertical">
                <a-form-item label="流程名称">
                  <a-input
                    v-model:value="flowName"
                    placeholder="请输入流程名称"
                    @change="handleFlowNameChange"
                  />
                </a-form-item>


              </a-form>
            </div>
          </a-tab-pane>

          <!-- Tab 2: 元素属性 -->
          <a-tab-pane key="element" tab="元素属性">
            <div class="tab-content">
              <!-- 节点属性 -->
              <div v-if="selectedNode" class="node-properties">
                <a-form layout="vertical">
                  <a-form-item label="节点ID">
                    <a-input v-model:value="selectedNode.id" disabled />
                  </a-form-item>
                  <a-form-item label="节点类型">
                    <a-input v-model:value="selectedNode.type" disabled />
                  </a-form-item>
                  <a-form-item label="节点标题">
                    <a-input
                      v-model:value="selectedNode.properties.title"
                      @change="updateNodeProperties"
                    />
                  </a-form-item>

                  <a-form-item v-if="!isStartOrEndNode">
                    <a-button type="primary" danger @click="handleDeleteNode">
                      删除节点
                    </a-button>
                  </a-form-item>
                </a-form>
              </div>

              <!-- 边属性 -->
              <div v-else-if="selectedEdge" class="edge-properties">
                <a-form layout="vertical">
                  <a-form-item label="边ID">
                    <a-input v-model:value="selectedEdge.id" disabled />
                  </a-form-item>
                  <a-form-item label="边类型">
                    <a-input v-model:value="selectedEdge.type" disabled />
                  </a-form-item>
                  <a-form-item label="源节点ID">
                    <a-input v-model:value="selectedEdge.sourceNodeId" disabled />
                  </a-form-item>
                  <a-form-item label="目标节点ID">
                    <a-input v-model:value="selectedEdge.targetNodeId" disabled />
                  </a-form-item>

                  <a-form-item>
                    <a-button type="primary" danger @click="handleDeleteEdge">
                      删除边
                    </a-button>
                  </a-form-item>
                </a-form>
              </div>

              <a-empty v-else description="请选择节点或边" />
            </div>
          </a-tab-pane>
        </a-tabs>
      </div>
    </div>

    <!-- 预览配置弹框 -->
    <a-modal
      v-model:open="previewModalVisible"
      title="流程配置预览"
      width="800px"
      :footer="null"
    >
      <div class="preview-modal-content">
        <a-alert
          message="以下是当前流程图的完整配置数据"
          type="info"
          show-icon
          style="margin-bottom: 16px"
        />
        <pre class="preview-data">{{ previewModalData }}</pre>
      </div>
    </a-modal>

    <!-- 边操作弹框 -->
    <a-modal
      v-model:open="edgeActionModalVisible"
      title="边操作"
      width="300px"
      :footer="null"
      centered
    >
      <div class="edge-action-content">
        <p style="margin-bottom: 16px; color: #666;">当前边ID: {{ currentEdgeId }}</p>
        <a-space direction="vertical" style="width: 100%">
          <a-button type="primary" block @click="handleHelloClick">
            Hello
          </a-button>
          <a-button type="default" block @click="handleByeClick">
            Bye
          </a-button>
        </a-space>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from "vue";
  import { message } from "ant-design-vue";
  import {
    ZoomInOutlined,
    ZoomOutOutlined,
    FullscreenOutlined,
    ReloadOutlined,
    UndoOutlined,
    RedoOutlined,
    SaveOutlined,
    UploadOutlined,
    DeleteOutlined,
    EyeOutlined,
  } from "@ant-design/icons-vue";
  import LogicFlowPanel from "../components/LogicFlowPanel.vue";
  import NodeIcon from "../components/nodes/NodeIcon.vue";
  import StartNodeIcon from "../components/nodes/StartNode/StartNodeIcon.vue";
import EndNodeIcon from "../components/nodes/EndNode/EndNodeIcon.vue";

  const iconMap = {
    'start-node': StartNodeIcon,
    'my-logic-node': NodeIcon,
    'end-node': EndNodeIcon
  }

  const lfPanelRef = ref<InstanceType<typeof LogicFlowPanel>>();
  const selectedNode = ref<any>(null);
  const selectedEdge = ref<any>(null);

  // Tab 相关
  const activeTabKey = ref('flow'); // 默认显示流程配置tab
  const flowName = ref('未命名流程');
  const FLOW_NAME_KEY = 'flow_name';

  // 预览弹框状态
  const previewModalVisible = ref(false);
  const previewModalData = ref("");

  // 边操作弹框状态
  const edgeActionModalVisible = ref(false);
  const currentEdgeId = ref("");

  // 节点类型定义
  const nodeTypes = [
    {
      type: 'start-node',
      color: 'rgb(78, 184, 92)',
      defaultConfig: {
        width: 180,
        height: 40,
        title: "开始节点",
        icon: 'start-node',
        hoverOutlineColor: 'rgb(78, 184, 92)'
      }
    },
    {
      type: 'end-node',
      color: 'rgb(144, 155, 171)',
      defaultConfig: {
        width: 180,
        height: 40,
        title: "结束节点",
        icon: 'end-node',
        hoverOutlineColor: 'rgb(144, 155, 171)'
      }
    },
    {
      type: "my-logic-node",
      color: "#1890ff", // 左侧节点栏内的颜色，需要跟画布中的保持一致
      defaultConfig: {
        width: 180,
        height: 40,
        title: "流程节点",
        icon: 'my-logic-node',
        hoverOutlineColor: "#1890ff",
      },
    },
    
  ];

  // 当前流程图数据
  const graphData = computed(() => {
    const data = lfPanelRef.value?.getData();
    return data ? JSON.stringify(data, null, 2) : "{}";
  });

  // 判断当前选中节点是否为开始或结束节点
  const isStartOrEndNode = computed(() => {
    if (!selectedNode.value) return false;
    return selectedNode.value.type === 'start-node' || selectedNode.value.type === 'end-node';
  });

  // 缩放控制
  const handleZoomIn = () => lfPanelRef.value?.zoomIn();
  const handleZoomOut = () => lfPanelRef.value?.zoomOut();
  const handleFitView = () => lfPanelRef.value?.fitView();
  const handleReset = () => lfPanelRef.value?.resetZoom();

  // 撤销重做
  const handleUndo = () => lfPanelRef.value?.undo();
  const handleRedo = () => lfPanelRef.value?.redo();

  // 节点点击
  const handleNodeClick = (data: any) => {
    selectedNode.value = data;
    selectedEdge.value = null;
    activeTabKey.value = 'element'; // 自动切换到元素属性tab
  };

  // 边点击
  const handleEdgeClick = (data: any) => {
    selectedEdge.value = data;
    selectedNode.value = null;
    activeTabKey.value = 'element'; // 自动切换到元素属性tab
  };



  // 空白处点击
  const handleBlankClick = () => {
    selectedNode.value = null;
    selectedEdge.value = null;
  };

  // 更新节点属性
  const updateNodeProperties = () => {
    const lf = lfPanelRef.value?.lf();
    if (lf && selectedNode.value) {
      const node = lf.getNodeModelById(selectedNode.value.id);
      if (node) {
        Object.keys(selectedNode.value.properties).forEach((key) => {
          node.setProperty(key, selectedNode.value.properties[key]);
        });
      }
    }
  };

  // 删除节点
  const handleDeleteNode = () => {
    // 判断下节点类型，如果是开始节点，或者结束节点，不允许删除
    if (selectedNode.value.type === 'start-node' || selectedNode.value.type === 'end-node') {
      message.error("开始节点和结束节点不能删除");
      return;
    }
    if (selectedNode.value) {
      lfPanelRef.value?.deleteNode(selectedNode.value.id);
      selectedNode.value = null;
      message.success("节点已删除");
    }
  };

  // 删除边
  const handleDeleteEdge = () => {
    if (selectedEdge.value) {
      lfPanelRef.value?.deleteEdge(selectedEdge.value.id);
      selectedEdge.value = null;
      message.success("边已删除");
    }
  };

  // 拖拽添加节点
  const handleDragStart = (event: DragEvent, node: any) => {
    if (event.dataTransfer) {
      event.dataTransfer.setData("application/json", JSON.stringify(node));
    }
  };

  const handleDrop = (event: DragEvent) => {
    event.preventDefault();
    const data = event.dataTransfer?.getData("application/json");
    if (!data) return;

    const nodeType = JSON.parse(data);
    console.log("🚀 ~ FlowEditor.vue:388 ~ handleDrop ~ nodeType:", nodeType)
    if(nodeType.type == 'start-node' || nodeType.type == 'end-node'){

      const graphData = lfPanelRef.value?.getData();
      console.log("🚀 ~ FlowEditor.vue:392 ~ handleDrop ~ graphData:", graphData)
      const {nodes = []} = graphData as any
      const exist = nodes.some(node => node.type == nodeType.type)
      if(exist) {
        message.warn("开始和结束节点只能添加一次");
        return
      }
    }

    /**
     *  // TODO 
     * 先判断下节点的类型，如果是开始或者结束，并且画布中已经有了，则不允许添加
     * 简单点做，开始和结束在创建流程时默认就有了，并且不可以删除,这样就省去这里的判断了
     * 
     * TODO 如何获取画布上的节点？根据类型获取？根据id获取
     */

    const container = event.currentTarget as HTMLElement;
    const rect = container.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    
    const newNode = {
      id: `node_${Date.now()}`, // TODO id 的计算
      type: nodeType.type,
      x,
      y,
      properties: {
        ...nodeType.defaultConfig, // 因为都是自定义节点，所以直接解构 defaultConfig
      },
    };

    lfPanelRef.value?.addNode(newNode);
    message.success("节点已添加");
  };

  // 流程名称变更
  const handleFlowNameChange = () => {
    localStorage.setItem(FLOW_NAME_KEY, flowName.value);
  };

  // 预览配置
  const handlePreview = () => {
    const data = lfPanelRef.value?.getData();
    if (data) {
      const previewData = {
        ...data,
        flowName: flowName.value,
      };
      previewModalData.value = JSON.stringify(previewData, null, 2);
      previewModalVisible.value = true;
    }
  };

  // 边圆点点击
  const handleEdgeCircleClick = (edgeId: string) => {
    currentEdgeId.value = edgeId;
    edgeActionModalVisible.value = true;
  };

  // Hello 按钮点击
  const handleHelloClick = () => {
    message.success(`Hello! 当前边ID: ${currentEdgeId.value}`);
    edgeActionModalVisible.value = false;
  };

  // Bye 按钮点击
  const handleByeClick = () => {
    message.info(`Bye! 当前边ID: ${currentEdgeId.value}`);
    edgeActionModalVisible.value = false;
  };

  // 保存数据
  const handleSave = () => {
    const data = lfPanelRef.value?.getData();

    if (data) {
      // 保存流程数据时同时保存流程名称
      const saveData = {
        ...data,
        flowName: flowName.value,
      };
      localStorage.setItem("flowData", JSON.stringify(saveData));
      message.success("流程图已保存");
    }
  };

  // 加载数据
  const handleLoad = () => {
    const saved = localStorage.getItem("flowData");
    if (saved) {
      const parsedData = JSON.parse(saved);
      // 恢复流程名称
      if (parsedData.flowName) {
        flowName.value = parsedData.flowName;
      }
      lfPanelRef.value?.setData(parsedData);
      message.success("流程图已加载");
    } else {
      // 尝试单独加载流程名称
      const savedName = localStorage.getItem(FLOW_NAME_KEY);
      if (savedName) {
        flowName.value = savedName;
      }
      message.warning("没有保存的数据");
    }
  };

  // 清空画布
  const handleClear = () => {
    lfPanelRef.value?.setData({ nodes: [], edges: [] });
    selectedNode.value = null;
    message.success("画布已清空");
  };
</script>

<style scoped>
  .flow-editor {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .toolbar {
    padding: 12px 16px;
    background: #fff;
    border-bottom: 1px solid #e8e8e8;
  }

  .main-content {
    display: flex;
    flex: 1;
    overflow: hidden;
  }

  .node-panel {
    width: 200px;
    padding: 16px;
    border-right: 1px solid #e8e8e8;
  }

  .node-list {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 12px;
  }

  .node-item {
    cursor: move;
  }

  /* 节点预览样式 */
  .custom-node-preview {
    display: flex;
    align-items: center;
    background: #fff;
    border: 1px solid #d9d9d9;
    border-radius: 8px;
    padding: 0 12px;
    position: relative;
    overflow: hidden;
    height: 40px;
  }

  .custom-node-preview:hover {
    transform: scale(1.02);
  }

  .custom-node-left-bar {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    border-radius: 8px 0 0 8px;
  }

  .custom-node-content {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-left: 4px;
  }

  .custom-node-icon {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: rgba(24, 144, 255, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    flex-shrink: 0;
  }

  .custom-node-title {
    font-size: 13px;
    font-weight: 500;
    color: #262626;
    line-height: 1.4;
  }

  .custom-node-desc {
    font-size: 11px;
    color: #8c8c8c;
    line-height: 1.3;
  }

  .canvas-wrapper {
    flex: 1;
    position: relative;
  }

  .property-panel {
    width: 320px;
    background: white;
    border-left: 1px solid #e8e8e8;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
  }

  .property-panel :deep(.ant-tabs) {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .property-panel :deep(.ant-tabs-content) {
    flex: 1;
    overflow-y: auto;
  }

  .property-panel :deep(.ant-tabs-nav) {
    margin-bottom: 0;
    /* background: #fff; */
    /* padding: 8px 8px 0 8px; */
  }

  .tab-content {
    padding: 16px 0;
  }

  .section-title {
    font-size: 13px;
    font-weight: 500;
    color: #262626;
    margin-bottom: 12px;
  }

  .data-preview {
    max-height: 400px;
    overflow: auto;
    font-size: 12px;
    background: #f5f5f5;
    padding: 8px;
    border-radius: 4px;
  }

  .preview-modal-content .preview-data {
    max-height: 500px;
    overflow: auto;
    font-size: 12px;
    background: #f5f5f5;
    padding: 16px;
    border-radius: 4px;
    border: 1px solid #e8e8e8;
  }
</style>
