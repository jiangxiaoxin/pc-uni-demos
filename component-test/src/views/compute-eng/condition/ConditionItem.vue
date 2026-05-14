<template>
  <div class="cond-item">
    <a-select
      :value="modelValue.conditionSource"
      :options="condition_source_options"
      @change="onConditionSourceChange"
      size="small"
      placeholder="条件来源"
    ></a-select>

    <a-input
      :value="modelValue.field"
      size="small"
      placeholder="字段"
      @change="onFieldChange"
    ></a-input>

    <a-select
      :value="modelValue.operator"
      :options="OPERATORS"
      placeholder="比较符"
      @change="onOperatorChange"
      size="small"
    ></a-select>

    <a-select
      :value="modelValue.valueType"
      :options="value_type_options"
      placeholder="值类型"
      @change="onValueTypeChange"
      size="small"
    ></a-select>

    <a-input
      :value="modelValue.value"
      size="small"
      placeholder="值"
      @change="onValueChange"
    ></a-input>

    <a-button
      type="primary"
      danger
      size="small"
      @click="emit('remove')"
      style="max-width: 100px;"
    >
      删除条件
    </a-button>
  </div>
</template>

<script setup lang="ts">
  import {
    condition_source_options,
    OPERATORS,
    value_type_options,
  } from "./types";

  const props = defineProps<{
    modelValue: any;
  }>();

  console.log('item data', props.modelValue);
  

  const emit = defineEmits<{
    (e: "update:modelValue", val: any): void;
    (e: "remove"): void;
  }>();

  // 统一的 patch：emit 整体替换的新对象，保持单向数据流
  function patch(part: any) {
    console.log("🚀 ~ ConditionItem.vue:34 ~ patch ~ part:", part);

    emit("update:modelValue", { ...props.modelValue, ...part });
  }

  // 条件来源改变了，所有数据都要重置
  function onConditionSourceChange(newValue: string) {
    emit("update:modelValue", {
      ...props.modelValue,
      conditionSource: newValue,
      field: "",
      operator: undefined,
      valueType: undefined,
      value: "",
      point: "",
      template: undefined,
    });
  }

  function onFieldChange(event: any) {

    patch({ field: event.target.value });
  }

  function onOperatorChange(newValue: string) {
    patch({ operator: newValue });
  }

  function onValueTypeChange(newValue: string) {
    patch({ valueType: newValue });
  }

  function onValueChange(event: any) {
    patch({ value:  event.target.value});
  }
</script>

<style scoped>
  .cond-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 8px 12px;
    background: #fff;
    border: 1px solid #e4e7ed;
    border-radius: 8px;
    transition:
      border-color 0.15s,
      box-shadow 0.15s;
  }

  .cond-item:hover {
    border-color: #c7d0ff;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.08);
  }

</style>
