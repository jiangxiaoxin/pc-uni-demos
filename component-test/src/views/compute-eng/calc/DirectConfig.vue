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
        :value="modelValue.value"
        :options="bool_options"
        @change="onValueChange"
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
    <a-select
      v-if="isDevicePoint"
      :value="modelValue.point"
      :options="pointOptions"
      @change="onPointChange"
      size="small"
      placeholder="选择设备点位"
    />

    <!-- 取值字段 -->
    <a-select
      v-if="isField"
      :value="modelValue.field"
      :options="fieldOptions"
      @change="onFieldChange"
      size="small"
      placeholder="选择取值字段"
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
  import { bool_options } from '../condition/types'
  import type { DirectSourceConfig } from './types'

  const props = withDefaults(
    defineProps<{
      modelValue: DirectSourceConfig
      pointOptions?: { label: string; value: string }[]
      fieldOptions?: { label: string; value: string }[]
    }>(),
    {
      modelValue: () => ({ sourceType: source_type_fixed }) as DirectSourceConfig,
      pointOptions: () => [],
      fieldOptions: () => [],
    },
  )

  const emit = defineEmits<{
    (e: 'update:modelValue', val: DirectSourceConfig): void
  }>()

  const isFixedValue = computed(() => props.modelValue.sourceType === source_type_fixed)
  const isDevicePoint = computed(() => props.modelValue.sourceType === source_type_point)
  const isField = computed(() => props.modelValue.sourceType === source_type_field)

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
    })
  }

  function onValueTypeChange(newValue: string) {
    patch({ valueType: newValue, value: undefined })
  }

  function onValueChange(newValue: any) {
    patch({ value: newValue })
  }

  function onInputValueChange(event: any) {
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
