<template>
  <div class="flow-node-block">
    <div class="flow-card flow-card--start">
      <span class="flow-card__label">{{ node.title }}</span>
      <span class="flow-card__type">开始</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { StartFlowNode } from '../types'

defineProps<{
  node: StartFlowNode
}>()
</script>

<style scoped>
@import './node-card.css';

.flow-card--start {
  background: #16a34a;
}
</style>
