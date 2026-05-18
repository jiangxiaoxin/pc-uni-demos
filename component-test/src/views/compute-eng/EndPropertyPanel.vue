<template>
  <a-drawer
    :open="visible"
    title="结束节点属性"
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
    </div>
  </a-drawer>
</template>

<script setup lang="ts">
  import { computed, nextTick, ref } from 'vue'
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

  const titleValue = ref('')
  const localNodeData = ref<NodeData>({})
  const localNodeId = computed(() => localNodeData.value.id ?? '')

  const localNodeTypeName = computed(() => {
    return getNodeTypeConfig(localNodeData.value.type ?? '')?.name || '未知'
  })

  const open = (nodeData: NodeData) => {
    titleValue.value = nodeData.properties?.title || nodeData.properties?.name || ''
    localNodeData.value = nodeData

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
      title,
    })

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
