<template>
  <div
    class="flow-node"
    :style="{ width: nodeWidth + 'px', height: nodeHeight + 'px' }"
    :title="nodeTitle"
  >
    <div class="node-left-bar" :style="{ backgroundColor: nodeColor }"></div>

    <div class="node-icon" :style="{ backgroundColor: iconBgColor }">
      <span class="icon-text">{{ nodeIcon }}</span>
    </div>

    <div class="node-title">{{ nodeTitle }}</div>

    <div class="node-delete-btn" @click.stop="handleDelete" title="删除节点">
      ✕
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject, onMounted, onUnmounted } from "vue";
import { EventType } from "@logicflow/core";
import { vueNodesMap } from "@logicflow/vue-node-registry";
import { nodeTypes, DEFAULT_NODE_WIDTH, DEFAULT_NODE_HEIGHT } from "../menus";

const getNode = inject("getNode") as () => any;
const getGraph = inject("getGraph") as () => any;

const node = getNode();
const graph = getGraph();

const nodeData = ref(node.getData());

const nodeTitle = computed(() => {
  return (
    nodeData.value.properties?.title ||
    nodeData.value.properties?.name ||
    "未命名"
  );
});

const nodeColor = computed(() => {
  return nodeData.value.properties?.color || "#1890ff";
});

const nodeWidth = computed(() => {
  return nodeData.value.properties?.width || DEFAULT_NODE_WIDTH;
});

const nodeHeight = computed(() => {
  return nodeData.value.properties?.height || DEFAULT_NODE_HEIGHT;
});

const iconBgColor = computed(() => {
  const color = nodeColor.value;
  return `${color}1A`;
});

const nodeIcon = computed(() => {
  const type = nodeData.value.type;
  const config = nodeTypes.find((n) => n.type === type);
  return config?.icon || "?";
});

const handleDelete = () => {
  if (confirm(`确定要删除节点 "${nodeTitle.value}" 吗？`)) {
    graph.deleteNode(node.id);
  }
};

const handlePropertyChange = (eventData: any) => {
  const keys = eventData.keys as string[];
  const content = vueNodesMap[node.type];

  if (content && eventData.id === node.id) {
    const { effect } = content;
    if (!effect || keys.some((key) => effect?.includes(key))) {
      nodeData.value = node.getData();
    }
  }
};

onMounted(() => {
  graph.eventCenter.on(
    EventType.NODE_PROPERTIES_CHANGE,
    handlePropertyChange,
  );
});

onUnmounted(() => {
  graph.eventCenter.off(
    EventType.NODE_PROPERTIES_CHANGE,
    handlePropertyChange,
  );
});
</script>

<style scoped lang="scss">
.flow-node {
  display: flex;
  align-items: center;
  background: #fff;
  border: 1px solid #d9d9d9;
  padding: 0 12px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
  transition: all 0.2s;
  border-radius: 6px;
  cursor: pointer;

  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    border-color: #bfbfbf;
  }
}

.node-left-bar {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
}

.node-icon {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 4px;
  margin-right: 8px;
  flex-shrink: 0;
}

.icon-text {
  font-size: 14px;
  font-weight: 600;
  color: #262626;
}

.node-title {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  color: #262626;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.node-delete-btn {
  margin-left: 8px;
  cursor: pointer;
  color: #8c8c8c;
  padding: 4px 6px;
  border-radius: 4px;
  font-size: 12px;
  opacity: 1;
  transition: all 0.2s;

  &:hover {
    color: #ff4d4f;
    background: rgba(255, 77, 79, 0.1);
  }
}
</style>
