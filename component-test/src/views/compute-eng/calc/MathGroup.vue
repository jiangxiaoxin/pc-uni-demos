<template>
  <div class="math-group" :class="{ 'is-root': isRoot }">
    <div class="rail">
      <div class="rail-line rail-line-top" />
      <div class="rail-badge">组</div>
      <div class="rail-line rail-line-bottom" />
    </div>

    <div class="body">
      <div class="children">
        <template v-for="(child, idx) in children" :key="child.id">
          <MathGroup
            v-if="child.type === 'group'"
            :model-value="child"
            @update:model-value="val => updateChild(idx, val)"
            @remove="removeChild(idx)"
          />
          <MathItem
            v-else
            :model-value="child"
            @update:model-value="val => updateChild(idx, val)"
            @remove="removeChild(idx)"
          />

          <!-- 与下一项的运算关系 -->
          <div v-if="idx < children.length - 1" class="joiner">
            <div class="joiner-line" />
            <a-select
              :value="child.joinOperator"
              :options="math_operator_options"
              @change="val => updateJoinOperator(idx, val as MathOperator)"
              size="small"
              placeholder="关系"
              style="width: 80px; flex-shrink: 0"
            />
            <div class="joiner-line" />
          </div>
        </template>
        <div v-if="children.length === 0" class="empty">
          暂无运算项，点击下方按钮添加
        </div>
      </div>

      <div class="actions">
        <a-button type="primary" @click="addItem" size="small">
          <span class="add-icon">+</span> 添加运算项
        </a-button>
        <a-button type="primary" @click="addGroup" size="small">
          <span class="add-icon">+</span> 添加运算组
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
  import MathItem from './MathItem.vue'
  import type { MathGroup as MathGroupType, MathNode, MathOperator } from './types'
  import { math_operator_options, math_operator_add, createDefaultMathItem, createDefaultMathGroup } from './types'

  defineOptions({ name: 'MathGroup' })

  const props = withDefaults(defineProps<{
    modelValue: MathGroupType
    isRoot?: boolean
  }>(), {
    isRoot: false,
  })

  const emit = defineEmits<{
    (e: 'update:modelValue', val: MathGroupType): void
    (e: 'remove'): void
  }>()

  const children = computed(() => props.modelValue.children)

  function updateChild(idx: number, val: MathNode) {
    const next = props.modelValue.children.slice()
    next[idx] = val
    emit('update:modelValue', { ...props.modelValue, children: next })
  }

  function removeChild(idx: number) {
    const next = props.modelValue.children.slice()
    next.splice(idx, 1)

    // 如果删除的是最后一项，新的最后一项不再需要 joinOperator
    if (next.length > 0 && idx >= next.length) {
      const last = next[next.length - 1]
      if ('joinOperator' in last) {
        const clone = { ...last }
        delete (clone as any).joinOperator
        next[next.length - 1] = clone as MathNode
      }
    }

    emit('update:modelValue', { ...props.modelValue, children: next })
  }

  function updateJoinOperator(idx: number, val: MathOperator) {
    const child = props.modelValue.children[idx]
    updateChild(idx, { ...child, joinOperator: val } as MathNode)
  }

  function ensureLastHasOperator() {
    const next = props.modelValue.children.slice()
    if (next.length > 0) {
      const last = next[next.length - 1]
      if (!last.joinOperator) {
        next[next.length - 1] = { ...last, joinOperator: math_operator_add } as MathNode
      }
    }
    return next
  }

  function addItem() {
    const next = ensureLastHasOperator()
    next.push(createDefaultMathItem())
    emit('update:modelValue', { ...props.modelValue, children: next })
  }

  function addGroup() {
    const next = ensureLastHasOperator()
    next.push(createDefaultMathGroup())
    emit('update:modelValue', { ...props.modelValue, children: next })
  }
</script>

<style scoped>
  .math-group {
    display: flex;
    align-items: stretch;
    gap: 12px;
    padding: 12px;
    background: #fafbff;
    border: 1px solid #e4e7ed;
    border-radius: 10px;
    transition: border-color 0.15s;
  }

  .math-group.is-root {
    background: transparent;
    border: none;
    padding: 0;
  }

  /* 左侧导轨 */
  .rail {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex-shrink: 0;
  }

  .rail-badge {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #667eea;
    color: #fff;
    font-size: 12px;
    font-weight: 700;
    border-radius: 50%;
    margin: 4px 0;
  }

  .rail-line {
    flex: 1;
    width: 2px;
    border-radius: 1px;
    min-height: 8px;
  }

  .rail-line-top {
    margin-bottom: 4px;
    background: #667eea;
  }

  .rail-line-bottom {
    margin-top: 4px;
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

  .joiner {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 8px;
  }

  .joiner-line {
    flex: 1;
    height: 1px;
    background: #e4e7ed;
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
