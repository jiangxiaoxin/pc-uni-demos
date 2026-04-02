<template>
  <div class="my-logic-node">
    <div class="node-left-bar"></div>
    <div class="node-icon">
      <NodeIcon />
    </div>
    <div class="node-content">
      <div class="node-title">{{ title }}</div>
    </div>

    <!-- 右侧功能区 -->
    <div class="node-actions-trigger">
      <a-dropdown>
        <UnorderedListOutlined />
        <template #overlay>
          <a-menu>
            <a-menu-item @click="handleCopy">
              <span>复制节点</span>
            </a-menu-item>
            <a-menu-item @click="handleDelete">
              <span>删除节点</span>
            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, onMounted, onUnmounted } from 'vue'
import { EventType } from '@logicflow/core'
import { vueNodesMap } from '@logicflow/vue-node-registry'
import { Modal } from 'ant-design-vue'
import { UnorderedListOutlined } from '@ant-design/icons-vue'
import NodeIcon from './NodeIcon.vue'

// 注入节点和图形实例
const getNode = inject('getNode') as () => any
const getGraph = inject('getGraph') as () => any

const node = getNode()
const graph = getGraph()

// 节点数据
const nodeData = ref(node.getData())
const title = ref(nodeData.value.properties?.title || '')

// 复制节点
const handleCopy = () => {
  Modal.info({
    title: '复制节点',
    content: `节点 "${title.value}" 的复制功能开发中...`,
    okText: '知道了',
    centered: true,
  })
}

// 删除节点
const handleDelete = () => {
  
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除节点 "${title.value}" 吗？`,
    okText: '删除',
    okType: 'danger',
    cancelText: '取消',
    centered: true,
    onOk: () => {
      graph.deleteNode(node.id)
    },
  })
}

// 监听属性变化
const handlePropertyChange = (eventData: any) => {
  const keys = eventData.keys as string[]
  const content = vueNodesMap[node.type]
  
  if (content && eventData.id === node.id) {
    const { effect } = content
    if (!effect || keys.some((key) => effect?.includes(key))) {
      const newData = node.getData()
      nodeData.value = newData
      title.value = newData.properties?.title || ''
    }
  }
}

onMounted(() => {
  graph.eventCenter.on(EventType.NODE_PROPERTIES_CHANGE, handlePropertyChange)
})

onUnmounted(() => {
  graph.eventCenter.off(EventType.NODE_PROPERTIES_CHANGE, handlePropertyChange)
})
</script>

<style scoped lang="scss">
@import url(../style.scss);
</style>
