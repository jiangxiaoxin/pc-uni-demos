<template>
  <div
    class="sql-node"
    :style="{ width: nodeWidth + 'px', height: nodeHeight + 'px' }"
  >
    <!-- 左侧颜色条 -->
    <div
      class="node-left-bar"
      :style="{ backgroundColor: nodeColor }"
    ></div>

    <!-- 图标区域 -->
    <div class="node-icon" :style="{ backgroundColor: iconBgColor }">
      <component :is="nodeIcon" v-if="typeof nodeIcon === 'object'" />
      <span v-else class="icon-text">{{ nodeIcon }}</span>
    </div>

    <!-- 标题 -->
    <div class="node-title">{{ nodeTitle }}</div>

    <!-- 右侧操作菜单 -->
    <div class="node-actions-trigger">
      <a-dropdown>
        <UnorderedListOutlined />
        <template #overlay>
          <a-menu>
            <a-menu-item @click="handleDelete" class="delete-menu-item">
              <span class="delete-text">删除节点</span>
            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject, onMounted, onUnmounted } from 'vue'
import { EventType } from '@logicflow/core'
import { vueNodesMap } from '@logicflow/vue-node-registry'
import { Modal } from 'ant-design-vue'
import { UnorderedListOutlined } from '@ant-design/icons-vue'
import DatabaseOutlined from './icons/DatabaseOutlined.vue'
import ExportOutlined from './icons/ExportOutlined.vue'
import JoinInnerOutlined from './icons/JoinInnerOutlined.vue'
import MergeTypeOutlined from './icons/MergeTypeOutlined.vue'
import FunctionsOutlined from './icons/FunctionsOutlined.vue'
import FilterAltOutlined from './icons/FilterAltOutlined.vue'
import TextFieldsOutlined from './icons/TextFieldsOutlined.vue'
import ContentCutOutlined from './icons/ContentCutOutlined.vue'

// 注入节点和图形实例
const getNode = inject('getNode') as () => any
const getGraph = inject('getGraph') as () => any

const node = getNode()
const graph = getGraph()

// 节点数据
const nodeData = ref(node.getData())
console.log("🚀 ~ SqlNode.vue:61 ~ nodeData:", nodeData)


// 计算属性
const nodeTitle = computed(() => {
  
  return nodeData.value.properties?.title || nodeData.value.properties?.name || '未命名'
})

const nodeColor = computed(() => {
  return nodeData.value.properties?.color || '#1890ff'
})

const nodeWidth = computed(() => {
  return nodeData.value.properties?.width || 180
})

const nodeHeight = computed(() => {
  return nodeData.value.properties?.height || 40
})

const iconBgColor = computed(() => {
  const color = nodeColor.value
  // 将颜色转换为 rgba 并设置透明度
  return color + '1A' // 10% 透明度 (1A in hex)
})

// 图标映射
const iconMap: Record<string, any> = {
  'in-node': DatabaseOutlined,
  'out-node': ExportOutlined,
  'join-node': JoinInnerOutlined,
  'union-node': MergeTypeOutlined,
  'group-node': FunctionsOutlined,
  'where-node': FilterAltOutlined,
  'field-node': TextFieldsOutlined,
  'distinct-node': ContentCutOutlined,
}

const nodeIcon = computed(() => {
  const type = nodeData.value.type
  return iconMap[type] || '?'
})

// 删除节点
const handleDelete = () => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除节点 "${nodeTitle.value}" 吗？`,
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
.sql-node {
  display: flex;
  align-items: center;
  background: #fff;
  border: 1px solid #d9d9d9;
  // border-radius: 8px;
  padding: 0 12px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
  transition: all 0.2s;

  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    border-color: #bfbfbf;
  }
}

.node-left-bar {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  // border-radius: 8px 0 0 8px;
}

.node-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 4px;
  margin-right: 8px;
  flex-shrink: 0;
  font-size: 12px;
  color: inherit;
}

.icon-text {
  font-size: 12px;
  font-weight: 600;
  color: #262626;
}

.node-title {
  flex: 1;
  font-size: 13px;
  font-weight: 500;
  color: #262626;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.node-actions-trigger {
  margin-left: 8px;
  cursor: pointer;
  color: #8c8c8c;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    color: #262626;
    background: rgba(0, 0, 0, 0.04);
  }
}

.delete-menu-item:hover .delete-text {
  color: #ff4d4f;
}

.delete-text {
  color: #ff4d4f;
}
</style>
