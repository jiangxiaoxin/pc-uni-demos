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

// LoopGroup 内部也能继续嵌套分支/循环，用异步组件避免递归 import 初始化顺序问题。
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

/** 循环节点只有右侧内容线可编辑；左侧回路线不写入节点数据。 */
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

<style scoped>
.loop-group {
  --loop-left-width: 120px;
  --loop-content-width: 220px;

  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: max-content;
}

:global(.editor-shell--debug-box) .loop-group::before {
  /* 调试包围盒不参与布局，只用来观察递归节点真实占位。 */
  content: "";
  position: absolute;
  inset: -10px -12px;
  z-index: 0;
  border: 1px dashed var(--debug-box-color, #334155);
  border-radius: 8px;
  pointer-events: none;
}

.loop-group > * {
  position: relative;
  z-index: 1;
}

.loop-group__toolbar {
  position: relative;
  z-index: 2;
  padding: 0 12px;
  background: var(--flow-bg);
}

.loop-title-card {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 180px;
  min-height: 54px;
  padding: 12px 58px 12px 14px;
  border: 1px solid transparent;
  border-radius: 6px;
  background: #0f766e;
  color: #fff;
  box-shadow: 0 8px 22px rgba(15, 23, 42, 0.08);
}

.loop-title-card span {
  font-size: 15px;
  font-weight: 700;
}

.loop-title-card__delete {
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

.loop-title-card__delete:hover {
  background: rgba(255, 255, 255, 0.28);
}

.loop-group__body {
  position: relative;
  display: flex;
  align-items: stretch;
  min-width: calc(var(--loop-left-width) + var(--loop-content-width));
  padding: 28px 18px 0;
  /* 与分支组相同，中心窄遮罩用于隔断父级竖线。 */
  background-image: linear-gradient(var(--flow-bg), var(--flow-bg));
  background-position: center top;
  background-repeat: no-repeat;
  background-size: 16px 100%;
}

.loop-group__body::before,
.loop-group__body::after {
  content: "";
  position: absolute;
  left: 50%;
  width: 1px;
  height: 28px;
  background: #cbd5e1;
  transform: translateX(-50%);
}

.loop-group__body::before {
  top: 0;
}

.loop-group__body::after {
  bottom: -28px;
}

.loop-return {
  position: relative;
  flex: 0 0 var(--loop-left-width);
  min-width: var(--loop-left-width);
  /* 左侧三条背景线分别表示回路的上横线、下横线和左竖线，不承载节点内容。 */
  background-image:
    linear-gradient(#cbd5e1, #cbd5e1),
    linear-gradient(#cbd5e1, #cbd5e1),
    linear-gradient(#cbd5e1, #cbd5e1);
  background-position:
    16px top,
    16px bottom,
    16px top;
  background-repeat: no-repeat;
  background-size:
    calc(100% - 16px) 1px,
    calc(100% - 16px) 1px,
    1px 100%;
}

.loop-return__label {
  position: absolute;
  left: 0;
  top: 50%;
  padding: 3px 6px;
  border: 1px solid #99f6e4;
  border-radius: 999px;
  background: var(--flow-bg);
  color: #0f766e;
  font-size: 12px;
  transform: translateY(-50%);
}

.loop-content {
  position: relative;
  display: flex;
  /* 右侧内容线承载循环内的递归节点，宽度随子节点展开。 */
  flex: 0 0 max-content;
  flex-direction: column;
  align-items: center;
  min-width: var(--loop-content-width);
  padding: 28px 14px;
  background-image: linear-gradient(#cbd5e1, #cbd5e1);
  background-position: center top;
  background-repeat: no-repeat;
  background-size: 1px 100%;
}

.loop-content::before,
.loop-content::after {
  content: "";
  position: absolute;
  left: 0;
  right: 50%;
  border-top: 1px solid #cbd5e1;
}

.loop-content::before {
  top: 0;
}

.loop-content::after {
  bottom: 0;
}

.loop-content > * {
  position: relative;
  z-index: 1;
}

.loop-group__join {
  position: relative;
  width: 100%;
  min-width: max-content;
  padding-top: 28px;
}
</style>
