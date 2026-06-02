<template>
  <div
    class="task-node"
    :class="{ 'task-node--meta': showMeta }"
    :style="{ width: nodeWidth + 'px', height: nodeHeight + 'px' }"
    :title="nodeTitle"
  >
    <div class="node-top-bar" :style="{ backgroundColor: nodeColor }"></div>

    <div class="node-content">
      <div class="node-icon" :style="{ backgroundColor: iconBgColor }">
        <span class="icon-text">{{ nodeIcon }}</span>
      </div>

      <div class="node-title">{{ nodeTitle }}</div>

      <div v-if="showMeta" class="node-meta">
        <div>标题长度：{{ nodeTitleLength }}</div>
        <div>节点ID：{{ nodeId }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject, onMounted, onUnmounted } from "vue";
import { EventType } from "@logicflow/core";
import { vueNodesMap } from "@logicflow/vue-node-registry";

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
  return nodeData.value.properties?.color || "#fa8c16";
});

const nodeWidth = computed(() => {
  return nodeData.value.properties?.width || 260;
});

const nodeHeight = computed(() => {
  return nodeData.value.properties?.height || 64;
});

const iconBgColor = computed(() => {
  const color = nodeColor.value;
  return `${color}1A`;
});

const nodeIcon = computed(() => {
  return nodeData.value.properties?.icon || "📋";
});

const showMeta = computed(() => {
  return Boolean(nodeData.value.properties?.showTaskMeta);
});

const nodeId = computed(() => {
  return nodeData.value.id || node.id;
});

const nodeTitleLength = computed(() => {
  return nodeTitle.value.length;
});

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
.task-node {
  display: flex;
  flex-direction: column;
  background: #fff;
  border: 1px solid #d9d9d9;
  position: relative;
  overflow: hidden;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.2s;
  border-radius: 8px;
  cursor: pointer;

  &:hover {
    box-shadow: 0 5px 12px rgba(0, 0, 0, 0.12);
    border-color: #bfbfbf;
  }
}

.node-top-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
}

.node-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px 10px 6px;
}

.node-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon-text {
  font-size: 16px;
  font-weight: 600;
  color: #262626;
}

.node-title {
  font-size: 13px;
  font-weight: 500;
  color: #262626;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 90%;
}

.node-meta {
  width: 100%;
  max-width: 100%;
  font-size: 13px;
  line-height: 1.4;
  color: #667085;
  text-align: center;

  div {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.task-node--meta {
  .node-content {
    gap: 4px;
  }

  .node-title {
    max-width: 100%;
  }
}
</style>
