<template>
  <div class="loop-group" :style="{ '--debug-box-color': debugBoxColor }">
    <div class="loop-group__toolbar">
      <div class="loop-title-card">
        <span>{{ node.title }}</span>
        <button
          class="loop-title-card__delete"
          type="button"
          aria-label="删除循环节点"
          @click="emit('remove')"
        >
          删除
        </button>
      </div>
    </div>

    <div class="loop-group__body">
      <div class="loop-return" aria-hidden="true">
        <span class="loop-return__label">循环</span>
      </div>

      <div class="loop-content">
        <AddNodeButton
          @add-action="addLoopChild('action')"
          @add-branch="addLoopChild('branch')"
          @add-loop="addLoopChild('loop')"
        />

        <FlowSequence
          v-if="node.children.length > 0"
          :nodes="node.children"
          @add-after="addAfter"
          @remove-node="removeChild"
        />
      </div>
    </div>

    <div class="loop-group__join">
      <AddNodeButton
        @add-action="emit('addAfter', 'action')"
        @add-branch="emit('addAfter', 'branch')"
        @add-loop="emit('addAfter', 'loop')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
import AddNodeButton from './AddNodeButton.vue'
import { getDebugBoxColor } from './debugColor'
import {
  createActionNode,
  createBranchNode,
  createLoopNode,
  type AddableNodeKind,
  type LoopFlowNode,
} from './types'

const FlowSequence = defineAsyncComponent(() => import('./FlowSequence.vue'))

const props = defineProps<{
  node: LoopFlowNode
}>()

const debugBoxColor = getDebugBoxColor(props.node.id)

const emit = defineEmits<{
  addAfter: [type: AddableNodeKind]
  remove: []
}>()

function createNextNode(type: AddableNodeKind) {
  if (type === 'action') return createActionNode()
  if (type === 'branch') return createBranchNode()
  return createLoopNode()
}

function addLoopChild(type: AddableNodeKind) {
  props.node.children.unshift(createNextNode(type))
}

function addAfter(index: number, type: AddableNodeKind) {
  props.node.children.splice(index + 1, 0, createNextNode(type))
}

function removeChild(index: number) {
  props.node.children.splice(index, 1)
}
</script>
