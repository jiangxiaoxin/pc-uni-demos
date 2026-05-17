<template>
  <div class="add-node">
    <span class="add-node__line" aria-hidden="true"></span>
    <div class="add-node__actions" :class="{ 'add-node__actions--open': open }">
      <button
        class="add-node__main"
        type="button"
        aria-label="添加下一个节点"
        :aria-expanded="open"
        @click="toggleMenu"
      >
        <span>+</span>
      </button>
      <div class="add-node__menu">
        <button type="button" @click="selectNode('action')">动作</button>
        <button type="button" @click="selectNode('branch')">分支</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  addAction: []
  addBranch: []
}>()

const open = ref(false)

function toggleMenu() {
  open.value = !open.value
}

function selectNode(type: 'action' | 'branch') {
  if (type === 'action') {
    emit('addAction')
  } else {
    emit('addBranch')
  }

  open.value = false
}
</script>
