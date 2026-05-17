<template>
  <div ref="addNodeRef" class="add-node">
    <span class="add-node__line" aria-hidden="true"></span>
    <div class="add-node__actions" :class="{ 'add-node__actions--open': open }">
      <button
        class="add-node__main"
        type="button"
        aria-label="添加下一个节点"
        :aria-expanded="open"
        @click="toggleMenu"
      >
        <span>下一步</span>
      </button>
      <div class="add-node__menu">
        <button type="button" @click="selectNode('action')">动作</button>
        <button type="button" @click="selectNode('branch')">分支</button>
        <button type="button" @click="selectNode('loop')">循环</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
import type { AddableNodeKind } from './types'

const emit = defineEmits<{
  addAction: []
  addBranch: []
  addLoop: []
}>()

const open = ref(false)
const addNodeRef = ref<HTMLElement | null>(null)

function toggleMenu() {
  open.value = !open.value
}

function selectNode(type: AddableNodeKind) {
  if (type === 'action') {
    emit('addAction')
  } else if (type === 'branch') {
    emit('addBranch')
  } else {
    emit('addLoop')
  }

  open.value = false
}

function handleDocumentPointerDown(event: PointerEvent) {
  const addNode = addNodeRef.value
  // 如果点击的是这个容器下的元素，则不关闭菜单
  if (!addNode || addNode.contains(event.target as Node)) return

  open.value = false
}

watch(open, (value) => {
  if (value) {
    document.addEventListener('pointerdown', handleDocumentPointerDown)
  } else {
    document.removeEventListener('pointerdown', handleDocumentPointerDown)
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', handleDocumentPointerDown)
})
</script>
