<template>
  <div class="counter">
    <div class="display">{{ displayValue }}</div>
    <div class="controls">
      <button class="btn btn-dec" @click="decrement" :disabled="disabled">-</button>
      <button class="btn btn-reset" @click="reset">重置</button>
      <button class="btn btn-inc" @click="increment" :disabled="disabled">+</button>
    </div>
    <div v-if="props.min !== undefined || props.max !== undefined" class="limits">
      <span v-if="props.min !== undefined">最小: {{ props.min }}</span>
      <span v-if="props.max !== undefined">最大: {{ props.max }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface Props {
  initial?: number
  min?: number
  max?: number
  step?: number
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  initial: 0,
  step: 1,
  disabled: false,
})

const emit = defineEmits<{
  change: [value: number]
  reachMin: []
  reachMax: []
}>()

const count = ref(props.initial)

const displayValue = computed(() => count.value)

function increment() {
  if (props.disabled) return
  const next = count.value + props.step
  if (props.max !== undefined && next > props.max) {
    emit('reachMax')
    return
  }
  count.value = next
  emit('change', count.value)
}

function decrement() {
  if (props.disabled) return
  const next = count.value - props.step
  if (props.min !== undefined && next < props.min) {
    emit('reachMin')
    return
  }
  count.value = next
  emit('change', count.value)
}

function reset() {
  count.value = props.initial
  emit('change', count.value)
}

defineExpose({
  value: displayValue,
  increment,
  decrement,
  reset,
})
</script>

<style scoped>
.counter {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.display {
  font-size: 48px;
  font-weight: bold;
  color: #2c3e50;
  min-width: 100px;
  text-align: center;
}

.controls {
  display: flex;
  gap: 8px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-dec,
.btn-inc {
  background: #667eea;
  color: white;
  width: 48px;
}

.btn-dec:hover:not(:disabled),
.btn-inc:hover:not(:disabled) {
  background: #5568d3;
}

.btn-reset {
  background: #e0e0e0;
  color: #333;
}

.btn-reset:hover {
  background: #d0d0d0;
}

.limits {
  font-size: 12px;
  color: #999;
  display: flex;
  gap: 16px;
}
</style>
