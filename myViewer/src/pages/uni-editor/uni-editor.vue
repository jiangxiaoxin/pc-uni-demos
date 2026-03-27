<template>
  <view class="uni-editor">
    <!-- 左侧组件列表 -->
    <view class="left-panel">
      <view class="panel-header">组件库</view>
      <scroll-view class="component-list" scroll-y :scroll-top="0">
        <view class="component-grid">
          <view
            v-for="comp in componentList"
            :key="comp.name"
            class="component-card"
            @click="addComponent(comp)"
          >
            <view class="card-name">{{ comp.label }}</view>
            <view class="card-en">{{ comp.name }}</view>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 中间编辑器区域 - 手机预览 -->
    <view class="center-panel">
      <view class="panel-header">
        编辑区域
        <text v-if="selectedIndex !== -1" class="header-tip">
          已选中: {{ editorComponents[selectedIndex]?.label }}
        </text>
      </view>
      <view class="phone-preview-area">
        <!-- 手机外框 -->
        <view class="phone-frame">
          <!-- 手机状态栏 -->
          <view class="phone-status-bar">
            <text class="time">9:41</text>
            <view class="status-icons">
              <text>📶</text>
              <text>🔋</text>
            </view>
          </view>
          
          <!-- 手机内容区域 -->
          <scroll-view class="phone-screen" scroll-y @click="handlePhoneClick">
            <view
              v-for="(comp, index) in editorComponents"
              :key="comp.id"
              class="phone-component"
              :class="{ active: selectedIndex === index }"
              @click.stop="selectComponent(index)"
            >
              <!-- 操作按钮 - 只在选中时显示 -->
              <view v-if="selectedIndex === index" class="component-actions">
                <view 
                  class="action-btn" 
                  :class="{ disabled: index === 0 }"
                  @click.stop="moveUp(index)"
                >
                  <text class="btn-icon">↑</text>
                </view>
                <view 
                  class="action-btn" 
                  :class="{ disabled: index === editorComponents.length - 1 }"
                  @click.stop="moveDown(index)"
                >
                  <text class="btn-icon">↓</text>
                </view>
                <view class="action-btn delete" @click.stop="deleteComponent(index)">
                  <text class="btn-icon">×</text>
                </view>
              </view>
              
              <!-- 选中指示器 -->
              <view v-if="selectedIndex === index" class="selected-indicator">
                <text>{{ comp.label }}</text>
              </view>
              
              <!-- 组件预览 -->
              <view class="component-render">
                <component-preview :type="comp.name" :props="comp.defaultProps" />
              </view>
            </view>
            
            <!-- 空状态 -->
            <view v-if="editorComponents.length === 0" class="phone-empty" @click.stop>
              <text class="empty-icon">📱</text>
              <text class="empty-text">点击左侧组件添加</text>
            </view>
            
            <!-- 底部安全区域 -->
            <view class="safe-area-bottom"></view>
          </scroll-view>
          
          <!-- 底部指示条 -->
          <view class="phone-home-indicator"></view>
        </view>
      </view>
    </view>

    <!-- 右侧属性面板 -->
    <view class="right-panel">
      <view class="panel-header">属性面板</view>
      <scroll-view class="props-panel" scroll-y>
        <view v-if="selectedComponent" class="props-content">
          <view class="prop-item">
            <label>中文名称</label>
            <view class="prop-value">{{ selectedComponent.label }}</view>
          </view>
          <view class="prop-item">
            <label>英文名称</label>
            <view class="prop-value">{{ selectedComponent.name }}</view>
          </view>
          <view class="prop-item">
            <label>组件ID</label>
            <view class="prop-value">{{ selectedComponent.id }}</view>
          </view>
        </view>
        <view v-else class="empty-tip">
          请选中一个组件
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import ComponentPreview from './components/ComponentPreview.vue'

interface ComponentInfo {
  name: string
  label: string
  defaultProps?: Record<string, any>
}

interface EditorComponent extends ComponentInfo {
  id: string
}

// uview-pro 组件列表
const componentList: ComponentInfo[] = [
  { name: 'u-button', label: '按钮', defaultProps: { text: '按钮' } },
  { name: 'u-input', label: '输入框', defaultProps: { placeholder: '请输入' } },
  { name: 'u-picker', label: '选择器', defaultProps: {} },
  { name: 'u-search', label: '搜索框', defaultProps: {} },
  { name: 'u-switch', label: '开关', defaultProps: {} },
]

// 编辑器中的组件列表
const editorComponents = ref<EditorComponent[]>([])
const selectedIndex = ref(-1)

// 选中的组件
const selectedComponent = computed(() => {
  if (selectedIndex.value === -1) return null
  return editorComponents.value[selectedIndex.value]
})

// 生成唯一ID
let idCounter = 0
const generateId = () => `comp_${Date.now()}_${++idCounter}`

// 添加组件
const addComponent = (comp: ComponentInfo) => {
  editorComponents.value.push({
    ...comp,
    id: generateId(),
  })
  // 自动选中新添加的组件
  selectedIndex.value = editorComponents.value.length - 1
}

// 选中组件
const selectComponent = (index: number) => {
  selectedIndex.value = index
}

// 处理手机区域点击 - 点击空白处取消选中
const handlePhoneClick = () => {
  selectedIndex.value = -1
}

// 上移
const moveUp = (index: number) => {
  if (index === 0) return
  const temp = editorComponents.value[index]
  editorComponents.value[index] = editorComponents.value[index - 1]
  editorComponents.value[index - 1] = temp
  selectedIndex.value = index - 1
}

// 下移
const moveDown = (index: number) => {
  if (index === editorComponents.value.length - 1) return
  const temp = editorComponents.value[index]
  editorComponents.value[index] = editorComponents.value[index + 1]
  editorComponents.value[index + 1] = temp
  selectedIndex.value = index + 1
}

// 删除组件
const deleteComponent = (index: number) => {
  editorComponents.value.splice(index, 1)
  if (selectedIndex.value >= editorComponents.value.length) {
    selectedIndex.value = editorComponents.value.length - 1
  }
}
</script>

<style scoped>
.uni-editor {
  display: flex;
  height: 100vh;
  background: #f5f7fa;
}

/* 面板通用样式 */
.left-panel,
.right-panel {
  width: 300px;
  flex-shrink: 0;
  background: #fff;
  display: flex;
  flex-direction: column;
}

.center-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #e8eaf0;
}

.panel-header {
  height: 60rpx;
  line-height: 60rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  border-bottom: 1rpx solid #e8e8e8;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-tip {
  font-size: 24rpx;
  color: #1890ff;
  font-weight: normal;
}

/* 左侧组件列表 */
.component-list {
  flex: 1;
  height: calc(100vh - 60rpx);
  padding: 16rpx;
}

.component-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
  padding-bottom: 16rpx;
}

.component-card {
  background: #fff;
  border: 1rpx solid #e8e8e8;
  border-radius: 12rpx;
  padding: 16rpx 12rpx;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
  min-height: 100rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.component-card:hover {
  border-color: #1890ff;
  box-shadow: 0 4rpx 12rpx rgba(24, 144, 255, 0.15);
  background: #f0f7ff;
}

.card-name {
  font-size: 26rpx;
  font-weight: 500;
  color: #333;
  margin-bottom: 6rpx;
}

.card-en {
  font-size: 20rpx;
  color: #999;
  line-height: 1.2;
  word-break: break-all;
}

/* ========== 中间手机预览区域 ========== */

/* 
  尺寸备份 - iPhone 12/13/14 尺寸，核心区 390*844
  .phone-frame {
    width: 414px;
    height: 916px;
    border-radius: 50px;
    padding: 12px;
  }
  .phone-status-bar {
    height: 44px;
    padding: 0 28px;
    font-size: 15px;
    border-radius: 40px 40px 0 0;
  }
  .phone-screen {
    width: 390px;
    border-radius: 0 0 40px 40px;
  }
  .phone-home-indicator {
    width: 134px;
    height: 5px;
    margin: 8px auto 0;
  }
  .safe-area-bottom {
    height: 34px;
  }
*/

.phone-preview-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
  overflow: auto;
}

/* 手机外框 - iPhone SE 尺寸 (375x667) */
.phone-frame {
  width: 375px;
  height: 667px;
  background: #000;
  border-radius: 40px;
  padding: 10px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  position: relative;
}

/* 手机状态栏 */
.phone-status-bar {
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  background: #000;
  border-radius: 32px 32px 0 0;
}

.status-icons {
  display: flex;
  gap: 5px;
  font-size: 12px;
}

/* 手机屏幕 */
.phone-screen {
  flex: 1;
  background: #f5f5f5;
  border-radius: 0 0 32px 32px;
  overflow: hidden;
  position: relative;
}

/* 底部指示条 */
.phone-home-indicator {
  height: 4px;
  width: 120px;
  background: #fff;
  border-radius: 2px;
  margin: 6px auto 0;
}

/* 手机内的组件 */
.phone-component {
  position: relative;
  padding: 0;
  margin: 0;
  background: transparent;
}

.phone-component.active {
  outline: 3px solid #1890ff;
  outline-offset: -3px;
  background: rgba(24, 144, 255, 0.05);
}

/* 组件渲染区域 */
.component-render {
  padding: 16rpx 30rpx;
}

/* 选中指示器 */
.selected-indicator {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 36rpx;
  background: #1890ff;
  color: #fff;
  font-size: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.phone-component.active .component-render {
  padding-top: 52rpx;
}

/* 操作按钮 */
.component-actions {
  position: absolute;
  right: 8rpx;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  z-index: 20;
}

.action-btn {
  width: 56rpx;
  height: 56rpx;
  background: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
  cursor: pointer;
}

.action-btn.disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.action-btn.delete {
  background: #ff4d4f;
}

.btn-icon {
  font-size: 28rpx;
  color: #333;
  line-height: 1;
}

.action-btn.delete .btn-icon {
  color: #fff;
}

/* 空状态 */
.phone-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400rpx;
  gap: 20rpx;
}

.empty-icon {
  font-size: 80rpx;
  opacity: 0.3;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
}

/* 底部安全区域 */
.safe-area-bottom {
  height: 24px;
}

/* 右侧属性面板 */
.props-panel {
  flex: 1;
  padding: 24rpx;
  height: calc(100vh - 60rpx);
}

.props-content {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.prop-item {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.prop-item label {
  font-size: 24rpx;
  color: #666;
}

.prop-value {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
  padding: 16rpx;
  background: #f5f7fa;
  border-radius: 8rpx;
  word-break: break-all;
}

/* 空状态 */
.empty-tip {
  text-align: center;
  padding: 80rpx 40rpx;
  color: #999;
  font-size: 28rpx;
}
</style>
