<template>
  <div class="flow-node-block flow-node-block--end">
    <div class="flow-card flow-card--end">
      <span class="flow-card__label">{{ node.title }}</span>
      <span class="flow-card__type">结束</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { EndFlowNode } from '../types'

defineProps<{
  node: EndFlowNode
}>()
</script>

<style scoped>
@import './node-card.css';

.flow-node-block--end .flow-card::before {
  content: "";
  position: absolute;
  left: 50%;
  bottom: 100%;
  width: 1px;
  height: 28px;
  background: #cbd5e1;
}

.flow-card--end {
  background: #64748b;
}
</style>
