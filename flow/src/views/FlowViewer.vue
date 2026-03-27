<template>
  <div class="flow-viewer">
    <!-- 工具栏 -->
    <div class="toolbar">
      <a-space>
        <a-button @click="handleZoomIn">
          <template #icon><zoom-in-outlined /></template>
          放大
        </a-button>
        <a-button @click="handleZoomOut">
          <template #icon><zoom-out-outlined /></template>
          缩小
        </a-button>
        <a-button type="primary" @click="handleFitView">
          <template #icon><fullscreen-outlined /></template>
          适应屏幕
        </a-button>
        <a-button @click="handleReset">
          <template #icon><reload-outlined /></template>
          重置
        </a-button>
        <a-divider type="vertical" />
        <a-button @click="goBack">
          <template #icon><arrow-left-outlined /></template>
          返回编辑器
        </a-button>
      </a-space>
    </div>

    <div class="canvas-wrapper">
      <LogicFlowPanel
        ref="lfPanelRef"
        readonly
        :init-data="initData"
        @node:click="handleNodeClick"
        @blank:click="handleBlankClick"
      />
    </div>

    <!-- 节点详情弹窗 -->
    <a-modal
      v-model:open="detailVisible"
      :title="selectedNode?.text || '节点详情'"
      :footer="null"
      width="400px"
      @cancel="detailVisible = false"
    >
      <div v-if="selectedNode" class="node-detail-panel">
        <!-- 自定义节点展示 -->
        <template v-if="selectedNode.type === 'my-logic-node'">
          <div class="node-preview" :class="`status-${selectedNode.properties?.status || 'default'}`">
            <div class="preview-left-bar"></div>
            <div class="preview-icon">{{ selectedNode.properties?.icon || '◆' }}</div>
            <div class="preview-content">
              <div class="preview-title">{{ selectedNode.text }}</div>
              <div class="preview-desc">{{ selectedNode.properties?.description || '暂无描述' }}</div>
            </div>
          </div>
          
          <a-divider />
          
          <a-descriptions :column="1" size="small" bordered>
            <a-descriptions-item label="节点ID">{{ selectedNode.id }}</a-descriptions-item>
            <a-descriptions-item label="节点类型">
              <a-tag color="blue">业务节点</a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="状态">
              <a-tag :color="getStatusColor(selectedNode.properties?.status)">
                {{ getStatusLabel(selectedNode.properties?.status) }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="图标">{{ selectedNode.properties?.icon || '◆' }}</a-descriptions-item>
            <a-descriptions-item label="描述">{{ selectedNode.properties?.description || '暂无描述' }}</a-descriptions-item>
            <a-descriptions-item label="尺寸">
              {{ selectedNode.properties?.width || 180 }} x {{ selectedNode.properties?.height || 80 }}
            </a-descriptions-item>
            <a-descriptions-item label="位置">
              X: {{ Math.round(selectedNode.x) }}, Y: {{ Math.round(selectedNode.y) }}
            </a-descriptions-item>
          </a-descriptions>
        </template>
        
        <!-- 普通节点展示 -->
        <template v-else>
          <a-descriptions :column="1" size="small" bordered>
            <a-descriptions-item label="节点ID">{{ selectedNode.id }}</a-descriptions-item>
            <a-descriptions-item label="节点类型">
              <a-tag>{{ selectedNode.type }}</a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="文本">{{ selectedNode.text }}</a-descriptions-item>
            <a-descriptions-item label="位置">
              X: {{ Math.round(selectedNode.x) }}, Y: {{ Math.round(selectedNode.y) }}
            </a-descriptions-item>
          </a-descriptions>
        </template>
        
        <a-divider />
        
        <div class="raw-data">
          <div class="raw-data-title">原始数据：</div>
          <pre>{{ JSON.stringify(selectedNode, null, 2) }}</pre>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  ZoomInOutlined,
  ZoomOutOutlined,
  FullscreenOutlined,
  ReloadOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons-vue'
import LogicFlowPanel from '../components/LogicFlowPanel.vue'

const router = useRouter()
const lfPanelRef = ref<InstanceType<typeof LogicFlowPanel>>()
const initData = ref<any>(null)
const selectedNode = ref<any>(null)
const detailVisible = ref(false)

// 状态映射
const statusMap: Record<string, { label: string; color: string }> = {
  default: { label: '默认', color: 'default' },
  success: { label: '成功', color: 'success' },
  error: { label: '失败', color: 'error' },
  warning: { label: '警告', color: 'warning' },
  running: { label: '运行中', color: 'processing' },
}

const getStatusLabel = (status: string) => statusMap[status]?.label || status
const getStatusColor = (status: string) => statusMap[status]?.color || 'default'

// 缩放控制
const handleZoomIn = () => lfPanelRef.value?.zoomIn()
const handleZoomOut = () => lfPanelRef.value?.zoomOut()
const handleFitView = () => lfPanelRef.value?.fitView()
const handleReset = () => lfPanelRef.value?.resetZoom()

// 节点点击 - 显示详情
const handleNodeClick = (data: any) => {
  selectedNode.value = data
  detailVisible.value = true
}

// 空白处点击 - 关闭弹窗
const handleBlankClick = () => {
  detailVisible.value = false
}

// 返回编辑器
const goBack = () => router.push('/')

// 创建示例数据
const createSampleData = () => ({
  nodes: [
    {
      id: 'start',
      type: 'my-logic-node',
      x: 100,
      y: 200,
      text: '开始',
      properties: { 
        status: 'success',
        icon: '▶',
        description: '流程启动',
        width: 140,
        height: 60,
      },
    },
    {
      id: 'input',
      type: 'my-logic-node',
      x: 280,
      y: 200,
      text: '数据输入',
      properties: { 
        status: 'default',
        icon: '📥',
        description: '接收用户数据',
        width: 160,
        height: 70,
      },
    },
    {
      id: 'validate',
      type: 'my-logic-node',
      x: 480,
      y: 200,
      text: '数据验证',
      properties: { 
        status: 'running',
        icon: '🔍',
        description: '验证数据格式',
        width: 160,
        height: 70,
      },
    },
    {
      id: 'check',
      type: 'my-logic-node',
      x: 680,
      y: 200,
      text: '有效性检查',
      properties: { 
        status: 'warning',
        icon: '⚠️',
        description: '检查数据有效性',
        width: 160,
        height: 70,
      },
    },
    {
      id: 'process',
      type: 'my-logic-node',
      x: 480,
      y: 360,
      text: '数据处理',
      properties: { 
        status: 'default',
        icon: '⚙️',
        description: '执行业务逻辑',
        width: 160,
        height: 70,
      },
    },
    {
      id: 'save',
      type: 'my-logic-node',
      x: 280,
      y: 360,
      text: '保存数据',
      properties: { 
        status: 'success',
        icon: '💾',
        description: '持久化存储',
        width: 160,
        height: 70,
      },
    },
    {
      id: 'error',
      type: 'my-logic-node',
      x: 680,
      y: 360,
      text: '错误处理',
      properties: { 
        status: 'error',
        icon: '❌',
        description: '处理异常情况',
        width: 160,
        height: 70,
      },
    },
    {
      id: 'notify',
      type: 'my-logic-node',
      x: 100,
      y: 360,
      text: '发送通知',
      properties: { 
        status: 'default',
        icon: '📧',
        description: '通知用户结果',
        width: 160,
        height: 70,
      },
    },
    {
      id: 'end',
      type: 'my-logic-node',
      x: 100,
      y: 520,
      text: '结束',
      properties: { 
        status: 'success',
        icon: '🏁',
        description: '流程完成',
        width: 140,
        height: 60,
      },
    },
  ],
  edges: [
    { sourceNodeId: 'start', targetNodeId: 'input', type: 'polyline' },
    { sourceNodeId: 'input', targetNodeId: 'validate', type: 'polyline' },
    { sourceNodeId: 'validate', targetNodeId: 'check', type: 'polyline' },
    { sourceNodeId: 'check', targetNodeId: 'process', type: 'polyline', text: '有效' },
    { sourceNodeId: 'check', targetNodeId: 'error', type: 'polyline', text: '无效' },
    { sourceNodeId: 'process', targetNodeId: 'save', type: 'polyline' },
    { sourceNodeId: 'save', targetNodeId: 'notify', type: 'polyline' },
    { sourceNodeId: 'notify', targetNodeId: 'end', type: 'polyline' },
    { sourceNodeId: 'error', targetNodeId: 'notify', type: 'polyline' },
  ],
})

// 加载数据
onMounted(() => {
  const saved = localStorage.getItem('flowData')
  if (saved) {
    initData.value = JSON.parse(saved)
    message.success('已加载保存的流程图')
  } else {
    initData.value = createSampleData()
    message.info('已加载示例流程图（包含 9 个自定义节点）')
  }
  
  // 自动适应屏幕
  setTimeout(() => handleFitView(), 100)
})
</script>

<style scoped>
.flow-viewer {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.toolbar {
  padding: 12px 16px;
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
}

.canvas-wrapper {
  flex: 1;
  position: relative;
}

.node-detail-panel {
  padding: 8px 0;
}

/* 节点预览样式 */
.node-preview {
  display: flex;
  align-items: center;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #d9d9d9;
  background: #fff;
  position: relative;
  overflow: hidden;
}

.preview-left-bar {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
}

.preview-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  margin-right: 12px;
  flex-shrink: 0;
}

.preview-content {
  flex: 1;
}

.preview-title {
  font-size: 16px;
  font-weight: 600;
  color: #262626;
}

.preview-desc {
  font-size: 13px;
  color: #8c8c8c;
  margin-top: 4px;
}

/* 状态样式 */
.status-default { background: #fafafa; border-color: #d9d9d9; }
.status-default .preview-left-bar { background: #bfbfbf; }
.status-default .preview-icon { background: rgba(191, 191, 191, 0.15); }

.status-success { background: #f6ffed; border-color: #b7eb8f; }
.status-success .preview-left-bar { background: #52c41a; }
.status-success .preview-icon { background: rgba(82, 196, 26, 0.15); }

.status-error { background: #fff2f0; border-color: #ffccc7; }
.status-error .preview-left-bar { background: #ff4d4f; }
.status-error .preview-icon { background: rgba(255, 77, 79, 0.15); }

.status-warning { background: #fffbe6; border-color: #ffe58f; }
.status-warning .preview-left-bar { background: #faad14; }
.status-warning .preview-icon { background: rgba(250, 173, 20, 0.15); }

.status-running { background: #e6f7ff; border-color: #91d5ff; }
.status-running .preview-left-bar { background: #1890ff; }
.status-running .preview-icon { background: rgba(24, 144, 255, 0.15); }

/* 原始数据 */
.raw-data {
  margin-top: 8px;
}

.raw-data-title {
  font-size: 12px;
  color: #8c8c8c;
  margin-bottom: 8px;
}

.raw-data pre {
  max-height: 200px;
  overflow: auto;
  font-size: 11px;
  background: #f5f5f5;
  padding: 12px;
  border-radius: 4px;
  margin: 0;
}
</style>
