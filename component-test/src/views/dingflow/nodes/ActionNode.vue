<template>
  <div class="flow-node-block">
    <div class="flow-card flow-card--action">
      <span class="flow-card__label">{{ node.title }}</span>
      <button
        class="flow-card__delete"
        type="button"
        aria-label="删除动作节点"
        @click="emit('remove')"
      >
        删除
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ActionFlowNode } from '../types'

defineProps<{
  node: ActionFlowNode
}>()

const emit = defineEmits<{
  remove: []
}>()
</script>

<style scoped>
@import './node-card.css';

.flow-card--action {
  justify-content: center;
  padding-right: 58px;
  padding-left: 14px;
  background: #2563eb;
}
</style>
