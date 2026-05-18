<template>
  <div class="cond-item">
    <a-select
      v-if="!fixedConditionSource"
      :value="modelValue.conditionSource"
      :options="condition_source_options"
      @change="onConditionSourceChange"
      size="small"
      placeholder="条件来源"
    ></a-select>
    <div v-else class="fixed-text">
      <span class="fixed-label">条件来源</span>
      <span class="fixed-value">{{ fixedConditionSourceLabel }}</span>
    </div>

    <a-input
      v-if="isTemplate"
      :value="modelValue.template"
      disabled
      size="small"
      placeholder="动作模板"
    >
      <template #addonAfter>
        <span @click.stop="chooseTemplate" style="cursor: pointer">
          选择动作模板
        </span>
      </template>
    </a-input>

    <div v-if="isPoint && fixedConditionSource" class="fixed-text">
      <span class="fixed-label">设备点位</span>
      <span class="fixed-value">{{ fixedPointLabel || '请选择采样指标' }}</span>
    </div>
    <a-input
      v-else-if="isPoint"
      :value="fixedPointLabel || modelValue.point"
      disabled
      size="small"
      placeholder="设备点位"
    >
      <template #addonAfter v-if="!fixedPoint">
        <span  @click.stop="choosePoint" style="cursor: pointer">
          选择点位
        </span>
      </template>
    </a-input>

    <a-select
      v-if="isNodeVar"
      :value="modelValue.nodeId"
      :options="allNodes"
      size="small"
      placeholder="图内节点"
      @change="onNodeChange"
    ></a-select>

    <a-input
      :value="modelValue.field"
      size="small"
      placeholder="字段"
      @change="onFieldChange"
      v-if="isCustomize"
    ></a-input>

    <template v-if="isCustomize || isPoint || isNodeVar">
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

      <a-input-number
        :value="modelValue.value"
        size="small"
        placeholder="值"
        @change="onNumberChange"
        v-if="modelValue.valueType == value_type_number"
        :controls="false"
        style="width: 100%"
      ></a-input-number>
      <a-select
        v-else-if="modelValue.valueType == value_type_boolean"
        :value="modelValue.value"
        :options="bool_options"
        placeholder="值"
        @chagne="onBooleanChange"
        size="small"
      ></a-select>
      <a-input
        v-else
        :value="modelValue.value"
        size="small"
        placeholder="值"
        @change="onValueChange"
      ></a-input>
    </template>

    <a-button
      type="primary"
      danger
      size="small"
      @click="emit('remove')"
      style="max-width: 100px"
    >
      删除条件
    </a-button>
  </div>
</template>

<script setup lang="ts">
  import { computed, inject } from "vue";
  import { GET_GRAPH_DATA_FN_KEY } from "../symbols";
  import {
    bool_options,
    condition_source_customize,
    condition_source_node,
    condition_source_options,
    condition_source_point,
    condition_source_template,
    OPERATORS,
    value_type_boolean,
    value_type_number,
    value_type_options,
    value_type_string,
  } from "./types";
  import { NODE_TYPE } from "../menus";

  const props = defineProps<{
    modelValue: any;
    fixedConditionSource?: string;
    fixedPoint?: string;
    fixedPointLabel?: string;
  }>();

  // console.log('item data', props.modelValue);

  const isCustomize = computed(() => {
    return conditionSource.value === condition_source_customize;
  });

  const isPoint = computed(() => {
    return conditionSource.value === condition_source_point;
  });

  const isTemplate = computed(() => {
    return conditionSource.value === condition_source_template;
  });

  const isNodeVar = computed(() => {
    return conditionSource.value === condition_source_node;
  });

  const conditionSource = computed(() => {
    return props.fixedConditionSource ?? props.modelValue.conditionSource;
  });

  const fixedPoint = computed(() => props.fixedPoint);
  const fixedPointLabel = computed(() => props.fixedPointLabel || props.fixedPoint || "");
  const fixedConditionSourceLabel = computed(() => {
    return condition_source_options.find((item) => item.value === props.fixedConditionSource)?.label || "";
  });

  const getGraphData = inject(GET_GRAPH_DATA_FN_KEY, () => {});

  const allNodes = computed(() => {
    const { nodes = [] } = getGraphData();
    return nodes
      .filter((node) => {
        return node.type != NODE_TYPE.TASK;
      })
      .map((node) => {
        return {
          value: node.id,
          label: `${node.properties.title || node.properties.name || ""} (${node.id})`,
        };
      });
  });

  const emit = defineEmits<{
    (e: "update:modelValue", val: any): void;
    (e: "remove"): void;
  }>();

  // 统一的 patch：emit 整体替换的新对象，保持单向数据流
  function patch(part: any) {
    console.log("🚀 ~ ConditionItem.vue:34 ~ patch ~ part:", part);

    emit("update:modelValue", {
      ...props.modelValue,
      conditionSource: props.fixedConditionSource ?? props.modelValue.conditionSource,
      point: props.fixedConditionSource || props.fixedPoint !== undefined ? props.fixedPoint : props.modelValue.point,
      ...part,
    });
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
      nodeId: undefined, // 选中的节点。
    });
  }

  function choosePoint() {
    // TODO 打开点位选择器
  }

  function chooseTemplate() {
    // TODO 打开modal，选择模板
  }

  function onFieldChange(event: any) {
    patch({ field: event.target.value });
  }

  function onOperatorChange(newValue: string) {
    patch({ operator: newValue });
  }

  function onValueTypeChange(newValue: string) {
    patch({ valueType: newValue, value: undefined }); // 值类型修改了，同时修改值
  }

  function onValueChange(event: any) {
    patch({ value: event.target.value });
  }

  function onNumberChange(value) {
    patch({ value });
  }

  function onNodeChange(newValue: string) {
    patch({ nodeId: newValue });
  }

  function onBooleanChange(newValue: any) {
    patch({ value: newValue });
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

  .fixed-text {
    display: flex;
    align-items: center;
    min-height: 24px;
    padding: 0 8px;
    font-size: 13px;
    line-height: 22px;
    background: #f5f5f5;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
  }

  .fixed-label {
    flex-shrink: 0;
    color: #666;
  }

  .fixed-label::after {
    content: "：";
  }

  .fixed-value {
    min-width: 0;
    color: #262626;
    word-break: break-all;
  }
</style>
