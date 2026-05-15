<template>
  <div class="math-item">
    <span class="item-tag">项</span>
    <a-select
      :value="modelValue.sourceType"
      :options="source_type_options"
      @change="onSourceTypeChange"
      size="small"
      placeholder="来源类型"
      style="flex: 1;"
    />
    <a-input
      v-if="isFixedValue"
      :value="modelValue.value"
      @change="onValueChange"
      size="small"
      placeholder="请输入值"
      style="flex: 1;"
    />
    <a-select
      v-if="isDevicePoint"
      :value="modelValue.point"
      :options="pointOptions"
      @change="onPointChange"
      size="small"
      placeholder="选择设备点位"
      style="flex: 1;"
    />
    <a-select
      v-if="isField"
      :value="modelValue.field"
      :options="fieldOptions"
      @change="onFieldChange"
      size="small"
      placeholder="选择取值字段"
      style="flex: 1;"
    />
    <a-button
      type="primary"
      danger
      size="small"
      @click="emit('remove')"
      style="max-width: 100px"
    >
      删除
    </a-button>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { source_type_fixed, source_type_point, source_type_field, source_type_options } from './types'
  import type { MathItem as MathItemType } from './types'

  defineOptions({ name: 'MathItem' })

  const props = withDefaults(defineProps<{
    modelValue: MathItemType
    pointOptions?: { label: string; value: string }[]
    fieldOptions?: { label: string; value: string }[]
  }>(), {
    pointOptions: () => [],
    fieldOptions: () => [],
  })

  const emit = defineEmits<{
    (e: 'update:modelValue', val: MathItemType): void
    (e: 'remove'): void
  }>()

  const isFixedValue = computed(() => props.modelValue.sourceType === source_type_fixed)
  const isDevicePoint = computed(() => props.modelValue.sourceType === source_type_point)
  const isField = computed(() => props.modelValue.sourceType === source_type_field)

  function patch(part: Partial<MathItemType>) {
    emit('update:modelValue', { ...props.modelValue, ...part })
  }

  function onSourceTypeChange(newValue: string) {
    emit('update:modelValue', {
      ...props.modelValue,
      sourceType: newValue,
      value: undefined,
      point: undefined,
      field: undefined,
    })
  }

  function onValueChange(event: any) {
    patch({ value: event.target.value })
  }

  function onPointChange(newValue: string) {
    patch({ point: newValue })
  }

  function onFieldChange(newValue: string) {
    patch({ field: newValue })
  }
</script>

<style scoped>
  .math-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: #fff;
    border: 1px solid #e4e7ed;
    border-radius: 8px;
    transition: border-color 0.15s, box-shadow 0.15s;
  }

  .math-item:hover {
    border-color: #c7d0ff;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.08);
  }

  .item-tag {
    flex-shrink: 0;
    font-size: 12px;
    color: #909399;
    background: #f5f7fa;
    padding: 2px 8px;
    border-radius: 4px;
  }
</style>
