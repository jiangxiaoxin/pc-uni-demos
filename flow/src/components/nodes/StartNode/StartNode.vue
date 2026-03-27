<template>
  <div class="my-logic-node">
    <div class="node-left-bar"></div>
    <div class="node-icon">
      <StartNodeIcon />
    </div>
    <div class="node-content">
      <div class="node-title">{{ title }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, onMounted, onUnmounted } from 'vue'
import { EventType } from '@logicflow/core'
import { vueNodesMap } from '@logicflow/vue-node-registry'
import StartNodeIcon from './StartNodeIcon.vue'

// 注入节点和图形实例
const getNode = inject('getNode') as () => any
const getGraph = inject('getGraph') as () => any

const node = getNode()
const graph = getGraph()

// 节点数据
// const nodeData = ref(node.getData())
const title = ref(node.getData()?.properties?.title || '')

// 监听属性变化
const handlePropertyChange = (eventData: any) => {
  const keys = eventData.keys as string[]
  const content = vueNodesMap[node.type]
  
  if (content && eventData.id === node.id) {
    const { effect } = content
    if (!effect || keys.some((key) => effect?.includes(key))) {
      const newData = node.getData()
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

.node-left-bar {
    background-color: rgb(78, 184, 92);
}
</style>
