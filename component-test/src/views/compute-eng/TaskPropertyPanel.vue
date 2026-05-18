<template>
  <a-drawer
    :open="visible"
    title="任务节点属性"
    placement="right"
    :width="1000"
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
        <div class="section-title">设备选择</div>
        <div class="device-select-header">
          <span class="device-count">已选 {{ selectedDevices.length }} 个设备</span>
          <a-button type="primary" size="small" @click="handleAddDevice">
            添加设备
          </a-button>
        </div>
        <div v-if="selectedDevices.length > 0" class="device-tags">
          <a-tag
            v-for="(device, index) in selectedDevices"
            :key="device.id"
            closable
            @close="removeDevice(index)"
          >
            {{ device.name }}
          </a-tag>
        </div>
        <div v-else class="empty-tip device-empty">
          暂无已选设备
        </div>
      </div>

      <div class="config-section">
        <div class="section-title-row">
          <div class="section-title">生命周期</div>
          <a-button type="primary" size="small" @click="addLifecycle">
            增加生命周期
          </a-button>
        </div>

        <div v-if="lifecycles.length > 0" class="lifecycle-list">
          <div
            v-for="(lifecycle, lifecycleIndex) in lifecycles"
            :key="lifecycle.id"
            class="lifecycle-card"
          >
            <div class="lifecycle-header">
              <span class="lifecycle-title">生命周期 {{ lifecycleIndex + 1 }}</span>
              <a-button type="primary" danger size="small" @click="removeLifecycle(lifecycleIndex)">
                删除
              </a-button>
            </div>

            <div class="info-row">
              <span class="label">名字</span>
              <a-input
                v-model:value="lifecycle.name"
                placeholder="请输入生命周期名字"
                size="small"
              />
            </div>

            <div class="lifecycle-block">
              <div class="block-title">开始条件</div>
              <ConditionGroup v-model="lifecycle.startCondition" :is-root="true" />
            </div>

            <div class="lifecycle-block">
              <div class="block-title-row">
                <div class="block-title">结束条件</div>
                <a-button type="primary" size="small" @click="addEndCondition(lifecycle)">
                  增加结束条件
                </a-button>
              </div>

              <div v-if="lifecycle.endConditions.length > 0" class="end-condition-list">
                <div
                  v-for="(endCondition, endIndex) in lifecycle.endConditions"
                  :key="endCondition.id"
                  class="end-condition-card"
                >
                  <div class="end-condition-header">
                    <span class="end-condition-title">结束条件 {{ endIndex + 1 }}</span>
                    <a-button  type="primary" danger size="small" @click="removeEndCondition(lifecycle, endIndex)">
                      删除
                    </a-button>
                  </div>

                  <div class="info-row">
                    <span class="label">条件名称</span>
                    <a-input
                      v-model:value="endCondition.name"
                      placeholder="请输入条件名称"
                      size="small"
                    />
                  </div>

                  <div class="info-row">
                    <span class="label">优先级</span>
                    <a-input-number
                      v-model:value="endCondition.priority"
                      placeholder="请输入优先级"
                      size="small"
                      style="flex: 1 !important; width: auto"
                      :min="0"
                      :controls="false"
                      :precision="0"
                    />
                  </div>

                  <div class="condition-config">
                    <div class="field-title">条件配置</div>
                    <ConditionGroup v-model="endCondition.condition" :is-root="true" />
                  </div>

                  <div class="trigger-config">
                    <div class="field-title">触发算子选择</div>
                    <a-checkbox-group
                      v-model:value="endCondition.triggerNodeIds"
                      :options="triggerNodeOptions"
                    />
                  </div>
                </div>
              </div>
              <div v-else class="empty-tip lifecycle-empty">
                暂无结束条件
              </div>
            </div>

            <div class="lifecycle-block">
              <div class="block-title-row">
                <div class="block-title">聚合定义</div>
                <a-button type="primary" size="small" @click="addAggregation(lifecycle)">
                  增加聚合
                </a-button>
              </div>

              <div v-if="lifecycle.aggregations.length > 0" class="aggregation-list">
                <div
                  v-for="(aggregation, aggregationIndex) in lifecycle.aggregations"
                  :key="aggregation.id"
                  class="aggregation-card"
                >
                  <div class="aggregation-header">
                    <span class="aggregation-title">聚合 {{ aggregationIndex + 1 }}</span>
                    <a-button
                      type="primary"
                      danger
                      size="small"
                      @click="removeAggregation(lifecycle, aggregationIndex)"
                    >
                      删除
                    </a-button>
                  </div>

                  <div class="info-row">
                    <span class="label">展示名称</span>
                    <a-input
                      v-model:value="aggregation.displayName"
                      placeholder="请输入展示名称"
                      size="small"
                    />
                  </div>

                  <div class="info-row">
                    <span class="label">采样指标</span>
                    <a-select
                      v-model:value="aggregation.sampleMetric"
                      :options="sampleMetricOptions"
                      placeholder="请选择采样指标"
                      size="small"
                      style="flex: 1"
                      allow-clear
                      @change="onSampleMetricChange(aggregation)"
                    />
                  </div>

                  <div class="info-row">
                    <span class="label">聚合函数</span>
                    <a-select
                      v-model:value="aggregation.aggregateFunction"
                      :options="aggregateFunctionOptions"
                      placeholder="请选择聚合函数"
                      size="small"
                      style="flex: 1"
                      allow-clear
                    />
                  </div>

                  <div class="condition-config">
                    <div class="field-title">条件组</div>
                    <!-- 聚合定义的条件来源固定为设备点位，设备点位固定显示并保存当前采样指标。 -->
                    <ConditionGroup
                      v-model="aggregation.condition"
                      :is-root="true"
                      :fixed-condition-source="condition_source_point"
                      :fixed-point="aggregation.sampleMetric"
                      :fixed-point-label="getSampleMetricLabel(aggregation.sampleMetric)"
                    />
                  </div>
                </div>
              </div>
              <div v-else class="empty-tip lifecycle-empty">
                暂无聚合定义
              </div>
            </div>
          </div>
        </div>
        <div v-else class="empty-tip lifecycle-empty">
          暂无生命周期
        </div>
      </div>

     

      <NodeTimeConfig v-model="modelData.timeConfig" />
    </div>
  </a-drawer>
</template>

<script setup lang="ts">
  import { computed, inject, nextTick, ref, type Ref } from 'vue'
  import { GET_GRAPH_DATA_FN_KEY, NODE_CONFIGS_KEY } from './symbols'
  import { getNodeTypeConfig, NODE_TYPE } from './menus'
  import ConditionGroup from './condition/ConditionGroup.vue'
  import {
    condition_source_point,
    createDefaultGroup,
    type ConditionGroup as ConditionGroupData,
  } from './condition/types'
  import NodeBaseConfig from './NodeBaseConfig.vue'
  import NodeTimeConfig from './NodeTimeConfig.vue'

  interface NodeData {
    id?: string
    type?: string
    properties?: Record<string, any>
    [key: string]: any
  }

  interface SelectedDevice {
    id: string | number
    name: string
  }

  interface EndConditionConfig {
    id: string
    name: string
    priority: number | null
    condition: ConditionGroupData
    triggerNodeIds: string[]
  }

  interface AggregationConfig {
    id: string
    displayName: string
    sampleMetric?: string
    aggregateFunction?: string
    condition: ConditionGroupData
  }

  interface LifecycleConfig {
    id: string
    name: string
    startCondition: ConditionGroupData
    endConditions: EndConditionConfig[]
    aggregations: AggregationConfig[]
  }

  interface GraphData {
    nodes?: NodeData[]
  }

  const emit = defineEmits<{
    (e: 'update-title', payload: { nodeId: string; title: string }): void
  }>()

  const visible = ref(false)

  const nodeConfigs = inject<Ref<Record<string, any>>>(NODE_CONFIGS_KEY, ref({}))
  const getGraphData = inject<() => GraphData | undefined>(GET_GRAPH_DATA_FN_KEY, () => ({ nodes: [] }))

  const modelData = ref<any>({})

  const aggregateFunctionOptions = [
    { value: 'COUNT', label: 'COUNT' },
    { value: 'SUM', label: 'SUM' },
    { value: 'AVG', label: 'AVG' },
    { value: 'MIN', label: 'MIN' },
    { value: 'MAX', label: 'MAX' },
    { value: 'DELTA', label: 'DELTA' },
    { value: 'FIRST', label: 'FIRST' },
    { value: 'LAST', label: 'LAST' },
  ]

  const titleValue = ref('')
  const localNodeData = ref<NodeData>({})
  const localNodeId = computed(() => localNodeData.value.id ?? '')

  const localNodeTypeName = computed(() => {
    return getNodeTypeConfig(localNodeData.value.type ?? '')?.name || '未知'
  })

  const selectedDevices = computed<SelectedDevice[]>(() => {
    const devices = modelData.value?.devices
    return Array.isArray(devices) ? devices : []
  })

  const lifecycles = computed<LifecycleConfig[]>(() => {
    const lifecycleConfigs = modelData.value?.lifecycleConfigs
    return Array.isArray(lifecycleConfigs) ? lifecycleConfigs : []
  })

  const triggerNodeOptions = computed(() => {
    const nodes = getGraphData()?.nodes ?? []
    return nodes
      .filter((node) => node.type !== NODE_TYPE.TASK && node.id)
      .map((node) => ({
        value: String(node.id),
        label: node.properties?.title || node.properties?.name || String(node.id),
      }))
  })

  const sampleMetricOptions = computed(() => {
    return selectedDevices.value.map((device) => ({
      value: String(device.id),
      label: device.name,
    }))
  })

  const ensureSelectedDevices = () => {
    if (!Array.isArray(modelData.value.devices)) {
      modelData.value.devices = []
    }

    return modelData.value.devices as SelectedDevice[]
  }

  const ensureLifecycles = () => {
    if (!Array.isArray(modelData.value.lifecycleConfigs)) {
      modelData.value.lifecycleConfigs = []
    }

    return modelData.value.lifecycleConfigs as LifecycleConfig[]
  }

  const createPanelId = (prefix: string) => {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  }

  const createEndCondition = (): EndConditionConfig => ({
    id: createPanelId('end_condition'),
    name: '',
    priority: null,
    condition: createDefaultGroup(),
    triggerNodeIds: [],
  })

  const createAggregation = (): AggregationConfig => ({
    id: createPanelId('aggregation'),
    displayName: '',
    sampleMetric: undefined,
    aggregateFunction: undefined,
    condition: createAggregationConditionGroup(),
  })

  const createLifecycle = (): LifecycleConfig => ({
    id: createPanelId('lifecycle'),
    name: '',
    startCondition: createDefaultGroup(),
    endConditions: [],
    aggregations: [],
  })

  const open = (nodeData: NodeData) => {
    titleValue.value = nodeData.properties?.title || nodeData.properties?.name || ''
    localNodeData.value = nodeData
    if (!nodeConfigs.value[nodeData.id!]) {
      nodeConfigs.value[nodeData.id!] = {}
    }

    try {
      modelData.value = JSON.parse(JSON.stringify(nodeConfigs.value[nodeData.id!]))
    } catch (error) {
      modelData.value = {}
    }

    if (!modelData.value || typeof modelData.value !== 'object') {
      modelData.value = {}
    }

    normalizeLifecycleConfigs()

    visible.value = true
  }

  const handleAddDevice = () => {
    const devices: SelectedDevice[] = []
    for (let index = 1; index <= 10; index += 1) {
      devices.push({
        id: `mock-device-${index}`,
        name: `模拟设备${index}`,
      })
    }
    modelData.value.devices = devices
  }

  const addLifecycle = () => {
    modelData.value.lifecycleConfigs = [...ensureLifecycles(), createLifecycle()]
  }

  const removeLifecycle = (index: number) => {
    const nextLifecycles = ensureLifecycles().slice()
    nextLifecycles.splice(index, 1)
    modelData.value.lifecycleConfigs = nextLifecycles
  }

  const addEndCondition = (lifecycle: LifecycleConfig) => {
    if (!Array.isArray(lifecycle.endConditions)) {
      lifecycle.endConditions = []
    }
    lifecycle.endConditions.push(createEndCondition())
  }

  const removeEndCondition = (lifecycle: LifecycleConfig, index: number) => {
    lifecycle.endConditions.splice(index, 1)
  }

  const addAggregation = (lifecycle: LifecycleConfig) => {
    if (!Array.isArray(lifecycle.aggregations)) {
      lifecycle.aggregations = []
    }
    lifecycle.aggregations.push(createAggregation())
  }

  const removeAggregation = (lifecycle: LifecycleConfig, index: number) => {
    lifecycle.aggregations.splice(index, 1)
  }

  const getSampleMetricLabel = (sampleMetric?: string) => {
    return sampleMetricOptions.value.find((option) => option.value === sampleMetric)?.label || sampleMetric || ''
  }

  // 聚合条件组有特殊约束：所有条件来源固定为设备点位，point 固定同步为当前聚合的采样指标。
  const applyAggregationPoint = (condition: ConditionGroupData, sampleMetric?: string): ConditionGroupData => {
    return {
      ...condition,
      children: condition.children.map((child) => {
        if (child.type === 'group') {
          return applyAggregationPoint(child, sampleMetric)
        }

        return {
          ...child,
          conditionSource: condition_source_point,
          point: sampleMetric,
        }
      }),
    }
  }

  const createAggregationConditionGroup = (sampleMetric?: string) => {
    return applyAggregationPoint(createDefaultGroup(), sampleMetric)
  }

  const onSampleMetricChange = (aggregation: AggregationConfig) => {
    aggregation.condition = applyAggregationPoint(aggregation.condition, aggregation.sampleMetric)
  }

  const normalizeLifecycleConfigs = () => {
    lifecycles.value.forEach((lifecycle) => {
      if (!Array.isArray(lifecycle.endConditions)) {
        lifecycle.endConditions = []
      }
      if (!Array.isArray(lifecycle.aggregations)) {
        lifecycle.aggregations = []
      }
      lifecycle.aggregations.forEach((aggregation) => {
        if (!aggregation.condition) {
          aggregation.condition = createAggregationConditionGroup(aggregation.sampleMetric)
        } else {
          aggregation.condition = applyAggregationPoint(aggregation.condition, aggregation.sampleMetric)
        }
      })
    })
  }

  const removeDevice = (index: number) => {
    const devices = ensureSelectedDevices().slice()
    devices.splice(index, 1)
    modelData.value.devices = devices
  }

  const clearData = () => {
    nextTick(() => {
      localNodeData.value = {}
      titleValue.value = ''
    })
  }

  const handleConfirm = () => {
    const title = titleValue.value.trim()
    emit('update-title', {
      nodeId: localNodeId.value,
      title: title,
    })

    if (localNodeId.value) {
      nodeConfigs.value[localNodeId.value] = modelData.value
    }

    handleClose()
  }

  const handleClose = () => {
    visible.value = false
    clearData()
  }

  defineExpose({
    open,
    close: handleClose,
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

  .section-title-row,
  .block-title-row,
  .lifecycle-header,
  .end-condition-header,
  .aggregation-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .section-title-row {
    margin-bottom: 10px;
    padding-bottom: 8px;
    border-bottom: 1px solid #e8e8e8;

    .section-title {
      margin-bottom: 0;
      padding-bottom: 0;
      border-bottom: none;
    }
  }

  .lifecycle-list,
  .end-condition-list,
  .aggregation-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .lifecycle-card,
  .end-condition-card,
  .aggregation-card {
    padding: 12px;
    background: #fff;
    border: 1px solid #e8e8e8;
    border-radius: 6px;
  }

  .lifecycle-header,
  .end-condition-header,
  .aggregation-header {
    margin-bottom: 12px;
  }

  .lifecycle-title,
  .end-condition-title,
  .aggregation-title,
  .block-title,
  .field-title {
    font-size: 13px;
    font-weight: 600;
    color: #262626;
  }

  .info-row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
  }

  .label {
    flex-shrink: 0;
    width: 72px;
    color: #666;
    font-size: 13px;
  }

  .lifecycle-block {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid #f0f0f0;
  }

  .block-title,
  .block-title-row {
    margin-bottom: 10px;
  }

  .condition-config,
  .trigger-config {
    margin-top: 12px;
  }

  .field-title {
    margin-bottom: 8px;
  }

  .trigger-config :deep(.ant-checkbox-wrapper) {
    margin-inline-start: 0;
    margin-inline-end: 16px;
    margin-bottom: 8px;
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

  .lifecycle-empty {
    margin-top: 0;
    padding: 16px;
  }

  .device-select-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 10px;
  }

  .device-count {
    color: #666;
    font-size: 13px;
  }

  .device-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .device-tags :deep(.ant-tag) {
    margin-inline-end: 0;
    color: #fff;
    background: #1677ff;
    border-color: #1677ff;
  }

  .device-tags :deep(.ant-tag-close-icon) {
    color: rgb(255 255 255 / 75%);
  }

  .device-tags :deep(.ant-tag-close-icon:hover) {
    color: #fff;
  }

  .device-empty {
    margin-top: 0;
    padding: 16px;
  }
</style>
