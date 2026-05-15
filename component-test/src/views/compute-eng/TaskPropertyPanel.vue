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
    </div>
  </a-drawer>
</template>

<script setup lang="ts">
  import { computed, inject, nextTick, ref, type Ref } from 'vue'
  import { NODE_CONFIGS_KEY } from './symbols'
  import { getNodeTypeConfig } from './menus'
  import NodeBaseConfig from './NodeBaseConfig.vue'

  interface NodeData {
    id?: string
    type?: string
    properties?: Record<string, any>
    [key: string]: any
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

    visible.value = true
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
</style>
