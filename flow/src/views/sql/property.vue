<template>
  <div class="property-panel" :class="{ 'property-panel--visible': visible }">
    <template v-if="visible && nodeData">
      <div class="property-top">
        <component :is="nodeIconComponent" class="property-node-icon" />
        <div class="property-node-type">{{ nodeTypeLabel }}</div>
        <a-input
          v-model:value="editableName"
          class="property-node-input"
          :bordered="false"
          placeholder="请输入节点名称"
          @pressEnter="handleSubmitName"
        />
      </div>

      <div class="property-bottom">
        <div class="property-row">
          <span class="property-label">节点 ID</span>
          <span class="property-value">{{ nodeData.id }}</span>
        </div>
        <div class="property-row">
          <span class="property-label">节点类型</span>
          <span class="property-value">{{ nodeData.type }}</span>
        </div>
        <div class="property-row">
          <span class="property-label">颜色</span>
          <span class="property-value">{{ nodeColor }}</span>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from "vue";
  import { getNodeTypeConfig } from "./menus";
  import { defaultSqlNodeIcon, sqlNodeIconMap } from "./nodes/iconMap";

  interface SqlNodeData {
    id: string;
    type: string;
    properties?: Record<string, unknown>;
  }

  const emit = defineEmits<{
    (e: "submit-name", name: string): void;
  }>();

  const props = withDefaults(
    defineProps<{
      visible?: boolean;
      nodeData?: SqlNodeData | null;
    }>(),
    {
      visible: false,
      nodeData: null,
    },
  );

  const editableName = ref("");

  const nodeConfig = computed(() => {
    if (!props.nodeData) return undefined;
    return getNodeTypeConfig(props.nodeData.type);
  });

  const nodeLabel = computed(() => {
    if (!props.nodeData) return "";
    return (
      String(props.nodeData.properties?.title || "") ||
      String(props.nodeData.properties?.name || "") ||
      nodeConfig.value?.name ||
      props.nodeData.type
    );
  });

  const nodeTypeLabel = computed(() => {
    return nodeConfig.value?.name || props.nodeData?.type || "";
  });

  const nodeColor = computed(() => {
    if (props.nodeData?.properties?.color) {
      return String(props.nodeData.properties.color);
    }
    return nodeConfig.value?.color || "#0369A1";
  });

  const nodeIconComponent = computed(() => {
    return sqlNodeIconMap[props.nodeData?.type || ""] || defaultSqlNodeIcon;
  });

  watch(
    () => [props.visible, nodeLabel.value, props.nodeData?.id],
    () => {
      editableName.value = nodeLabel.value;
    },
    { immediate: true },
  );

  const handleSubmitName = () => {
    const nextName = editableName.value.trim();
    if (!nextName || nextName === nodeLabel.value) {
      editableName.value = nodeLabel.value;
      return;
    }
    emit("submit-name", nextName);
  };
</script>

<style lang="scss" scoped>
  .property-panel {
    width: 100% !important;
    height: 0;
    overflow: hidden;
    background: #ffffff;
    border-top: 0 solid #e8e8e8;
    box-sizing: border-box;
    transition:
      height 0.24s ease,
      border-top-width 0.24s ease,
      padding 0.24s ease;
    padding: 0 20px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
  }

  .property-panel--visible {
    height: 400px;
    border-top-width: 1px;
    padding: 16px 20px;
  }

  .property-top {
    height: 40px;
    min-height: 40px;
    display: flex;
    align-items: center;
    gap: 12px;
    padding-bottom: 12px;
    border-bottom: 1px solid #e5e7eb;
  }

  .property-node-icon {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
    color: v-bind(nodeColor);
  }

  .property-node-type {
    flex-shrink: 0;
    font-size: 13px;
    line-height: 20px;
    font-weight: 600;
    color: #334155;
    white-space: nowrap;
  }

  .property-node-input {
    flex: 1;
    min-width: 0;
    height: 32px;
    padding: 0 10px;
    border: 1px solid #dbe2ea;
    border-radius: 8px;
    background: #f8fafc;

    :deep(.ant-input) {
      height: 30px;
      padding: 0;
      font-size: 14px;
      font-weight: 500;
      color: #0f172a;
      background: transparent;
    }
  }

  .property-bottom {
    flex: 1;
    min-height: 0;
    padding-top: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    overflow: auto;
  }

  .property-row {
    display: grid;
    grid-template-columns: 88px 1fr;
    gap: 12px;
    align-items: start;
    padding: 10px 12px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
  }

  .property-label {
    font-size: 12px;
    font-weight: 600;
    color: #64748b;
  }

  .property-value {
    font-size: 13px;
    color: #0f172a;
    word-break: break-all;
  }
</style>
