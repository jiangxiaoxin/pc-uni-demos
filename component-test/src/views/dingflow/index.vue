<template>
  <div class="dingflow-view">
    <header class="dingflow-header">
      <div>
        <h1>钉钉审批流编辑器</h1>
        <p>使用普通 HTML 元素和 CSS 连线实现，可递归嵌套条件分支。</p>
      </div>
      <button class="reset-button" type="button" @click="resetFlow">重置示例</button>
    </header>

    <main class="dingflow-layout">
      <section
        ref="editorShellRef"
        class="editor-shell"
        :class="{ 'editor-shell--dragging': draggingCanvas }"
        aria-label="流程编辑区域"
        @mousedown="startCanvasDrag"
        @mousemove="moveCanvasDrag"
        @mouseup="stopCanvasDrag"
        @mouseleave="stopCanvasDrag"
      >
        <FlowSequence
          :nodes="flowNodes"
          @add-after="addAfter"
          @remove-node="removeNode"
        />
      </section>

      <aside class="json-panel">
        <div class="json-panel__title">配置 JSON</div>
        <pre>{{ flowJson }}</pre>
      </aside>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import FlowSequence from './FlowSequence.vue'
import {
  createActionNode,
  createBranchNode,
  createInitialFlow,
  type FlowNode,
} from './types'

const flowNodes = ref<FlowNode[]>(createInitialFlow())
const editorShellRef = ref<HTMLElement | null>(null)
const draggingCanvas = ref(false)
const dragStart = {
  x: 0,
  y: 0,
  scrollLeft: 0,
  scrollTop: 0,
}

const flowJson = computed(() => JSON.stringify(flowNodes.value, null, 2))

function createNextNode(type: 'action' | 'branch') {
  return type === 'action' ? createActionNode() : createBranchNode()
}

function addAfter(index: number, type: 'action' | 'branch') {
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
  editorShell.scrollLeft = dragStart.scrollLeft - (event.clientX - dragStart.x)
  editorShell.scrollTop = dragStart.scrollTop - (event.clientY - dragStart.y)
}

function stopCanvasDrag() {
  draggingCanvas.value = false
}
</script>

<style scoped>
.dingflow-view {
  min-height: 100vh;
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

.dingflow-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 380px;
  gap: 16px;
  align-items: start;
}

.editor-shell {
  --flow-bg: #fff;

  height: calc(100vh - 112px);
  min-height: 480px;
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
  position: sticky;
  top: 16px;
  max-height: calc(100vh - 48px);
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
  max-height: calc(100vh - 96px);
  margin: 0;
  padding: 14px;
  overflow: auto;
  font-size: 12px;
  line-height: 1.55;
  white-space: pre-wrap;
  word-break: break-word;
}

:deep(.flow-sequence) {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: max-content;
}

:deep(.flow-node-block) {
  display: flex;
  flex-direction: column;
  align-items: center;
}

:deep(.flow-card) {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 180px;
  min-height: 54px;
  padding: 12px 14px;
  border: 1px solid transparent;
  border-radius: 6px;
  color: #fff;
  box-shadow: 0 8px 22px rgba(15, 23, 42, 0.08);
}

:deep(.flow-node-block--end .flow-card::before) {
  content: "";
  position: absolute;
  left: 50%;
  bottom: 100%;
  width: 1px;
  height: 28px;
  background: #cbd5e1;
}

:deep(.flow-card--start) {
  background: #16a34a;
}

:deep(.flow-card--action) {
  justify-content: center;
  padding-right: 58px;
  padding-left: 14px;
  background: #2563eb;
}

:deep(.flow-card--end) {
  background: #64748b;
}

:deep(.flow-card__label) {
  font-size: 15px;
  font-weight: 700;
}

:deep(.flow-card__type) {
  font-size: 12px;
  opacity: 0.82;
}

:deep(.flow-card__delete) {
  position: absolute;
  right: 10px;
  top: 50%;
  height: 28px;
  padding: 0 8px;
  border: 1px solid rgba(255, 255, 255, 0.55);
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.16);
  color: #fff;
  font-size: 12px;
  cursor: pointer;
  transform: translateY(-50%);
}

:deep(.flow-card__delete:hover) {
  background: rgba(255, 255, 255, 0.28);
}

:deep(.add-node) {
  position: relative;
  display: flex;
  justify-content: center;
  width: 100%;
  height: 72px;
}

:deep(.add-node__line::before),
:deep(.add-node__line::after) {
  content: "";
  position: absolute;
  left: 50%;
  width: 1px;
  background: #cbd5e1;
  transform: translateX(-50%);
}

:deep(.add-node__line::before) {
  top: 0;
  height: 24px;
}

:deep(.add-node__line::after) {
  top: 48px;
  bottom: 0;
}

:deep(.add-node__actions) {
  position: absolute;
  top: 22px;
  left: 50%;
  z-index: 3;
  transform: translateX(-50%);
}

:deep(.add-node__main) {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 50%;
  background: #1677ff;
  color: #fff;
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(22, 119, 255, 0.28);
}

:deep(.add-node__main span) {
  margin-top: -2px;
}

:deep(.add-node__menu) {
  position: absolute;
  top: 34px;
  left: 50%;
  display: none;
  gap: 6px;
  padding: 6px;
  border: 1px solid #dbe3ef;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.14);
  transform: translateX(-50%);
  white-space: nowrap;
}

:deep(.add-node__actions--open .add-node__menu) {
  display: flex;
}

:deep(.add-node__menu button) {
  height: 28px;
  padding: 0 10px;
  border: 1px solid #dbe3ef;
  border-radius: 5px;
  background: #f8fafc;
  color: #334155;
  font-size: 12px;
  cursor: pointer;
}

:deep(.add-node__menu button:hover) {
  border-color: #1677ff;
  color: #1677ff;
}

:deep(.branch-group) {
  --branch-gap: 0px;
  --branch-width: 220px;

  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: max-content;
}

:deep(.branch-group__toolbar) {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  background: var(--flow-bg);
  color: #475569;
  font-size: 13px;
  font-weight: 600;
}

:deep(.branch-group__toolbar button) {
  position: relative;
  height: 28px;
  padding: 0 10px;
  border: 1px solid #bfdbfe;
  border-radius: 5px;
  background: #eff6ff;
  color: #1d4ed8;
  cursor: pointer;
}

:deep(.branch-group__toolbar button::before) {
  content: "";
  position: absolute;
  left: 50%;
  bottom: 100%;
  width: 1px;
  height: 8px;
  background: #cbd5e1;
  transform: translateX(-50%);
}

:deep(.branch-title-card) {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 180px;
  min-height: 54px;
  padding: 12px 14px;
  border: 1px solid transparent;
  border-radius: 6px;
  background: #7c3aed;
  color: #fff;
  box-shadow: 0 8px 22px rgba(15, 23, 42, 0.08);
}

:deep(.branch-title-card span) {
  font-size: 15px;
  font-weight: 700;
}

:deep(.branch-group__body) {
  position: relative;
  display: flex;
  align-items: stretch;
  gap: var(--branch-gap);
  min-width: calc(var(--branch-count) * var(--branch-width));
  padding: 28px 18px 0;
  background-image: linear-gradient(var(--flow-bg), var(--flow-bg));
  background-position: center top;
  background-repeat: no-repeat;
  background-size: 16px 100%;
}

:deep(.branch-group__body::before),
:deep(.branch-group__body::after) {
  content: "";
  position: absolute;
  left: 50%;
  width: 1px;
  height: 28px;
  background: #cbd5e1;
  transform: translateX(-50%);
}

:deep(.branch-group__body::before) {
  top: 0;
}

:deep(.branch-group__body::after) {
  bottom: -28px;
}

:deep(.branch-column) {
  position: relative;
  display: flex;
  flex: 0 0 max-content;
  flex-direction: column;
  align-items: center;
  min-width: var(--branch-width);
  padding: 28px 14px;
  background-image: linear-gradient(#cbd5e1, #cbd5e1);
  background-position: center top;
  background-repeat: no-repeat;
  background-size: 1px 100%;
}

:deep(.branch-column::before),
:deep(.branch-column::after) {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  border-top: 1px solid #cbd5e1;
}

:deep(.branch-column::before) {
  top: 0;
}

:deep(.branch-column::after) {
  bottom: 0;
}

:deep(.branch-column:first-child::before),
:deep(.branch-column:first-child::after) {
  left: 50%;
}

:deep(.branch-column:last-child::before),
:deep(.branch-column:last-child::after) {
  right: 50%;
}

:deep(.branch-column > *) {
  position: relative;
  z-index: 1;
}

:deep(.branch-condition) {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 190px;
  min-height: 48px;
  padding: 8px;
  border: 1px solid #f59e0b;
  border-radius: 6px;
  background: #fff7ed;
  box-shadow: 0 6px 16px rgba(245, 158, 11, 0.1);
}

:deep(.branch-condition__input) {
  min-width: 0;
  flex: 1;
  height: 30px;
  border: 1px solid #fed7aa;
  border-radius: 4px;
  padding: 0 8px;
  color: #92400e;
  background: #fff;
  font-size: 13px;
}

:deep(.branch-condition button) {
  height: 30px;
  padding: 0 8px;
  border: 1px solid #fecaca;
  border-radius: 4px;
  background: #fff1f2;
  color: #be123c;
  cursor: pointer;
}

:deep(.branch-group__join) {
  position: relative;
  width: 100%;
  min-width: max-content;
  padding-top: 28px;
}

@media (max-width: 1100px) {
  .dingflow-layout {
    grid-template-columns: 1fr;
  }

  .json-panel {
    position: static;
  }
}
</style>
