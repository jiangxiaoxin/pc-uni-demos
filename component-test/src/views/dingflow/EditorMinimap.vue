<template>
  <div class="editor-minimap" aria-hidden="true">
    <div
      class="editor-minimap__content"
      :style="contentStyle"
    >
      <div
        class="editor-minimap__flow"
        :style="flowStyle"
        v-html="flowHtml"
      ></div>
    </div>
    <div class="editor-minimap__viewport" :style="viewportStyle"></div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { CSSProperties } from 'vue'
import type { FlowNode } from './types'

interface ViewportState {
  scrollLeft: number
  scrollTop: number
  clientWidth: number
  clientHeight: number
  scrollWidth: number
  scrollHeight: number
}

const props = defineProps<{
  nodes: FlowNode[]
  editorShell: HTMLElement | null
}>()

const minimapSize = 200
const minimapPadding = 8
const minimapInnerSize = minimapSize - minimapPadding * 2
const minimapTransform = ref({
  scale: 1,
  offsetX: minimapPadding,
  offsetY: minimapPadding,
})
const flowBox = ref({
  left: 0,
  top: 0,
  width: 1,
  height: 1,
})
const flowHtml = ref('')
const viewport = ref<ViewportState>({
  scrollLeft: 0,
  scrollTop: 0,
  clientWidth: 1,
  clientHeight: 1,
  scrollWidth: 1,
  scrollHeight: 1,
})

const contentStyle = computed<CSSProperties>(() => ({
  width: `${viewport.value.scrollWidth}px`,
  height: `${viewport.value.scrollHeight}px`,
  transform: `translate(${minimapTransform.value.offsetX}px, ${minimapTransform.value.offsetY}px) scale(${minimapTransform.value.scale})`,
}))

const flowStyle = computed<CSSProperties>(() => ({
  left: `${flowBox.value.left}px`,
  top: `${flowBox.value.top}px`,
  width: `${flowBox.value.width}px`,
  height: `${flowBox.value.height}px`,
}))

const viewportStyle = computed<CSSProperties>(() => {
  const state = viewport.value
  const transform = minimapTransform.value

  return {
    left: `${transform.offsetX + state.scrollLeft * transform.scale}px`,
    top: `${transform.offsetY + state.scrollTop * transform.scale}px`,
    width: `${Math.max(state.clientWidth * transform.scale, 16)}px`,
    height: `${Math.max(state.clientHeight * transform.scale, 16)}px`,
  }
})

function updateViewport() {
  const editorShell = props.editorShell
  if (!editorShell) return
  const flowElement = Array.from(editorShell.children)
    .find((child): child is HTMLElement => child instanceof HTMLElement && child.classList.contains('flow-sequence'))

  viewport.value = {
    scrollLeft: editorShell.scrollLeft,
    scrollTop: editorShell.scrollTop,
    clientWidth: editorShell.clientWidth,
    clientHeight: editorShell.clientHeight,
    scrollWidth: editorShell.scrollWidth,
    scrollHeight: editorShell.scrollHeight,
  }

  if (flowElement) {
    flowBox.value = {
      left: flowElement.offsetLeft,
      top: flowElement.offsetTop,
      width: flowElement.offsetWidth,
      height: flowElement.offsetHeight,
    }
    flowHtml.value = flowElement.outerHTML
  }

  const scale = Math.min(
    minimapInnerSize / Math.max(editorShell.scrollWidth, 1),
    minimapInnerSize / Math.max(editorShell.scrollHeight, 1),
    1,
  )
  const scaledWidth = editorShell.scrollWidth * scale
  const scaledHeight = editorShell.scrollHeight * scale

  minimapTransform.value = {
    scale,
    offsetX: minimapPadding + Math.max((minimapInnerSize - scaledWidth) / 2, 0),
    offsetY: minimapPadding + Math.max((minimapInnerSize - scaledHeight) / 2, 0),
  }
}

async function refreshMinimap() {
  await nextTick()
  updateViewport()
}

function bindEditorShell(editorShell: HTMLElement | null) {
  editorShell?.addEventListener('scroll', updateViewport, { passive: true })
}

function unbindEditorShell(editorShell: HTMLElement | null) {
  editorShell?.removeEventListener('scroll', updateViewport)
}

const resizeObserver = new ResizeObserver(() => {
  void refreshMinimap()
})

watch(
  () => props.editorShell,
  (nextEditorShell, prevEditorShell) => {
    unbindEditorShell(prevEditorShell)
    bindEditorShell(nextEditorShell)

    if (prevEditorShell) {
      resizeObserver.unobserve(prevEditorShell)
    }
    if (nextEditorShell) {
      resizeObserver.observe(nextEditorShell)
    }

    void refreshMinimap()
  },
  { immediate: true },
)

watch(
  () => props.nodes,
  () => {
    void refreshMinimap()
  },
  { deep: true },
)

onMounted(() => {
  void refreshMinimap()
})

onBeforeUnmount(() => {
  unbindEditorShell(props.editorShell)
  resizeObserver.disconnect()
})
</script>

<style scoped>
.editor-minimap {
  position: absolute;
  left: 14px;
  bottom: 14px;
  z-index: 20;
  width: 200px;
  height: 200px;
  overflow: hidden;
  padding: 8px;
  border: 1px solid rgba(148, 163, 184, 0.72);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.16);
  pointer-events: none;
}

.editor-minimap__content {
  position: relative;
  overflow: visible;
  transform-origin: left top;
}

.editor-minimap__flow {
  position: absolute;
}

.editor-minimap__viewport {
  position: absolute;
  border: 2px solid #1677ff;
  border-radius: 4px;
  background: rgba(22, 119, 255, 0.12);
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.7);
}

:global(.editor-minimap .add-node__main),
:global(.editor-minimap .add-node__actions),
:global(.editor-minimap .flow-card__delete),
:global(.editor-minimap .branch-title-card__delete),
:global(.editor-minimap .loop-title-card__delete),
:global(.editor-minimap .branch-add-button),
:global(.editor-minimap .branch-condition button) {
  display: none;
}
</style>
