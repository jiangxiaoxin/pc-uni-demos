<template>
  <view class="container">
    <button @click="toPage">navigate</button>
    <button @click="toParent">child给parent发</button>
    <view class="header">
      <text class="title">低代码表单渲染器</text>
    </view>
    
    <view class="status-bar">
      <text class="status-text" :class="connectionStatus">
        {{ statusText }}
      </text>
    </view>

    <!-- 视图切换标签 -->
    <view class="view-tabs">
      <view 
        class="tab-item" 
        :class="{ active: currentView === 'form' }"
        @click="switchView('form')"
      >
        <text class="tab-text">表单视图</text>
      </view>
      <view 
        class="tab-item" 
        :class="{ active: currentView === 'json' }"
        @click="switchView('json')"
      >
        <text class="tab-text">JSON 视图</text>
      </view>
      <view 
        class="tab-item" 
        :class="{ active: currentView === 'schema' }"
        @click="switchView('schema')"
      >
        <text class="tab-text">Schema 配置</text>
      </view>
    </view>

    <!-- 调试信息 -->
    <view class="debug-section" v-if="showDebug">
      <view class="debug-header">
        <text class="debug-title">调试信息：</text>
        <text class="debug-toggle" @click="showDebug = false">收起</text>
      </view>
      <text class="debug-text">{{ debugInfo }}</text>
    </view>
    <view v-else class="debug-collapsed" @click="showDebug = true">
      <text class="debug-toggle">展开调试信息</text>
    </view>

    <!-- 空状态 -->
    <view v-if="!hasData && !isExampleMode" class="empty-state">
      <text class="empty-text">等待接收数据...</text>
      <text class="empty-hint">请在 myEditor 中输入 JSON Schema 配置并发送</text>
      <text class="empty-tip">或点击下方按钮加载示例配置</text>
      <view class="example-buttons">
        <u-button type="primary" size="default" @click="loadExample" custom-style="margin: 10rpx;">
          (labelWidth: 100)
        </u-button>
        <u-button type="success" size="default" @click="loadNarrowExample" custom-style="margin: 10rpx;">
          (labelWidth: 70)
        </u-button>
      </view>
    </view>

    <template v-else>
      <!-- 表单视图 -->
      <view v-if="currentView === 'form'" class="content">
        <form-renderer
          v-if="isValidSchema"
          ref="formRendererRef"
          :schema="formSchema"
          v-model="formData"
          @submit="handleFormSubmit"
          @reset="handleFormReset"
          @change="handleFormChange"
          @action="handleFormAction"
        />
        <view v-else class="error-state">
          <u-icon name="error-circle" size="64" color="#ff6b6b" />
          <text class="error-title">Schema 格式错误</text>
          <text class="error-hint">请检查接收到的 JSON 是否为有效的表单配置</text>
          <view class="error-detail">
            <text class="error-text">{{ schemaError }}</text>
          </view>
        </view>
      </view>

      <!-- JSON 视图 -->
      <view v-else-if="currentView === 'json'" class="content">
        <view class="section-title">接收到的原始数据：</view>
        <view class="json-tree">
          <json-node :data="jsonData" :level="0" />
        </view>
      </view>

      <!-- Schema 配置视图 -->
      <view v-else-if="currentView === 'schema'" class="content">
        <view class="section-title">表单 Schema 配置：</view>
        <view class="schema-actions">
          <u-button type="info" size="small" @click="copySchema">
            复制配置
          </u-button>
        </view>
        <view class="raw-json">
          <text class="raw-text">{{ formattedSchema }}</text>
        </view>
      </view>
    </template>

    <!-- 提交结果提示 -->
    <u-toast ref="toastRef" />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import JsonNode from './components/JsonNode.vue'
import FormRenderer from '@/components/form-renderer/FormRenderer.vue'
import type { FormSchema, FormAction } from '@/components/form-renderer/types'
import { exampleSchema, narrowLabelSchema } from '@/constants/example-schema'

const toPage = () => {
  console.log('uni', uni);
  
  uni.navigateTo({
    url: "/pages/uni-editor/uni-editor"
  })
}

const toParent = () => {
  // #ifdef H5
  window.parent.postMessage('hello from child', '*')

  // #endif
}

// 视图状态
const currentView = ref<'form' | 'json' | 'schema'>('form')
const showDebug = ref(false)

// 数据状态
const jsonData = ref<unknown>(null)
const formSchema = ref<FormSchema | null>(null)
const formData = ref<Record<string, any>>({})
const isExampleMode = ref(false)
const schemaError = ref('')

// 连接状态
const connectionStatus = ref('waiting')
const statusText = ref('初始化中...')
const debugInfo = ref('页面加载中...')
const lastTimestamp = ref(0)

// 引用
const formRendererRef = ref()
const toastRef = ref()

const SERVER_URL = 'http://localhost:3000'

let isPolling = false
let abortController: AbortController | null = null

// 计算属性
const hasData = computed(() => jsonData.value !== null)

const isValidSchema = computed(() => {
  return formSchema.value && formSchema.value.fields && Array.isArray(formSchema.value.fields)
})

const formattedSchema = computed(() => {
  if (!formSchema.value) return ''
  return JSON.stringify(formSchema.value, null, 2)
})

// 切换视图
const switchView = (view: 'form' | 'json' | 'schema') => {
  currentView.value = view
}

// 加载示例配置
const loadExample = () => {
  isExampleMode.value = true
  formSchema.value = exampleSchema
  jsonData.value = { type: 'form-schema', data: exampleSchema }
  connectionStatus.value = 'connected'
  statusText.value = '已加载示例配置'
  debugInfo.value += '\n📋 已加载示例表单配置 (labelWidth: 100rpx)'
  currentView.value = 'form'
  
  uni.showToast({
    title: '标准表单已加载',
    icon: 'success'
  })
}

// 加载窄标签示例
const loadNarrowExample = () => {
  isExampleMode.value = true
  formSchema.value = narrowLabelSchema
  jsonData.value = { type: 'form-schema', data: narrowLabelSchema }
  connectionStatus.value = 'connected'
  statusText.value = '已加载窄标签示例'
  debugInfo.value += '\n📋 已加载窄标签表单配置 (labelWidth: 70rpx)'
  currentView.value = 'form'
  
  uni.showToast({
    title: '窄标签表单已加载',
    icon: 'success'
  })
}

// 复制 Schema
const copySchema = () => {
  uni.setClipboardData({
    data: formattedSchema.value,
    success: () => {
      uni.showToast({
        title: '已复制到剪贴板',
        icon: 'success'
      })
    }
  })
}

// 解析 Schema
const parseSchema = (data: any): FormSchema | null => {
  try {
    schemaError.value = ''
    
    // 如果是包装格式 { type: 'form-schema', data: {...} }
    if (data && data.type === 'form-schema' && data.data) {
      return data.data as FormSchema
    }
    
    // 如果是直接的 schema 对象
    if (data && Array.isArray(data.fields)) {
      return data as FormSchema
    }
    
    schemaError.value = 'Schema 必须包含 fields 数组字段'
    return null
  } catch (error) {
    schemaError.value = String(error)
    return null
  }
}

// 处理表单提交
const handleFormSubmit = (result: { values: Record<string, any>; valid: boolean; errors?: any[] }) => {
  console.log('[FormRenderer] 提交结果:', result)
  
  if (result.valid) {
    uni.showToast({
      title: '提交成功',
      icon: 'success'
    })
    
    // 发送到消息服务器（可选）
    fetch(`${SERVER_URL}/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'form-submit',
        data: result.values,
        timestamp: Date.now()
      })
    }).catch(err => console.error('发送失败:', err))
    
  } else {
    uni.showToast({
      title: '请检查表单填写',
      icon: 'none'
    })
  }
}

// 处理表单重置
const handleFormReset = () => {
  console.log('[FormRenderer] 表单已重置')
  uni.showToast({
    title: '表单已重置',
    icon: 'none'
  })
}

// 处理表单字段变化
const handleFormChange = (field: string, value: any) => {
  console.log(`[FormRenderer] 字段变化: ${field} =`, value)
}

// 处理自定义操作
const handleFormAction = (action: FormAction, values: Record<string, any>) => {
  console.log('[FormRenderer] 自定义操作:', action, values)
  
  if (action.event === 'custom-save') {
    uni.showModal({
      title: '自定义操作',
      content: `触发了 ${action.text} 操作`,
      showCancel: false
    })
  }
}

// 长轮询接收消息
const startPolling = async () => {
  if (isPolling) return
  isPolling = true
  connectionStatus.value = 'ready'
  statusText.value = '正在监听消息...'
  debugInfo.value = '✅ 开始长轮询监听'

  while (isPolling) {
    try {
      abortController = new AbortController()
      
      const response = await fetch(
        `${SERVER_URL}/receive?timestamp=${lastTimestamp.value}`,
        { signal: abortController.signal }
      )

      if (!response.ok) {
        throw new Error('服务器错误')
      }

      const result = await response.json()

      if (result.hasNewMessage && result.data) {
        console.log('[Viewer] 收到消息:', result.data)
        debugInfo.value += `\n📨 收到: ${JSON.stringify(result.data).substring(0, 80)}`
        
        // 处理表单 schema 数据
        if (result.data.type === 'form-schema' || (result.data.data && result.data.data.fields)) {
          jsonData.value = result.data
          const schema = parseSchema(result.data)
          
          if (schema) {
            formSchema.value = schema
            isExampleMode.value = false
            connectionStatus.value = 'connected'
            statusText.value = '已接收表单配置'
            currentView.value = 'form'
            
            uni.showToast({
              title: '收到新表单配置',
              icon: 'success',
              duration: 2000
            })
          } else {
            connectionStatus.value = 'error'
            statusText.value = 'Schema 格式错误'
            uni.showToast({
              title: 'Schema 格式错误',
              icon: 'none'
            })
          }
        } else if (result.data.type === 'json-data') {
          // 兼容旧的 JSON 数据格式
          jsonData.value = result.data.data
        }
        
        lastTimestamp.value = result.timestamp
      }
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        break
      }
      console.error('[Viewer] 轮询错误:', error)
      debugInfo.value += '\n❌ 错误: ' + (error as Error).message
      statusText.value = '连接错误，5秒后重试...'
      
      await new Promise(resolve => setTimeout(resolve, 5000))
    }
  }
}

onMounted(() => {
  console.log('[Viewer] 页面挂载，启动消息监听...')
  startPolling()

  window.addEventListener('message', (evt) => {
    console.log("🚀 ~ index.vue:375 ~ evt:", evt)
    alert("child 收到了")
    
  })

})

onUnmounted(() => {
  isPolling = false
  if (abortController) {
    abortController.abort()
  }
})
</script>


<style lang="scss">
.container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 40rpx;
}

.header {
  text-align: center;
  padding: 30rpx 0;
  background-color: #fff;
}

.title {
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
}

.status-bar {
  text-align: center;
  padding: 20rpx;
  background-color: #fff;
  margin-bottom: 20rpx;
}

.status-text {
  font-size: 28rpx;
  padding: 10rpx 30rpx;
  border-radius: 30rpx;
  background-color: #e0e0e0;
}

.status-text.waiting {
  background-color: #fff3cd;
  color: #856404;
}

.status-text.ready {
  background-color: #d1ecf1;
  color: #0c5460;
}

.status-text.connected {
  background-color: #d4edda;
  color: #155724;
}

.status-text.error {
  background-color: #f8d7da;
  color: #721c24;
}

.view-tabs {
  display: flex;
  background-color: #fff;
  margin-bottom: 20rpx;
  border-bottom: 1rpx solid #e0e0e0;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 24rpx 0;
  position: relative;
}

.tab-item.active {
  background-color: #f0f7ff;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 20%;
  right: 20%;
  height: 4rpx;
  background-color: #2979ff;
}

.tab-text {
  font-size: 28rpx;
  color: #666;
}

.tab-item.active .tab-text {
  color: #2979ff;
  font-weight: bold;
}

.debug-section {
  background-color: #f0f0f0;
  border: 1rpx solid #ddd;
  border-radius: 12rpx;
  padding: 20rpx;
  margin: 0 20rpx 20rpx;
}

.debug-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10rpx;
}

.debug-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #666;
}

.debug-toggle {
  font-size: 24rpx;
  color: #2979ff;
}

.debug-collapsed {
  text-align: center;
  padding: 20rpx;
}

.debug-text {
  font-size: 24rpx;
  color: #333;
  font-family: monospace;
  white-space: pre-wrap;
  word-break: break-all;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 40rpx;
  background-color: #fff;
  margin: 20rpx;
  border-radius: 16rpx;
}

.empty-text {
  font-size: 36rpx;
  color: #666;
  margin-bottom: 20rpx;
}

.empty-hint {
  font-size: 28rpx;
  color: #999;
  margin-bottom: 10rpx;
}

.empty-tip {
  font-size: 24rpx;
  color: #ff6b6b;
  margin-bottom: 20rpx;
}

.example-buttons {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 20rpx;
}

.content {
  margin: 0 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
  display: block;
}

.schema-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20rpx;
}

.json-tree {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 20rpx;
}

.raw-json {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 20rpx;
  max-height: 800rpx;
  overflow: auto;
}

.raw-text {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 24rpx;
  color: #333;
  white-space: pre-wrap;
  word-break: break-all;
}

.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 100rpx 40rpx;
  background-color: #fff;
  border-radius: 16rpx;
}

.error-title {
  font-size: 36rpx;
  color: #ff6b6b;
  margin-top: 30rpx;
  margin-bottom: 20rpx;
}

.error-hint {
  font-size: 28rpx;
  color: #999;
  margin-bottom: 30rpx;
}

.error-detail {
  background-color: #fff5f5;
  border: 1rpx solid #ffcccc;
  border-radius: 12rpx;
  padding: 20rpx;
  width: 100%;
}

.error-text {
  font-size: 26rpx;
  color: #ff6b6b;
  word-break: break-all;
}
</style>
