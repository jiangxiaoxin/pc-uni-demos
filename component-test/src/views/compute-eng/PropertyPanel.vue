<template>
  <a-drawer
    :open="visible"
    title="属性面板"
    placement="right"
    :width="800"
    :maskClosable="false"
    @close="handleClose"
    destroy-on-close
  >
    <template #extra>
      <a-button size="small" style="margin-right: 8px" @click="handleClose">
        取消
      </a-button>
      <a-button type="primary" size="small" @click="handleConfirm">
        确定
      </a-button>
    </template>
    <div class="property-content">
      <NodeBaseConfig
        :node-id="localNodeId"
        :node-type-name="localNodeTypeName"
        v-model:title="titleValue"
      />

      <div class="config-section">
        <div class="section-title">属性配置</div>
        <div class="info-row">
          <span class="label">优先级：</span>
          <a-input-number
            v-model:value="modelData.priority"
            placeholder="请输入优先级"
            size="small"
            style="flex: 1 !important; width: auto"
            :min="0"
            :controls="false"
            :precision="0"
          />
        </div>
        <div class="info-row">
          <span class="label">下游调度策略</span>
          <a-select
            v-model:value="modelData.downPolicy"
            :options="down_policy_options"
            style="flex: 1"
            size="small"
          ></a-select>
        </div>
        <div class="info-row">
          <span class="label">执行引擎</span>
          <a-select
            v-model:value="modelData.executeEngine"
            :options="execute_engine_options"
            style="flex: 1"
            size="small"
            @change="onEngineChange"
          ></a-select>
        </div>
        <div v-if="modelData.executeEngine == execute_engine_aviator">
          <span class="label">条件配置</span>
          <ConditionGroup
            v-model="modelData.condConfig"
            :is-root="true"
            style="margin-top: 8px"
          />
        </div>
        <div v-if="modelData.executeEngine == execute_engine_assign">
          <div class="info-row">
            <span class="label">计算模式</span>
            <a-select
              v-model:value="modelData.calcConfig.calcMode"
              :options="calc_mode_options"
              style="flex: 1"
              size="small"
              @change="onCalcModeChange"
            ></a-select>
          </div>
          <div class="info-row" v-if="isDirect">
            <span class="label">取值来源</span>
            <DirectConfig
              v-model="modelData.calcConfig.directSource"
              :point-tree-data="pointTreeData"
              :field-options="fieldOptions"
            />
          </div>
          <div v-if="isMath">
            <span class="label">运算配置</span>
            <MathGroup
              v-if="modelData.calcConfig.mathConfig"
              v-model="modelData.calcConfig.mathConfig"
              :is-root="true"
              :point-tree-data="pointTreeData"
              :field-tree-data="fieldTreeData"
              style="margin-top: 8px"
            />
          </div>
        </div>
      </div>

      <NodeTimeConfig v-model="modelData.timeConfig" />
    </div>
  </a-drawer>
</template>

<script setup lang="ts">
  import { computed, inject, nextTick, ref, type Ref } from "vue";
  import {
    calc_mode_direct,
    calc_mode_math,
    calc_mode_options,
    execute_engine_assign,
    execute_engine_aviator,
    GET_TASK_NODE_DATA_FN_KEY,
    GET_GRAPH_DATA_FN_KEY,
    NODE_CONFIGS_KEY,
  } from "./symbols";
  import { getNodeTypeConfig, NODE_TYPE } from "./menus";
  import { down_policy_options, execute_engine_options } from "./symbols";
  import ConditionGroup from "./condition/ConditionGroup.vue";
  import { createDefaultGroup } from "./condition/types";
  import { createDefaultCalc, createDefaultMathGroup } from "./calc/types";
  import DirectConfig from "./calc/DirectConfig.vue"
  import MathGroup from "./calc/MathGroup.vue"
  import NodeBaseConfig from "./NodeBaseConfig.vue"
  import NodeTimeConfig from "./NodeTimeConfig.vue";
  import type { PointTreeNode } from "./condition/types";

  interface NodeData {
    id?: string;
    type?: string;
    properties?: Record<string, any>;
    [key: string]: any;
  }

  interface DevicePoint {
    code: string
    name: string
    unit?: string
  }

  interface SelectedDevice {
    id: string | number
    name: string
    points?: DevicePoint[]
  }

  interface FieldOption {
    label: string
    value: string
  }

  interface FieldOptionGroup {
    label: string
    options: FieldOption[]
  }

  type FieldSelection =
    | { type: 'node'; id: string }
    | { type: 'aggregate'; lifecycleId: string; aggregateId: string }

  const emit = defineEmits<{
    (e: "update-title", payload: { nodeId: string; title: string }): void;
  }>();

  const visible = ref(false);

  const nodeConfigs = inject<Ref<Record<string, any>>>(
    NODE_CONFIGS_KEY,
    ref({}),
  );

  const taskNodeConfig = inject<Function>(GET_TASK_NODE_DATA_FN_KEY)
  const getGraphData = inject<() => { nodes?: NodeData[] } | undefined>(
    GET_GRAPH_DATA_FN_KEY,
    () => ({ nodes: [] }),
  )

  

  const modelData = ref<any>({
    // priority: null, // 优先级
    // downPolicy: null, // 下游调度策略
    // executeEngine: null, // 执行引擎
    // condConfig: {}, // 条件组配置
    // calcConfig: {}, // 计算组配置
    // timeConfig: {}, // 定时配置
  });

  const isDirect = computed(() => {
    return modelData.value.calcConfig?.calcMode == calc_mode_direct;
  })
  const isMath = computed(() => {
    return modelData.value.calcConfig?.calcMode == calc_mode_math;
  })

  const taskConfig = computed(() => {
    return taskNodeConfig?.() ?? {}
  })

  const selectedDevices = computed<SelectedDevice[]>(() => {
    const devices = taskConfig.value?.devices
    return Array.isArray(devices) ? devices : []
  })

  const pointTreeData = computed<PointTreeNode[]>(() => {
    return selectedDevices.value.map((device) => {
      const deviceId = String(device.id)
      return {
        title: device.name,
        value: `device:${deviceId}`,
        key: `device:${deviceId}`,
        disabled: true,
        children: getDevicePoints(device).map((point) => ({
          title: `${point.name}${point.unit ? ` (${point.unit})` : ''}`,
          value: point.code,
          key: point.code,
        })),
      }
    })
  })

  const fieldOptions = computed<FieldOptionGroup[]>(() => {
    const graphNodes = getGraphData()?.nodes ?? []
    const nodeOptions = graphNodes
      .filter((node) => node.type !== NODE_TYPE.TASK && node.id)
      .map((node) => {
        const nodeId = String(node.id)
        return {
          value: encodeFieldSelection({ type: 'node', id: nodeId }),
          label: node.properties?.title || node.properties?.name || nodeId,
        }
      })
    const aggregateOptions = getAggregateFieldOptions()
    const groups: FieldOptionGroup[] = []

    if (nodeOptions.length > 0) {
      groups.push({
        label: '图中节点',
        options: nodeOptions,
      })
    }

    if (aggregateOptions.length > 0) {
      groups.push({
        label: '生命周期聚合定义',
        options: aggregateOptions,
      })
    }

    return groups
  })

  const fieldTreeData = computed<PointTreeNode[]>(() => {
    const graphNodes = getGraphData()?.nodes ?? []
    const nodeChildren = graphNodes
      .filter((node) => node.type !== NODE_TYPE.TASK && node.id)
      .map((node) => {
        const nodeId = String(node.id)
        const value = encodeFieldSelection({ type: 'node', id: nodeId })
        return {
          title: node.properties?.title || node.properties?.name || nodeId,
          value,
          key: value,
        }
      })
    const aggregateChildren = getAggregateFieldTreeNodes()
    const treeData: PointTreeNode[] = []

    if (nodeChildren.length > 0) {
      treeData.push({
        title: '图中节点',
        value: 'field-group:nodes',
        key: 'field-group:nodes',
        disabled: true,
        children: nodeChildren,
      })
    }

    if (aggregateChildren.length > 0) {
      treeData.push({
        title: '生命周期聚合定义',
        value: 'field-group:aggregates',
        key: 'field-group:aggregates',
        disabled: true,
        children: aggregateChildren,
      })
    }

    return treeData
  })

  function encodeFieldSelection(selection: FieldSelection) {
    return JSON.stringify(selection)
  }

  function getDevicePoints(device: SelectedDevice): DevicePoint[] {
    if (Array.isArray(device.points) && device.points.length > 0) {
      return device.points
    }

    const deviceId = String(device.id)
    return [
      {
        code: `${deviceId}-temperature`,
        name: '温度',
        unit: '℃',
      },
      {
        code: `${deviceId}-humidity`,
        name: '湿度',
        unit: '%',
      },
      {
        code: `${deviceId}-count`,
        name: '次数',
        unit: '次',
      },
    ]
  }

  function getAggregateFieldOptions(): FieldOption[] {
    const lifecycleConfigs = taskConfig.value?.lifecycleConfigs
    if (!Array.isArray(lifecycleConfigs)) {
      return []
    }

    return lifecycleConfigs.flatMap((lifecycle: any, lifecycleIndex: number) => {
      const aggregations = Array.isArray(lifecycle.aggregations) ? lifecycle.aggregations : []
      const lifecycleId = lifecycle.id ? String(lifecycle.id) : ''
      const lifecycleName = lifecycle.name || `生命周期 ${lifecycleIndex + 1}`

      if (!lifecycleId) {
        return []
      }

      return aggregations
        .filter((aggregation: any) => aggregation.id)
        .map((aggregation: any, aggregationIndex: number) => {
          const aggregateId = String(aggregation.id)
          const aggregateName = aggregation.displayName || `聚合 ${aggregationIndex + 1}`
          return {
            value: encodeFieldSelection({ type: 'aggregate', lifecycleId, aggregateId }),
            label: `${lifecycleName} - ${aggregateName}`,
          }
        })
    })
  }

  function getAggregateFieldTreeNodes(): PointTreeNode[] {
    const lifecycleConfigs = taskConfig.value?.lifecycleConfigs
    if (!Array.isArray(lifecycleConfigs)) {
      return []
    }

    return lifecycleConfigs
      .map((lifecycle: any, lifecycleIndex: number) => {
        const aggregations = Array.isArray(lifecycle.aggregations) ? lifecycle.aggregations : []
        const lifecycleId = lifecycle.id ? String(lifecycle.id) : ''
        const lifecycleName = lifecycle.name || `生命周期 ${lifecycleIndex + 1}`

        if (!lifecycleId) {
          return null
        }

        const children = aggregations
          .filter((aggregation: any) => aggregation.id)
          .map((aggregation: any, aggregationIndex: number) => {
            const aggregateId = String(aggregation.id)
            const aggregateName = aggregation.displayName || `聚合 ${aggregationIndex + 1}`
            const value = encodeFieldSelection({ type: 'aggregate', lifecycleId, aggregateId })
            return {
              title: aggregateName,
              value,
              key: value,
            }
          })

        if (children.length === 0) {
          return null
        }

        return {
          title: lifecycleName,
          value: `field-lifecycle:${lifecycleId}`,
          key: `field-lifecycle:${lifecycleId}`,
          disabled: true,
          children,
        }
      })
      .filter((node): node is PointTreeNode => !!node)
  }

  // 标题本地编辑值
  const titleValue = ref("");
  const localNodeData = ref<NodeData>({});
  const localNodeId = computed(() => {
    return localNodeData.value.id ?? "";
  });

  const localNodeTypeName = computed(() => {
    return getNodeTypeConfig(localNodeData.value.type ?? "")?.name || "未知";
  });

  const open = (nodeData: NodeData) => {
    titleValue.value =
      nodeData.properties?.title || nodeData.properties?.name || "";
    localNodeData.value = nodeData;
    if (!nodeConfigs.value[nodeData.id!]) {
      nodeConfigs.value[nodeData.id!] = {};
    }

    try {
      // 如果直接从nodeConfigs 上拿值赋给 modelData，则 后续做的修改，会直接修改在整体的配置上
      modelData.value = JSON.parse(
        JSON.stringify(nodeConfigs.value[nodeData.id!]),
      );
    } catch (error) {
      modelData.value = {};
    }

    // 补全计算配置中的取值来源
    if (modelData.value.calcConfig && !modelData.value.calcConfig.directSource) {
      modelData.value.calcConfig.directSource = createDefaultCalc().directSource;
    }
    // 补全数学运算配置
    if (modelData.value.calcConfig && !modelData.value.calcConfig.mathConfig) {
      modelData.value.calcConfig.mathConfig = createDefaultMathGroup();
    }

    visible.value = true;

    console.log('task 节点', taskNodeConfig!()); // 可以获取任务节点配置的数据
    
  };

  const onEngineChange = (value: string) => {
    console.log("🚀 ~ PropertyPanel.vue:140 ~ onEngineChange ~ value:", value);
    //  切换后，要清空配置
    // 这会导致一个问题：先配cond，然后切换到calc，那cond 的配置会立马丢失，再回到cond时，需要从头开始配
    // 也可以在这里不清理，依然保留旧数据，而是在最后保存到后台时，根据当时的类型来决定保存什么数据
    if (value == execute_engine_aviator) {
      if (!modelData.value.condConfig) {
        modelData.value.condConfig = createDefaultGroup();
      }
      modelData.value.calcConfig = null;
    } else {
      if (!modelData.value.calcConfig) {
        modelData.value.calcConfig = createDefaultCalc();
      }
      modelData.value.condConfig = null;
    }
  };

  const onCalcModeChange = (value: string) => {
    if (value === calc_mode_math && !modelData.value.calcConfig?.mathConfig) {
      modelData.value.calcConfig.mathConfig = createDefaultMathGroup();
    }
  };

  const clearData = () => {
    nextTick(() => {
      localNodeData.value = {};
      titleValue.value = "";
    });
  };

  const handleConfirm = () => {
    const title = titleValue.value.trim();
    emit("update-title", {
      nodeId: localNodeId.value,
      title: title,
    });

    if (localNodeId.value) {
      nodeConfigs.value[localNodeId.value] = modelData.value;
    }

    // TODO
    setTimeout(() => {
      console.log("保存了", JSON.parse(JSON.stringify(modelData.value)))
    }, 1000);

    handleClose();
  };

  const handleClose = () => {
    visible.value = false;
    clearData();
  };

  defineExpose({
    open,
    close: handleClose,
  });
</script>

<style scoped lang="scss">
  .property-content {
    // padding: 16px; // 不要这么多的空余
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

  .empty-tip {
    margin-top: 16px;
    padding: 24px;
    text-align: center;
    color: #999;
    font-size: 13px;
    background: #f5f5f5;
    border-radius: 6px;
  }
</style>
