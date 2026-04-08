<template>
  <div class="property-panel" :class="{ 'property-panel--visible': visible }">
    <template v-if="visible && nodeData">
      <div class="property-header">
        <div>
          <div class="property-title">节点属性</div>
          <div class="property-subtitle">{{ nodeLabel }}</div>
        </div>
        <div class="property-type">{{ nodeData.type }}</div>
      </div>

      <div class="property-body">
        <div class="property-row">
          <span class="property-label">节点 ID</span>
          <span class="property-value">{{ nodeData.id }}</span>
        </div>
        <div class="property-row">
          <span class="property-label">标题</span>
          <span class="property-value">{{ nodeLabel }}</span>
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
  import { computed } from "vue";

  interface SqlNodeData {
    id: string;
    type: string;
    properties?: Record<string, unknown>;
  }

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

  const nodeLabel = computed(() => {
    if (!props.nodeData) return "";
    return (
      String(props.nodeData.properties?.title || "") ||
      String(props.nodeData.properties?.name || "") ||
      props.nodeData.type
    );
  });

  const nodeColor = computed(() => {
    if (!props.nodeData?.properties?.color) return "-";
    return String(props.nodeData.properties.color);
  });
</script>

<style lang="scss" scoped>
  .property-panel {
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
  }

  .property-panel--visible {
    height: 400px;
    border-top-width: 1px;
    padding: 16px 20px;
  }

  .property-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 18px;
  }

  .property-title {
    font-size: 16px;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 6px;
  }

  .property-subtitle {
    font-size: 13px;
    color: #6b7280;
  }

  .property-type {
    padding: 4px 10px;
    border-radius: 999px;
    background: #e0f2fe;
    color: #0369a1;
    font-size: 12px;
    font-weight: 600;
  }

  .property-body {
    display: grid;
    gap: 12px;
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
