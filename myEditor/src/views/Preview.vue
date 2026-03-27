<template>
  <div class="preview-container">
    <!-- 左侧控制栏 -->
    <aside class="control-sidebar">
      <div class="control-section">
        <label>设备尺寸</label>
        <select v-model="selectedSize" class="size-select">
          <option v-for="size in sizeOptions" :key="size.label" :value="size">
            {{ size.label }}
          </option>
        </select>
        <div class="size-info">
          {{ selectedSize.width }} x {{ selectedSize.height }}
        </div>
      </div>

      <div class="control-section">
        <label>预览环境</label>
        <select v-model="url" class="url-select">
          <option value="">请选择环境</option>
          <option value="http://localhost:5174">本地开发环境</option>
          <option value="https://v2-h5.uviewui.com/">线上预览环境</option>
        </select>
      </div>

      <div class="control-section size-custom">
        <label>自定义尺寸</label>
        <div class="input-row">
          <input
            v-model.number="customWidth"
            type="number"
            placeholder="宽"
            class="size-input"
            @change="applyCustomSize"
          />
          <span class="separator">×</span>
          <input
            v-model.number="customHeight"
            type="number"
            placeholder="高"
            class="size-input"
            @change="applyCustomSize"
          />
        </div>
      </div>

      <!-- 缩放信息 -->
      <div v-if="scale < 1" class="control-section scale-info">
        <label>缩放比例</label>
        <div class="scale-value">{{ (scale * 100).toFixed(0) }}%</div>
      </div>
    </aside>

    <!-- 右侧预览区域 -->
    <main ref="previewMainRef" class="preview-main">
      <div
        v-if="url"
        class="preview-scale-wrapper"
        :style="scaleWrapperStyle"
      >
        <iframe
          :src="url"
          class="preview-iframe"
          :style="iframeStyle"
          frameborder="0"
        />
      </div>
      <div v-else class="empty-state">
        <div class="empty-icon">📱</div>
        <p>请选择预览环境</p>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface SizeOption {
  label: string
  width: number
  height: number
}

const sizeOptions: SizeOption[] = [
  { label: 'iPhone SE', width: 375, height: 667 },
  { label: 'iPhone 12/13/14', width: 414, height: 896 },
  { label: 'iPad', width: 1024, height: 1366 },
]

const selectedSize = ref<SizeOption>(sizeOptions[0])
const url = ref('')
const customWidth = ref<number | null>(null)
const customHeight = ref<number | null>(null)

// 预览区域尺寸
const previewMainRef = ref<HTMLElement | null>(null)
const containerSize = ref({ width: 0, height: 0 })

// 计算缩放比例
const scale = computed(() => {
  const { width: containerWidth, height: containerHeight } = containerSize.value
  const { width: iframeWidth, height: iframeHeight } = selectedSize.value

  if (containerWidth === 0 || containerHeight === 0) return 1

  const scaleX = (containerWidth - 80) / iframeWidth // 80px 留白
  const scaleY = (containerHeight - 80) / iframeHeight

  return Math.min(scaleX, scaleY, 1) // 最大为 1（不放大）
})

// iframe 样式（原始尺寸）
const iframeStyle = computed(() => ({
  width: `${selectedSize.value.width}px`,
  height: `${selectedSize.value.height}px`,
}))

// 缩放容器样式
const scaleWrapperStyle = computed(() => ({
  transform: `scale(${scale.value})`,
  transformOrigin: 'center center',
}))

// 更新容器尺寸
const updateContainerSize = () => {
  if (previewMainRef.value) {
    containerSize.value = {
      width: previewMainRef.value.clientWidth,
      height: previewMainRef.value.clientHeight,
    }
  }
}

const applyCustomSize = () => {
  if (customWidth.value && customHeight.value) {
    selectedSize.value = {
      label: '自定义',
      width: customWidth.value,
      height: customHeight.value,
    }
  }
}

// 监听窗口变化
onMounted(() => {
  updateContainerSize()
  window.addEventListener('resize', updateContainerSize)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateContainerSize)
})
</script>

<style scoped>
.preview-container {
  display: flex;
  height: 100vh;
  background: #f0f2f5;
  overflow: hidden;
}

/* 左侧控制栏 */
.control-sidebar {
  width: 240px;
  background: white;
  border-right: 1px solid #e8e8e8;
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  flex-shrink: 0;
  overflow-y: auto;
}

.control-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.control-section label {
  font-size: 13px;
  font-weight: 500;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.size-select,
.url-select {
  padding: 10px 12px;
  font-size: 14px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  outline: none;
  width: 100%;
}

.size-select:hover,
.url-select:hover {
  border-color: #40a9ff;
}

.size-info {
  font-size: 12px;
  color: #999;
  text-align: center;
  padding: 4px;
  background: #f5f5f5;
  border-radius: 4px;
}

.size-custom .input-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.size-input {
  flex: 1;
  padding: 8px 10px;
  font-size: 14px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  outline: none;
  width: 0;
}

.size-input:focus {
  border-color: #40a9ff;
}

.separator {
  color: #999;
  font-size: 14px;
}

.scale-info {
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px solid #e8e8e8;
}

.scale-value {
  font-size: 24px;
  font-weight: 600;
  color: #1890ff;
  text-align: center;
}

/* 右侧预览区域 */
.preview-main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  overflow: hidden;
  position: relative;
}

.preview-scale-wrapper {
  transition: transform 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-iframe {
  border: 2px solid red;
  background: white;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  flex-shrink: 0;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: #999;
}

.empty-icon {
  font-size: 64px;
  opacity: 0.5;
}

.empty-state p {
  font-size: 16px;
}
</style>
