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
          <div class="node-circle" :style="{ backgroundColor: node.color }"></div>
          <div class="node-name">{{ node.name }}</div>
        </div>
      </div>
    </div>

    <!-- 右侧区域 -->
    <div class="right-area">
      <!-- 上方：LogicFlow 编辑器 -->
      <div class="editor-wrapper" @drop="handleDrop" @dragover.prevent>
        <div ref="containerRef" class="logic-flow-container"></div>
      </div>

      <!-- 下方：属性编辑区域 -->
      <div class="property-panel">
        <div class="property-placeholder">
          属性编辑区域（开发中）
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { message } from "ant-design-vue";
import LogicFlow from "@logicflow/core";
import "@logicflow/core/dist/index.css";

const containerRef = ref<HTMLElement>();
let lf: LogicFlow | null = null;

// SQL 节点类型定义
const nodeTypes = [
  {
    type: 'table-node',
    name: '数据表',
    color: '#1890ff',
    defaultConfig: {
      width: 180,
      height: 40,
      title: "数据表",
    }
  },
  {
    type: 'select-node',
    name: '查询字段',
    color: '#52c41a',
    defaultConfig: {
      width: 180,
      height: 40,
      title: "SELECT",
    }
  },
  {
    type: 'where-node',
    name: '条件过滤',
    color: '#fa8c16',
    defaultConfig: {
      width: 180,
      height: 40,
      title: "WHERE",
    }
  },
  {
    type: 'join-node',
    name: '表连接',
    color: '#722ed1',
    defaultConfig: {
      width: 180,
      height: 40,
      title: "JOIN",
    }
  },
  {
    type: 'order-node',
    name: '排序',
    color: '#13c2c2',
    defaultConfig: {
      width: 180,
      height: 40,
      title: "ORDER BY",
    }
  },
  {
    type: 'group-node',
    name: '分组',
    color: '#eb2f96',
    defaultConfig: {
      width: 180,
      height: 40,
      title: "GROUP BY",
    }
  },
];

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
    style: {
      baseEdge: {
        stroke: "#aaa",
      },
    },
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

onUnmounted(() => {
  if (lf) {
    lf.destroy();
    lf = null;
  }
});

// 拖拽开始
const handleDragStart = (event: DragEvent, node: any) => {
  if (event.dataTransfer) {
    event.dataTransfer.setData("application/json", JSON.stringify(node));
  }
};

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

  const newNode = {
    id: `${nodeType.type}_${Date.now()}`,
    type: "rect", // 使用内置矩形节点
    x,
    y,
    text: nodeType.defaultConfig.title,
    properties: {
      nodeName: nodeType.name,
      nodeType: nodeType.type,
      color: nodeType.color,
    },
    style: {
      stroke: nodeType.color,
      fill: "#fff",
    },
  };

  lf.addNode(newNode);
  message.success(`已添加 ${nodeType.name} 节点`);
};
</script>

<style scoped>
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

/* 下方属性编辑区域 */
.property-panel {
  height: 380px;
  background: #ff4d4f;
  border-top: 1px solid #e8e8e8;
  display: flex;
  align-items: center;
  justify-content: center;
}

.property-placeholder {
  color: #fff;
  font-size: 16px;
  font-weight: 500;
  padding: 20px 40px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
}
</style>
