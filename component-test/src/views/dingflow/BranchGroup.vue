<template>
  <div class="branch-group">
    <div class="branch-group__toolbar">
      <div class="branch-title-card">
        <span>{{ node.title }}</span>
        <button
          class="branch-title-card__delete"
          type="button"
          aria-label="删除条件分支"
          @click="emit('remove')"
        >
          删除
        </button>
      </div>
      <button class="branch-add-button" type="button" @click="addBranch">增加分支</button>
    </div>

    <div class="branch-group__body" :style="{ '--branch-count': String(node.branches.length) }">
      <div
        v-for="(branch, branchIndex) in node.branches"
        :key="branch.id"
        class="branch-column"
      >
        <div class="branch-condition">
          <input
            v-model="branch.condition"
            class="branch-condition__input"
            aria-label="分支条件"
          />
          <button type="button" @click="removeBranch(branchIndex)">删除</button>
        </div>

        <AddNodeButton
          @add-action="addBranchChild(branch.children, 'action')"
          @add-branch="addBranchChild(branch.children, 'branch')"
          @add-loop="addBranchChild(branch.children, 'loop')"
        />

        <FlowSequence
          v-if="branch.children.length > 0"
          :nodes="branch.children"
          @add-after="(index, type) => addAfter(branch.children, index, type)"
          @remove-node="(index) => removeChild(branch.children, index)"
        />
      </div>
    </div>

    <div class="branch-group__join">
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
import {
  createActionNode,
  createBranchLine,
  createBranchNode,
  createLoopNode,
  type AddableNodeKind,
  type BranchFlowNode,
  type FlowNode,
} from './types'

const FlowSequence = defineAsyncComponent(() => import('./FlowSequence.vue'))

const props = defineProps<{
  node: BranchFlowNode
}>()

const emit = defineEmits<{
  addAfter: [type: AddableNodeKind]
  remove: []
}>()

function createNextNode(type: AddableNodeKind) {
  if (type === 'action') return createActionNode()
  if (type === 'branch') return createBranchNode()
  return createLoopNode()
}

function addBranchChild(children: FlowNode[], type: AddableNodeKind) {
  children.unshift(createNextNode(type))
}

function addAfter(nodes: FlowNode[], index: number, type: AddableNodeKind) {
  nodes.splice(index + 1, 0, createNextNode(type))
}

function removeChild(nodes: FlowNode[], index: number) {
  nodes.splice(index, 1)
}

function addBranch() {
  props.node.branches.push(createBranchLine(props.node.branches.length + 1))
}

function removeBranch(index: number) {
  props.node.branches.splice(index, 1)

  if (props.node.branches.length <= 1) {
    emit('remove')
  }
}
</script>
