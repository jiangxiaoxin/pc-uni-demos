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
