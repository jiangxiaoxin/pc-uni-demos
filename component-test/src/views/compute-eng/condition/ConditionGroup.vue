<template>
  <div class="cond-group" :class="{ 'is-root': isRoot }">
    <div class="rail">
      <div class="rail-line rail-line-top" />
      <div class="logic-switch">
        <button
          class="logic-btn"
          :class="{ active: logic === logic_and }"
          type="button"
          @click="setLogic(logic_and)"
        >AND</button>
        <button
          class="logic-btn"
          :class="{ active: logic === logic_or }"
          type="button"
          @click="setLogic(logic_or)"
        >OR</button>
      </div>
      <div class="rail-line rail-line-bottom" />
    </div>

    <div class="body">
      <div class="children">
        <template v-for="(child, idx) in children" :key="child.id">
          <CondGroup
            v-if="child.type === 'group'"
            :model-value="child"
            :fixed-condition-source="fixedConditionSource"
            :fixed-point="fixedPoint"
            :fixed-point-label="fixedPointLabel"
            :point-tree-data="pointTreeData"
            :point-tree-loading="pointTreeLoading"
            :fixed-value-type="fixedValueType"
            @update:model-value="val => updateChild(idx, val)"
            @remove="removeChild(idx)"
          />
          <CondItem
            v-else
            :model-value="child"
            :fixed-condition-source="fixedConditionSource"
            :fixed-point="fixedPoint"
            :fixed-point-label="fixedPointLabel"
            :point-tree-data="pointTreeData"
            :point-tree-loading="pointTreeLoading"
            :fixed-value-type="fixedValueType"
            @update:model-value="val => updateChild(idx, val)"
            @remove="removeChild(idx)"
          />
        </template>
        <div v-if="children.length === 0" class="empty">
          暂无条件，点击下方按钮添加
        </div>
      </div>

      <div class="actions">
        <a-button type="primary" @click="addCondition" size="small">
          <span class="add-icon">+</span> 添加条件
        </a-button>
        <a-button type="primary" @click="addGroup" size="small">
          <span class="add-icon">+</span> 添加条件组
        </a-button>
        <a-button
          v-if="!isRoot"
          type="primary"
          danger
          size="small"
          @click="emit('remove')"
        >删除组</a-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import CondItem from './ConditionItem.vue'
import type { CondNode, ConditionGroup, Logic, PointTreeNode, ValueType } from './types'
import { createDefaultCondition, createDefaultGroup, logic_and, logic_or } from './types'

defineOptions({ name: 'CondGroup' })

const props = withDefaults(defineProps<{
  modelValue: ConditionGroup
  isRoot?: boolean
  fixedConditionSource?: string
  fixedPoint?: string
  fixedPointLabel?: string
  pointTreeData?: PointTreeNode[]
  pointTreeLoading?: boolean
  fixedValueType?: ValueType
}>(), {
  isRoot: false,
  pointTreeData: () => [],
  pointTreeLoading: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', val: ConditionGroup): void
  (e: 'remove'): void
}>()

const children = computed(() => props.modelValue.children)
const logic = computed(() => props.modelValue.logic)
const fixedConditionSource = computed(() => props.fixedConditionSource)
const fixedPoint = computed(() => props.fixedPoint)
const fixedPointLabel = computed(() => props.fixedPointLabel)
const pointTreeData = computed(() => props.pointTreeData)
const pointTreeLoading = computed(() => props.pointTreeLoading)
const fixedValueType = computed(() => props.fixedValueType)

function applyFixedConfig(node: CondNode): CondNode {
  if (!props.fixedConditionSource && props.fixedPoint === undefined && !props.fixedValueType) return node

  if (node.type === 'group') {
    return {
      ...node,
      children: node.children.map((child) => applyFixedConfig(child)),
    }
  }

  return {
    ...node,
    conditionSource: props.fixedConditionSource ?? node.conditionSource,
    point: props.fixedConditionSource || props.fixedPoint !== undefined ? props.fixedPoint : node.point,
    valueType: props.fixedValueType ?? node.valueType,
  }
}

function setLogic(newLogic: Logic) {
  if (props.modelValue.logic === newLogic) return
  emit('update:modelValue', { ...props.modelValue, logic: newLogic })
}

function updateChild(idx: number, val: CondNode) {
  const next = props.modelValue.children.slice()
  next[idx] = applyFixedConfig(val)
  emit('update:modelValue', { ...props.modelValue, children: next })
}

function removeChild(idx: number) {
  const next = props.modelValue.children.slice()
  next.splice(idx, 1)
  emit('update:modelValue', { ...props.modelValue, children: next })
}

function addCondition() {
  emit('update:modelValue', {
    ...props.modelValue,
    children: [...props.modelValue.children, applyFixedConfig(createDefaultCondition())],
  })
}

function addGroup() {
  emit('update:modelValue', {
    ...props.modelValue,
    children: [
      ...props.modelValue.children,
      applyFixedConfig(createDefaultGroup()),
    ],
  })
}
</script>

<style scoped>
.cond-group {
  display: flex;
  align-items: stretch;
  gap: 12px;
  padding: 12px;
  background: #fafbff;
  border: 1px solid #e4e7ed;
  border-radius: 10px;
  transition: border-color 0.15s;
}

.cond-group.is-root {
  background: transparent;
  border: none;
  padding: 0;
}

/* 左侧导轨：上下竖线夹住中间的关系切换 */
.rail {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}

.logic-switch {
  display: inline-flex;
  flex-direction: column;
  background: #fff;
  /* border: 1px solid #dcdfe6; */
  /* border-radius: 6px; */
  overflow: hidden;
}

.logic-btn {
  width: 44px;
  height: 26px;
  border: none;
  background: transparent;
  color: #909399;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.logic-btn:hover:not(.active) {
  background: #f5f7fa;
  color: #606266;
}

.logic-btn.active {
  background: #667eea;
  color: #fff;
}

.rail-line {
  flex: 1;
  width: 2px;
  border-radius: 1px;
  min-height: 8px;
}

.rail-line-top {
  margin-bottom: 4px;
}

.rail-line-bottom {
  margin-top: 4px;
}

.rail-line-top {
  background: #667eea;
}

.rail-line-bottom {
  background: #667eea;
}

/* 右侧主体 */
.body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.children {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.empty {
  padding: 12px;
  font-size: 13px;
  color: #c0c4cc;
  text-align: center;
  border: 1px dashed #e4e7ed;
  border-radius: 6px;
  background: #fff;
}

.actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  padding-top: 2px;
}

.add-icon {
  font-size: 14px;
  line-height: 1;
}
</style>
