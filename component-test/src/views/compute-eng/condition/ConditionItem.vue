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
      :value="graphVariableValue"
      :options="graphVariableOptions"
      size="small"
      placeholder="图内节点 / 聚合定义"
      @change="onGraphVariableChange"
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
        @change="onBooleanChange"
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
  import { GET_GRAPH_DATA_FN_KEY, GET_TASK_NODE_DATA_FN_KEY } from "../symbols";
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
  } from "./types";
  import { NODE_TYPE } from "../menus";

  interface GraphNode {
    id?: string | number;
    type?: string;
    properties?: Record<string, any>;
  }

  interface GraphData {
    nodes?: GraphNode[];
  }

  interface AggregationConfig {
    id?: string | number;
    displayName?: string;
    aggregateFunction?: string;
  }

  interface LifecycleConfig {
    id?: string | number;
    name?: string;
    aggregations?: AggregationConfig[];
  }

  interface TaskNodeConfig {
    lifecycleConfigs?: LifecycleConfig[];
  }

  interface SelectOption {
    value: string;
    label: string;
  }

  type GraphVariableSelection =
    | { type: "node"; nodeId: string }
    | { type: "aggregate"; lifecycleId: string; aggregateId: string };

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

  const getGraphData = inject<() => GraphData | undefined>(GET_GRAPH_DATA_FN_KEY, () => ({ nodes: [] }));
  const getTaskNodeData = inject<() => TaskNodeConfig | undefined>(GET_TASK_NODE_DATA_FN_KEY, () => ({}));

  function encodeGraphVariableValue(selection: GraphVariableSelection) {
    return JSON.stringify(selection);
  }

  function parseGraphVariableValue(value: string): GraphVariableSelection | null {
    if (!value) {
      return null;
    }

    try {
      const parsed = JSON.parse(value) as Partial<GraphVariableSelection>;
      if (parsed.type === "aggregate" && parsed.lifecycleId && parsed.aggregateId) {
        return {
          type: "aggregate",
          lifecycleId: String(parsed.lifecycleId),
          aggregateId: String(parsed.aggregateId),
        };
      }

      if (parsed.type === "node" && parsed.nodeId) {
        return {
          type: "node",
          nodeId: String(parsed.nodeId),
        };
      }
    } catch {
      return {
        type: "node",
        nodeId: value,
      };
    }

    return null;
  }

  const graphNodeOptions = computed<SelectOption[]>(() => {
    const nodes = getGraphData()?.nodes ?? [];
    return nodes
      .filter((node) => {
        return node.type !== NODE_TYPE.TASK && node.id !== undefined && node.id !== null;
      })
      .map((node) => {
        const nodeId = String(node.id);
        const nodeName = node.properties?.title || node.properties?.name || nodeId;
        return {
          value: encodeGraphVariableValue({ type: "node", nodeId }),
          label: `${nodeName} (${nodeId})`,
        };
      });
  });

  const aggregateOptions = computed<SelectOption[]>(() => {
    const lifecycleConfigs = getTaskNodeData()?.lifecycleConfigs ?? [];

    return lifecycleConfigs.flatMap((lifecycle, lifecycleIndex) => {
      if (lifecycle.id === undefined || lifecycle.id === null) {
        return [];
      }

      const lifecycleId = String(lifecycle.id);
      const lifecycleName = lifecycle.name || `生命周期 ${lifecycleIndex + 1}`;
      const aggregations = Array.isArray(lifecycle.aggregations) ? lifecycle.aggregations : [];

      return aggregations
        .filter((aggregation) => aggregation.id !== undefined && aggregation.id !== null)
        .map((aggregation, aggregationIndex) => {
          const aggregateId = String(aggregation.id);
          const aggregateName = aggregation.displayName || `聚合 ${aggregationIndex + 1}`;
          const aggregateFunction = aggregation.aggregateFunction ? ` / ${aggregation.aggregateFunction}` : "";

          return {
            value: encodeGraphVariableValue({
              type: "aggregate",
              lifecycleId,
              aggregateId,
            }),
            label: `${lifecycleName} - ${aggregateName}${aggregateFunction} (${aggregateId})`,
          };
        });
    });
  });

  const graphVariableOptions = computed(() => {
    const options: Array<SelectOption | { label: string; options: SelectOption[] }> = [];

    if (graphNodeOptions.value.length > 0) {
      options.push({
        label: "图中节点",
        options: graphNodeOptions.value,
      });
    }

    if (aggregateOptions.value.length > 0) {
      options.push({
        label: "生命周期聚合定义",
        options: aggregateOptions.value,
      });
    }

    return options;
  });

  const graphVariableValue = computed(() => {
    if (props.modelValue.lifecycleId && props.modelValue.aggregateId) {
      return encodeGraphVariableValue({
        type: "aggregate",
        lifecycleId: String(props.modelValue.lifecycleId),
        aggregateId: String(props.modelValue.aggregateId),
      });
    }

    if (props.modelValue.nodeId) {
      return encodeGraphVariableValue({
        type: "node",
        nodeId: String(props.modelValue.nodeId),
      });
    }

    return undefined;
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
      lifecycleId: undefined,
      aggregateId: undefined,
    });
  }

  function choosePoint() {
    patch({ point: "mock-device-1" });
  }

  function chooseTemplate() {
    patch({ template: "mock-action-template-1" });
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

  function onGraphVariableChange(newValue: string) {
    const selection = parseGraphVariableValue(newValue);
    if (!selection) {
      return;
    }

    if (selection.type === "aggregate") {
      patch({
        nodeId: undefined,
        lifecycleId: selection.lifecycleId,
        aggregateId: selection.aggregateId,
      });
      return;
    }

    patch({
      nodeId: selection.nodeId,
      lifecycleId: undefined,
      aggregateId: undefined,
    });
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
