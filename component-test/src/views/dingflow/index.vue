<template>
  <div class="dingflow-view">
    <header class="dingflow-header">
      <div>
        <h1>钉钉审批流编辑器</h1>
        <p>使用普通 HTML 元素和 CSS 连线实现，可递归嵌套条件分支。</p>
      </div>
      <div class="header-actions">
        <button class="reset-button" type="button" @click="resetFlow">重置示例</button>
      </div>
    </header>

    <main class="dingflow-layout">
      <div class="editor-shell-wrap">
        <section
          ref="editorShellRef"
          class="editor-shell"
          :class="{
            'editor-shell--dragging': draggingCanvas,
          }"
          aria-label="流程编辑区域"
          @mousedown="startCanvasDrag"
          @mousemove="moveCanvasDrag"
          @mouseup="stopCanvasDrag"
          @mouseleave="stopCanvasDrag"
        >
        <!-- flow-sequence 就是顺序的去处理，这样branch和loop 内部也是 flow-sequence -->
          <FlowSequence
            :nodes="flowNodes"
            @add-after="addAfter"
            @remove-node="removeNode"
          />
        </section>
        <EditorMinimap
          :nodes="flowNodes"
          :editor-shell="editorShellRef"
        />
      </div>

      <aside class="json-panel">
        <div class="json-panel__title">配置 JSON</div>
        <pre>{{ flowJson }}</pre>
      </aside>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import EditorMinimap from './EditorMinimap.vue'
import FlowSequence from './FlowSequence.vue'
import {
  createActionNode,
  createBranchNode,
  createLoopNode,
  createInitialFlow,
  type AddableNodeKind,
  type FlowNode,
} from './types'

const flowNodes = ref<FlowNode[]>(createInitialFlow())
const editorShellRef = ref<HTMLElement | null>(null)
const draggingCanvas = ref(false)

// 记录按下鼠标时的滚动位置，用鼠标位移反向更新 scrollLeft/scrollTop 实现画布拖拽。
const dragStart = {
  x: 0,
  y: 0,
  scrollLeft: 0,
  scrollTop: 0,
}

const flowJson = computed(() => JSON.stringify(flowNodes.value, null, 2))

function createNextNode(type: AddableNodeKind) {
  if (type === 'action') return createActionNode()
  if (type === 'branch') return createBranchNode()
  return createLoopNode()
}

function addAfter(index: number, type: AddableNodeKind) {
  flowNodes.value.splice(index + 1, 0, createNextNode(type))
}

function removeNode(index: number) {
  flowNodes.value.splice(index, 1)
}

function resetFlow() {
  flowNodes.value = createInitialFlow()
}

function isInteractiveElement(target: EventTarget | null) {
  return target instanceof HTMLElement
    && Boolean(target.closest('button, input, textarea, select, a, [contenteditable="true"]'))
}

function startCanvasDrag(event: MouseEvent) {
  // 按钮、输入等交互元素保留自身点击行为，不触发画布拖拽。
  if (event.button !== 0 || isInteractiveElement(event.target)) return

  const editorShell = editorShellRef.value
  if (!editorShell) return

  draggingCanvas.value = true
  dragStart.x = event.clientX
  dragStart.y = event.clientY
  dragStart.scrollLeft = editorShell.scrollLeft
  dragStart.scrollTop = editorShell.scrollTop
}

function moveCanvasDrag(event: MouseEvent) {
  if (!draggingCanvas.value) return

  const editorShell = editorShellRef.value
  if (!editorShell) return

  event.preventDefault()
  // 画布跟随鼠标“抓取”移动：鼠标向右拖，内容视口向左滚。
  editorShell.scrollLeft = dragStart.scrollLeft - (event.clientX - dragStart.x)
  editorShell.scrollTop = dragStart.scrollTop - (event.clientY - dragStart.y)
}

function stopCanvasDrag() {
  draggingCanvas.value = false
}
</script>

<style scoped>
.dingflow-view {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  padding: 24px;
  background: #f4f6f8;
  color: #1f2937;
}

.dingflow-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.dingflow-header h1 {
  margin: 0 0 6px;
  font-size: 22px;
  font-weight: 700;
}

.dingflow-header p {
  margin: 0;
  color: #6b7280;
  font-size: 13px;
}

.reset-button {
  height: 34px;
  padding: 0 14px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  background: #fff;
  color: #334155;
  cursor: pointer;
}

.reset-button:hover {
  border-color: #64748b;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.dingflow-layout {
  display: flex;
  flex: 1 1 auto;
  gap: 16px;
  align-items: start;
  min-height: 0;
}

.editor-shell-wrap {
  --flow-bg: #fff;

  position: relative;
  flex: 1 1 auto;
  min-width: 0;
  height: 100%;
  min-height: 0;
}

.editor-shell {
  --flow-bg: #fff;

  /* 主体区域由外层 flex 分配高度；编辑区自身滚动，避免页面再出现第二层纵向滚动条。 */
  height: 100%;
  min-height: 0;
  overflow: auto;
  padding: 32px 24px 48px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
  cursor: grab;
  overscroll-behavior: contain;
  user-select: none;
}

.editor-shell--dragging {
  cursor: grabbing;
}

.editor-shell :deep(button),
.editor-shell :deep(input) {
  user-select: auto;
}

.json-panel {
  flex: 0 0 380px;
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  width: 380px;
  max-height: 100%;
  overflow: hidden;
  border: 1px solid #d9e2ec;
  border-radius: 8px;
  background: #101828;
  color: #dbe4f0;
}

.json-panel__title {
  padding: 12px 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  font-size: 13px;
  font-weight: 600;
}

.json-panel pre {
  flex: 1 1 auto;
  min-height: 0;
  margin: 0;
  padding: 14px;
  overflow: auto;
  font-size: 12px;
  line-height: 1.55;
  white-space: pre-wrap;
  word-break: break-word;
}

@media (max-width: 1100px) {
  .dingflow-layout {
    flex-direction: column;
  }

  .editor-shell,
  .json-panel {
    position: static;
    width: 100%;
    flex-basis: auto;
  }

  .json-panel {
    max-height: 360px;
  }
}
</style>
