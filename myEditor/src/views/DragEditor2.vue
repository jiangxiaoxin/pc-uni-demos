<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Delete } from '@element-plus/icons-vue'
import { VueDraggable } from 'vue-draggable-plus'

// 组件类型定义
interface ComponentItem {
  id: string
  type: 'input' | 'button' | 'select'
  label: string
  title: string
  width: string
  value?: string
}

// 左侧可拖拽的节点列表
const nodeList = [
  { type: 'input', label: '输入框', icon: 'Edit' },
  { type: 'button', label: '按钮', icon: 'Mouse' },
  { type: 'select', label: '选择器', icon: 'ArrowDown' },
]

// 舞台中的组件列表
const stageComponents = ref<ComponentItem[]>([])

// 当前选中的组件
const selectedComponent = ref<ComponentItem | null>(null)

// 拖拽状态（用于左侧拖入）
const isDragging = ref(false)
const dragType = ref<string>('')

// 宽度选项
const widthOptions = [
  { label: '1/4 宽度', value: '25%' },
  { label: '1/3 宽度', value: '33.33%' },
  { label: '1/2 宽度', value: '50%' },
  { label: '100% 宽度', value: '100%' },
]

// 开始拖拽（左侧组件库）
function handleDragStart(type: string) {
  isDragging.value = true
  dragType.value = type
}

// 拖拽结束（左侧组件库）
function handleDragEnd() {
  isDragging.value = false
  dragType.value = ''
}

// 允许放置
function handleDragOver(e: DragEvent) {
  e.preventDefault()
}

// 放置组件到舞台（从左侧拖入）
function handleDrop(e: DragEvent) {
  e.preventDefault()
  if (!dragType.value) return

  const newComponent: ComponentItem = {
    id: Date.now().toString(),
    type: dragType.value as 'input' | 'button' | 'select',
    label: getLabelByType(dragType.value),
    title: getLabelByType(dragType.value),
    width: '100%',
  }

  stageComponents.value.push(newComponent)
  selectedComponent.value = newComponent
  ElMessage.success(`已添加 ${newComponent.label}`)
  
  isDragging.value = false
  dragType.value = ''
}

// 根据类型获取标签
function getLabelByType(type: string): string {
  const node = nodeList.find(n => n.type === type)
  return node?.label || type
}

// 选中组件
function selectComponent(item: ComponentItem) {
  selectedComponent.value = item
}

// 删除组件
function deleteComponent(id: string, e: Event) {
  e.stopPropagation()
  const index = stageComponents.value.findIndex(c => c.id === id)
  if (index > -1) {
    stageComponents.value.splice(index, 1)
    if (selectedComponent.value?.id === id) {
      selectedComponent.value = null
    }
    ElMessage.success('已删除组件')
  }
}

// 更新选中组件的宽度
function updateWidth(width: string) {
  if (selectedComponent.value) {
    selectedComponent.value.width = width
  }
}

// 更新选中组件的标题
function updateTitle(title: string) {
  if (selectedComponent.value) {
    selectedComponent.value.title = title
  }
}

// 获取组件的占位符文本
function getPlaceholder(type: string): string {
  switch (type) {
    case 'input':
      return '请输入内容'
    case 'button':
      return '按钮'
    case 'select':
      return '请选择'
    default:
      return ''
  }
}

// 点击舞台空白区域取消选中
function handleStageClick(e: MouseEvent) {
  if (e.target === e.currentTarget) {
    selectedComponent.value = null
  }
}

// vue-draggable-plus 排序结束回调
function onSortEnd() {
  ElMessage.success('排序已更新')
}
</script>

<template>
  <div class="drag-editor">
    <!-- 左侧：组件节点面板 -->
    <div class="left-panel">
      <h3 class="panel-title">组件库</h3>
      <div class="node-list">
        <div
          v-for="node in nodeList"
          :key="node.type"
          class="node-item"
          draggable="true"
          @dragstart="handleDragStart(node.type)"
          @dragend="handleDragEnd"
        >
          <el-icon class="node-icon">
            <component :is="node.icon" />
          </el-icon>
          <span class="node-label">{{ node.label }}</span>
        </div>
      </div>
    </div>

    <!-- 中间：舞台区域 -->
    <div class="center-panel">
      <h3 class="panel-title">舞台 (vue-draggable-plus)</h3>
      <div
        class="stage"
        :class="{ 'drag-over': isDragging }"
        @dragover="handleDragOver"
        @drop="handleDrop"
        @click="handleStageClick"
      >
        <template v-if="stageComponents.length === 0">
          <div class="empty-tip">
            <el-icon :size="48"><Plus /></el-icon>
            <p>从左侧拖拽组件到此处</p>
          </div>
        </template>
        <template v-else>
          <!-- 使用 vue-draggable-plus 实现拖拽排序 -->
          <VueDraggable
            v-model="stageComponents"
            class="draggable-container"
            :animation="200"
            ghost-class="dragging-ghost"
            chosen-class="dragging-chosen"
            drag-class="dragging-item"
            @end="onSortEnd"
          >
            <div
              v-for="item in stageComponents"
              :key="item.id"
              class="component-wrapper"
              :class="{ selected: selectedComponent?.id === item.id }"
              :style="{ flexBasis: item.width, width: item.width }"
              @click="selectComponent(item)"
            >
              <!-- 删除按钮 -->
              <div class="delete-btn" @click="deleteComponent(item.id, $event)">
                <el-icon><Delete /></el-icon>
              </div>
              <!-- 标题栏 -->
              <div class="component-title">{{ item.title }}</div>
              <!-- 组件内容 -->
              <div class="component-content">
                <el-input
                  v-if="item.type === 'input'"
                  v-model="item.value"
                  :placeholder="getPlaceholder(item.type)"
                />
                <el-button
                  v-else-if="item.type === 'button'"
                  type="primary"
                >
                  {{ getPlaceholder(item.type) }}
                </el-button>
                <el-select
                  v-else-if="item.type === 'select'"
                  v-model="item.value"
                  :placeholder="getPlaceholder(item.type)"
                  style="width: 100%"
                >
                  <el-option label="选项1" value="1" />
                  <el-option label="选项2" value="2" />
                  <el-option label="选项3" value="3" />
                </el-select>
              </div>
            </div>
          </VueDraggable>
        </template>
      </div>
    </div>

    <!-- 右侧：属性设置面板 -->
    <div class="right-panel">
      <h3 class="panel-title">属性设置</h3>
      <div class="properties-content">
        <template v-if="selectedComponent">
          <div class="property-item">
            <label>组件标题</label>
            <el-input
              :model-value="selectedComponent.title"
              @update:model-value="updateTitle"
              placeholder="输入组件标题"
            />
          </div>
          <div class="property-item">
            <label>组件类型</label>
            <el-input :model-value="selectedComponent.label" disabled />
          </div>
          <div class="property-item">
            <label>组件尺寸</label>
            <el-select
              :model-value="selectedComponent.width"
              @update:model-value="updateWidth"
              placeholder="选择宽度"
            >
              <el-option
                v-for="opt in widthOptions"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </el-select>
          </div>
          <div class="property-item">
            <label>组件ID</label>
            <el-input :model-value="selectedComponent.id" disabled />
          </div>
        </template>
        <template v-else>
          <div class="no-selection">
            <el-icon :size="32"><InfoFilled /></el-icon>
            <p>请选中一个组件进行设置</p>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.drag-editor {
  display: flex;
  height: 100vh;
  background-color: #f5f7fa;
}

/* 面板通用样式 */
.left-panel,
.center-panel,
.right-panel {
  padding: 16px;
  box-sizing: border-box;
}

.panel-title {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  padding-bottom: 12px;
  border-bottom: 1px solid #e4e7ed;
}

/* 左侧面板 */
.left-panel {
  width: 200px;
  background-color: #fff;
  border-right: 1px solid #e4e7ed;
}

.node-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.node-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background-color: #f5f7fa;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  cursor: grab;
  transition: all 0.2s;
}

.node-item:hover {
  background-color: #ecf5ff;
  border-color: #409eff;
}

.node-item:active {
  cursor: grabbing;
}

.node-icon {
  font-size: 18px;
  color: #409eff;
}

.node-label {
  font-size: 14px;
  color: #606266;
}

/* 中间面板 - 舞台 */
.center-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.stage {
  flex: 1;
  background-color: #fff;
  border: 2px dashed #dcdfe6;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  overflow-y: auto;
  transition: all 0.3s;
}

.stage.drag-over {
  border-color: #409eff;
  background-color: #ecf5ff;
}

.empty-tip {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #909399;
}

.empty-tip p {
  margin-top: 16px;
  font-size: 14px;
}

/* vue-draggable-plus 容器 */
.draggable-container {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
}

/* 组件包装器 */
.component-wrapper {
  position: relative;
  padding: 12px;
  border: 1px solid transparent;
  transition: all 0.2s;
  box-sizing: border-box;
  flex: 0 0 auto;
}

.component-wrapper:hover {
  border-color: #c0c4cc;
  background-color: #f5f7fa;
}

.component-wrapper.selected {
  border-color: #409eff;
  background-color: #ecf5ff;
}

.component-wrapper.selected .delete-btn {
  display: flex;
}

/* 组件标题栏 */
.component-title {
  font-size: 13px;
  font-weight: 500;
  color: #606266;
  margin-bottom: 8px;
  text-align: left;
}

.component-wrapper:hover .component-title {
  color: #303133;
}

.component-wrapper.selected .component-title {
  color: #409eff;
}

/* vue-draggable-plus 拖拽样式 */
.dragging-ghost {
  opacity: 0.5;
  background-color: #f5f7fa;
  border: 2px dashed #409eff;
}

.dragging-chosen {
  background-color: #ecf5ff;
  border-color: #409eff;
}

.dragging-item {
  opacity: 0.9;
}

/* 删除按钮 */
.delete-btn {
  display: none;
  position: absolute;
  top: -8px;
  right: -8px;
  width: 20px;
  height: 20px;
  background-color: #f56c6c;
  color: #fff;
  border-radius: 50%;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  font-size: 12px;
}

.delete-btn:hover {
  background-color: #f78989;
}

.component-content {
  width: 100%;
}

/* 按钮组件宽度占满 */
:deep(.component-content .el-button) {
  width: 100%;
}

/* 右侧面板 */
.right-panel {
  width: 280px;
  background-color: #fff;
  border-left: 1px solid #e4e7ed;
}

.properties-content {
  padding: 8px 0;
}

.property-item {
  margin-bottom: 20px;
}

.property-item label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

.no-selection {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #909399;
  text-align: center;
}

.no-selection p {
  margin-top: 12px;
  font-size: 14px;
}
</style>
