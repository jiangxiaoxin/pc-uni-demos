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

      <div v-else class="flow-node-shell">
        <StartNode
          v-if="node.type === 'start'"
          :node="node"
        />

        <ActionNode
          v-else-if="node.type === 'action'"
          :node="node"
          @remove="emit('removeNode', index)"
        />

        <EndNode
          v-else
          :node="node"
        />

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
import ActionNode from './nodes/ActionNode.vue'
import EndNode from './nodes/EndNode.vue'
import StartNode from './nodes/StartNode.vue'
import type { AddableNodeKind, FlowNode } from './types'

defineProps<{
  nodes: FlowNode[]
}>()

const emit = defineEmits<{
  addAfter: [index: number, type: AddableNodeKind]
  removeNode: [index: number]
}>()
</script>

<style scoped>
.flow-sequence {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: max-content;
}

.flow-node-shell {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
