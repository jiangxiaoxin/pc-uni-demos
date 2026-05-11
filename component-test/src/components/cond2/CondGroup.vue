<template>
  <div class="cond-group" :class="{ 'is-root': isRoot }">
    <div class="rail">
      <div class="rail-line rail-line-top" />
      <div class="logic-switch">
        <button
          class="logic-btn"
          :class="{ active: logic === 'and' }"
          type="button"
          @click="setLogic('and')"
        >AND</button>
        <button
          class="logic-btn"
          :class="{ active: logic === 'or' }"
          type="button"
          @click="setLogic('or')"
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
            :fields="fields"
            @update:model-value="val => updateChild(idx, val)"
            @remove="removeChild(idx)"
          />
          <CondItem
            v-else
            :model-value="child"
            :fields="fields"
            @update:model-value="val => updateChild(idx, val)"
            @remove="removeChild(idx)"
          />
        </template>
        <div v-if="children.length === 0" class="empty">
          暂无条件，点击下方按钮添加
        </div>
      </div>

      <div class="actions">
        <button class="add-btn" type="button" @click="addCondition">
          <span class="add-icon">+</span> 添加条件
        </button>
        <button class="add-btn add-group" type="button" @click="addGroup">
          <span class="add-icon">+</span> 添加条件组
        </button>
        <button
          v-if="!isRoot"
          class="del-group-btn"
          type="button"
          @click="emit('remove')"
        >删除组</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import CondItem from './CondItem.vue'
import type { CondNode, ConditionGroup, FieldOption, Logic } from './types'
import { createCondition, createGroup } from './types'

defineOptions({ name: 'CondGroup' })

const props = defineProps<{
  modelValue: ConditionGroup
  fields: FieldOption[]
  isRoot?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: ConditionGroup): void
  (e: 'remove'): void
}>()

const children = computed(() => props.modelValue.children)
const logic = computed(() => props.modelValue.logic)

function setLogic(newLogic: Logic) {
  if (props.modelValue.logic === newLogic) return
  emit('update:modelValue', { ...props.modelValue, logic: newLogic })
}

function updateChild(idx: number, val: CondNode) {
  const next = props.modelValue.children.slice()
  next[idx] = val
  emit('update:modelValue', { ...props.modelValue, children: next })
}

function removeChild(idx: number) {
  const next = props.modelValue.children.slice()
  next.splice(idx, 1)
  emit('update:modelValue', { ...props.modelValue, children: next })
}

function addCondition() {
  if (props.fields.length === 0) return
  emit('update:modelValue', {
    ...props.modelValue,
    children: [...props.modelValue.children, createCondition(props.fields[0])],
  })
}

function addGroup() {
  // const innerLogic = props.modelValue.logic === 'and' ? 'or' : 'and'
  const innerLogic = 'and'
  emit('update:modelValue', {
    ...props.modelValue,
    children: [
      ...props.modelValue.children,
      createGroup(innerLogic, [createCondition(props.fields[0])]),
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
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
  background: linear-gradient(180deg, #e4e7ed 0%, #c7d0ff 100%);
}

.rail-line-bottom {
  margin-top: 4px;
  background: linear-gradient(180deg, #c7d0ff 0%, #e4e7ed 100%);
}

.is-root > .rail .rail-line-top {
  background: linear-gradient(180deg, transparent 0%, #c7d0ff 60%, #667eea 100%);
}

.is-root > .rail .rail-line-bottom {
  background: linear-gradient(180deg, #667eea 0%, #c7d0ff 60%, transparent 100%);
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

.add-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 28px;
  padding: 0 12px;
  background: #fff;
  color: #667eea;
  border: 1px dashed #c7d0ff;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}

.add-btn:hover {
  background: #f0f4ff;
  border-color: #667eea;
}

.add-btn.add-group {
  color: #764ba2;
  border-color: #d4c5e8;
}

.add-btn.add-group:hover {
  background: #faf5ff;
  border-color: #764ba2;
}

.add-icon {
  font-size: 14px;
  line-height: 1;
}

.del-group-btn {
  margin-left: auto;
  height: 28px;
  padding: 0 12px;
  background: transparent;
  color: #c0c4cc;
  border: 1px solid transparent;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s;
}

.del-group-btn:hover {
  background: #fff1f0;
  color: #ff4d4f;
  border-color: #ffccc7;
}
</style>
