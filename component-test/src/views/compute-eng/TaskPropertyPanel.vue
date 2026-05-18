<template>
  <a-drawer
    :open="visible"
    title="任务节点属性"
    placement="right"
    :width="600"
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
        <div class="section-title">任务配置</div>
        <div class="empty-tip">
          任务节点配置待开发
        </div>
      </div>

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

      <NodeTimeConfig v-model="modelData.timeConfig" />
    </div>
  </a-drawer>
</template>

<script setup lang="ts">
  import { computed, inject, nextTick, ref, type Ref } from 'vue'
  import { NODE_CONFIGS_KEY } from './symbols'
  import { getNodeTypeConfig } from './menus'
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

  const emit = defineEmits<{
    (e: 'update-title', payload: { nodeId: string; title: string }): void
  }>()

  const visible = ref(false)

  const nodeConfigs = inject<Ref<Record<string, any>>>(NODE_CONFIGS_KEY, ref({}))

  const modelData = ref<any>({})

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

  const ensureSelectedDevices = () => {
    if (!Array.isArray(modelData.value.devices)) {
      modelData.value.devices = []
    }

    return modelData.value.devices as SelectedDevice[]
  }

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

    visible.value = true
  }

  const handleAddDevice = () => {
    // TODO
    const devices: SelectedDevice[] = []
    for (let index = 1; index <= 10; index += 1) {
      devices.push({
        id: `mock-device-${index}`,
        name: `模拟设备${index}`,
      })
    }
    modelData.value.devices = devices
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

  .empty-tip {
    margin-top: 16px;
    padding: 24px;
    text-align: center;
    color: #999;
    font-size: 13px;
    background: #f5f5f5;
    border-radius: 6px;
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
