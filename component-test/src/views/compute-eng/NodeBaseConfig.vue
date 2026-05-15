<template>
  <div class="config-section">
    <div class="section-title">节点配置</div>
    <div class="info-row">
      <span class="label">ID：</span>
      <span class="value">{{ nodeId || "未选择" }}</span>
    </div>
    <div class="info-row">
      <span class="label">类型：</span>
      <span class="value">{{ nodeTypeName }}</span>
    </div>
    <div class="info-row">
      <span class="label">标题：</span>
      <a-input
        v-model:value="titleValue"
        placeholder="请输入节点标题"
        size="small"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'

  const props = defineProps<{
    nodeId: string
    nodeTypeName: string
    title: string
  }>()

  const emit = defineEmits<{
    (e: 'update:title', title: string): void
  }>()

  const titleValue = computed({
    get: () => props.title,
    set: (val) => emit('update:title', val),
  })
</script>

<style scoped lang="scss">
  .config-section {
    margin-top: 16px;
    padding: 12px;
    background: #f5f5f5;
    border-radius: 6px;

    .section-title {
      font-size: 13px;
      font-weight: 600;
      color: #262626;
      margin-bottom: 10px;
      padding-bottom: 8px;
      border-bottom: 1px solid #e8e8e8;
    }
  }

  .info-row {
    display: flex;
    align-items: center;
    margin-bottom: 6px;
    font-size: 14px;
    min-height: 24px;

    :deep(.ant-input) {
      flex: 1;
    }
  }

  .label {
    color: #666;
    flex-shrink: 0;
    margin-right: 8px;
    width: 120px;
  }

  .value {
    color: #262626;
    font-weight: 500;
    flex: 1;
  }
</style>
