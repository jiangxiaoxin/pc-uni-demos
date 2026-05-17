<template>
  <div class="flow-sequence">
    <template v-for="(node, index) in nodes" :key="node.id">
      <BranchGroup
        v-if="node.type === 'branch'"
        :node="node"
        @add-after="emit('addAfter', index, $event)"
        @remove="emit('removeNode', index)"
      />

      <LoopGroup
        v-else-if="node.type === 'loop'"
        :node="node"
        @add-after="emit('addAfter', index, $event)"
        @remove="emit('removeNode', index)"
      />

      <div
        v-else
        class="flow-node-block"
        :class="{
          'flow-node-block--end': node.type === 'end',
        }"
      >
        <div class="flow-card" :class="`flow-card--${node.type}`">
          <span class="flow-card__label">
            {{ node.type === 'action' ? '动作节点' : node.title }}
          </span>
          <span v-if="node.type !== 'action'" class="flow-card__type">
            {{ nodeTypeText[node.type] }}
          </span>
          <button
            v-if="node.type === 'action'"
            class="flow-card__delete"
            type="button"
            aria-label="删除动作节点"
            @click="emit('removeNode', index)"
          >
            删除
          </button>
        </div>

        <AddNodeButton
          v-if="node.type !== 'end'"
          @add-action="emit('addAfter', index, 'action')"
          @add-branch="emit('addAfter', index, 'branch')"
          @add-loop="emit('addAfter', index, 'loop')"
        />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import AddNodeButton from './AddNodeButton.vue'
import BranchGroup from './BranchGroup.vue'
import LoopGroup from './LoopGroup.vue'
import type { AddableNodeKind, FlowNode } from './types'

/**
 * 渲染一段纵向节点序列。
 * 分支和循环内部继续引用 FlowSequence，因此所有复合节点都能递归嵌套。
 */
defineProps<{
  nodes: FlowNode[]
}>()

const emit = defineEmits<{
  addAfter: [index: number, type: AddableNodeKind]
  removeNode: [index: number]
}>()

const nodeTypeText = {
  start: '开始',
  action: '动作',
  branch: '分支',
  loop: '循环',
  end: '结束',
} as const
</script>

<style scoped>
.flow-sequence {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: max-content;
}

.flow-node-block {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.flow-card {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 180px;
  min-height: 54px;
  padding: 12px 14px;
  border: 1px solid transparent;
  border-radius: 6px;
  color: #fff;
  box-shadow: 0 8px 22px rgba(15, 23, 42, 0.08);
}

.flow-node-block--end .flow-card::before {
  content: "";
  position: absolute;
  left: 50%;
  bottom: 100%;
  width: 1px;
  height: 28px;
  background: #cbd5e1;
}

.flow-card--start {
  background: #16a34a;
}

.flow-card--action {
  justify-content: center;
  padding-right: 58px;
  padding-left: 14px;
  background: #2563eb;
}

.flow-card--end {
  background: #64748b;
}

.flow-card__label {
  font-size: 15px;
  font-weight: 700;
}

.flow-card__type {
  font-size: 12px;
  opacity: 0.82;
}

.flow-card__delete {
  position: absolute;
  right: 10px;
  top: 50%;
  height: 28px;
  padding: 0 8px;
  border: 1px solid rgba(255, 255, 255, 0.55);
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.16);
  color: #fff;
  font-size: 12px;
  cursor: pointer;
  transform: translateY(-50%);
}

.flow-card__delete:hover {
  background: rgba(255, 255, 255, 0.28);
}
</style>
