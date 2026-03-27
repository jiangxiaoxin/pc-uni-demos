<template>
  <view class="json-node" :style="indentStyle">
    <view v-if="isObject" class="json-object">
      <view class="bracket" @click="toggleExpand">
        <text class="bracket-text">{{ isArray ? '[' : '{' }}</text>
        <text v-if="!isExpanded" class="ellipsis">...</text>
        <text v-if="!isExpanded" class="bracket-text">{{ isArray ? ']' : '}' }}</text>
        <text v-if="!isExpanded" class="count">{{ items.length }} items</text>
      </view>
      
      <view v-if="isExpanded" class="object-content">
        <view v-for="(item, index) in items" :key="index" class="object-item">
          <text class="key">{{ isArray ? '' : `"${item.key}": ` }}</text>
          <json-node :data="item.value" :level="level + 1" />
          <text v-if="index < items.length - 1" class="comma">,</text>
        </view>
      </view>
      
      <view v-if="isExpanded" class="bracket-close">
        <text class="bracket-text">{{ isArray ? ']' : '}' }}</text>
      </view>
    </view>
    
    <view v-else class="json-value" :class="valueType">
      <text>{{ formattedValue }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const props = defineProps<{
  data: unknown
  level: number
}>()

const isExpanded = ref(true)

const indentStyle = computed(() => ({
  paddingLeft: props.level > 0 ? '20rpx' : '0'
}))

const isObject = computed(() => {
  return props.data !== null && typeof props.data === 'object'
})

const isArray = computed(() => {
  return Array.isArray(props.data)
})

const items = computed(() => {
  if (!isObject.value) return []
  const entries = Object.entries(props.data as Record<string, unknown>)
  return entries.map(([key, value]) => ({ key, value }))
})

const valueType = computed(() => {
  const type = typeof props.data
  if (props.data === null) return 'null'
  if (type === 'string') return 'string'
  if (type === 'number') return 'number'
  if (type === 'boolean') return 'boolean'
  return type
})

const formattedValue = computed(() => {
  if (props.data === null) return 'null'
  if (typeof props.data === 'string') return `"${props.data}"`
  return String(props.data)
})

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
}
</script>

<style scoped>
.json-node {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 26rpx;
  line-height: 1.6;
}

.json-object {
  display: flex;
  flex-direction: column;
}

.bracket {
  cursor: pointer;
  user-select: none;
}

.bracket-text {
  color: #333;
  font-weight: bold;
}

.ellipsis {
  color: #999;
  margin: 0 10rpx;
}

.count {
  color: #999;
  font-size: 22rpx;
  margin-left: 10rpx;
}

.object-content {
  display: flex;
  flex-direction: column;
}

.object-item {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
}

.key {
  color: #881391;
  margin-right: 10rpx;
}

.comma {
  color: #333;
}

.json-value {
  display: inline;
}

.json-value.string {
  color: #0d7377;
}

.json-value.number {
  color: #1a73e8;
}

.json-value.boolean {
  color: #d73a49;
}

.json-value.null {
  color: #d73a49;
}

.bracket-close {
  margin-left: 0;
}
</style>
