<template>
  <div class="direct-config">
    <a-select
      :value="modelValue.sourceType"
      :options="source_type_options"
      @change="onSourceTypeChange"
      size="small"
      placeholder="来源类型"
    />

    <!-- 固定值 -->
    <template v-if="isFixedValue">
      <a-select
        :value="modelValue.valueType"
        :options="value_type_options"
        @change="onValueTypeChange"
        size="small"
        placeholder="值类型"
      />
      <a-input-number
        v-if="modelValue.valueType === value_type_number"
        :value="modelValue.value"
        @change="onValueChange"
        :controls="false"
        size="small"
        placeholder="请输入数值"
      />
      <a-select
        v-else-if="modelValue.valueType === value_type_boolean"
        :value="booleanSelectValue"
        :options="bool_options"
        @change="onBooleanValueChange"
        size="small"
        placeholder="请选择"
      />
      <a-input
        v-else
        :value="modelValue.value"
        @change="onInputValueChange"
        size="small"
        placeholder="请输入值"
      />
    </template>

    <!-- 设备点位 -->
    <a-tree-select
      v-if="isDevicePoint"
      :value="modelValue.point"
      :tree-data="pointTreeData"
      :loading="pointTreeLoading"
      tree-default-expand-all
      allow-clear
      @change="onPointChange"
      size="small"
      placeholder="选择设备点位"
    />

    <!-- 取值字段 -->
    <a-select
      v-if="isField"
      :value="fieldSelectValue"
      :options="fieldOptions"
      @change="onFieldChange"
      size="small"
      placeholder="选择节点或聚合定义"
    />
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import {
    source_type_fixed,
    source_type_point,
    source_type_field,
    source_type_options,
    value_type_number,
    value_type_boolean,
    value_type_options,
  } from './types'
  import { bool_options, fromBooleanSelectValue, toBooleanSelectValue } from '../condition/types'
  import type { PointTreeNode } from '../condition/types'
  import type { DirectSourceConfig } from './types'

  type FieldSelection =
    | { type: 'node'; id: string }
    | { type: 'aggregate'; lifecycleId: string; aggregateId: string }

  interface FieldOption {
    label: string
    value: string
  }

  interface FieldOptionGroup {
    label: string
    options: FieldOption[]
  }

  const props = withDefaults(
    defineProps<{
      modelValue: DirectSourceConfig
      pointTreeData?: PointTreeNode[]
      pointTreeLoading?: boolean
      fieldOptions?: FieldOptionGroup[]
    }>(),
    {
      modelValue: () => ({ sourceType: source_type_fixed }) as DirectSourceConfig,
      pointTreeData: () => [],
      pointTreeLoading: false,
      fieldOptions: () => [],
    },
  )

  const emit = defineEmits<{
    (e: 'update:modelValue', val: DirectSourceConfig): void
  }>()

  const isFixedValue = computed(() => props.modelValue.sourceType === source_type_fixed)
  const isDevicePoint = computed(() => props.modelValue.sourceType === source_type_point)
  const isField = computed(() => props.modelValue.sourceType === source_type_field)
  const booleanSelectValue = computed(() => toBooleanSelectValue(props.modelValue.value))
  const fieldSelectValue = computed(() => {
    if (props.modelValue.lifecycleId && props.modelValue.aggregateId) {
      return encodeFieldSelection({
        type: 'aggregate',
        lifecycleId: props.modelValue.lifecycleId,
        aggregateId: props.modelValue.aggregateId,
      })
    }

    if (props.modelValue.field) {
      return encodeFieldSelection({ type: 'node', id: props.modelValue.field })
    }

    return undefined
  })

  function encodeFieldSelection(selection: FieldSelection) {
    return JSON.stringify(selection)
  }

  function parseFieldSelection(value: string): FieldSelection | null {
    if (!value) {
      return null
    }

    try {
      const parsed = JSON.parse(value) as Partial<FieldSelection> & {
        id?: string
      }
      if (parsed.type === 'node' && parsed.id) {
        return {
          type: 'node',
          id: String(parsed.id),
        }
      }
      if (parsed.type === 'aggregate' && parsed.lifecycleId && parsed.aggregateId) {
        return {
          type: 'aggregate',
          lifecycleId: String(parsed.lifecycleId),
          aggregateId: String(parsed.aggregateId),
        }
      }
    } catch {
      return {
        type: 'node',
        id: value,
      }
    }

    return null
  }

  function patch(part: Partial<DirectSourceConfig>) {
    emit('update:modelValue', { ...props.modelValue, ...part })
  }

  function onSourceTypeChange(newValue: string) {
    emit('update:modelValue', {
      sourceType: newValue,
      valueType: undefined,
      value: undefined,
      point: undefined,
      field: undefined,
      lifecycleId: undefined,
      aggregateId: undefined,
    })
  }

  function onValueTypeChange(newValue: string) {
    patch({ valueType: newValue, value: undefined })
  }

  function onValueChange(newValue: any) {
    patch({ value: newValue })
  }

  function onBooleanValueChange(newValue: string) {
    patch({ value: fromBooleanSelectValue(newValue) })
  }

  function onInputValueChange(event: any) {
    patch({ value: event.target.value })
  }

  function onPointChange(newValue: string | undefined) {
    patch({ point: newValue })
  }

  function onFieldChange(newValue: string) {
    const selection = parseFieldSelection(newValue)
    if (!selection) {
      patch({ field: undefined, lifecycleId: undefined, aggregateId: undefined })
      return
    }

    if (selection.type === 'aggregate') {
      patch({
        field: undefined,
        lifecycleId: selection.lifecycleId,
        aggregateId: selection.aggregateId,
      })
      return
    }

    patch({ field: selection.id, lifecycleId: undefined, aggregateId: undefined })
  }
</script>

<style scoped>
  .direct-config {
    display: flex;
    flex-direction: row;
    gap: 8px;
    align-items: center;
    flex: 1;
  }

  .direct-config > * {
    flex: 1;
  }
</style>
