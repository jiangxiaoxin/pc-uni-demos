<template>
  <div class="branch-group" :style="{ '--debug-box-color': debugBoxColor }">
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
          <span class="branch-condition__title">{{ branch.condition }}</span>
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
import { getDebugBoxColor } from './debugColor'
import {
  createActionNode,
  createBranchLine,
  createBranchNode,
  createLoopNode,
  type AddableNodeKind,
  type BranchFlowNode,
  type FlowNode,
} from './types'

// BranchGroup 和 FlowSequence 相互递归引用，用异步组件打断静态 import 循环。
const FlowSequence = defineAsyncComponent(() => import('./FlowSequence.vue'))

const props = defineProps<{
  node: BranchFlowNode
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

/** 分支内点击“下一步”时，把新节点放到该分支节点序列的最前面。 */
function addBranchChild(children: FlowNode[], type: AddableNodeKind) {
  children.unshift(createNextNode(type))
}

/** 子序列里某个节点后添加节点，直接修改对应分支的 children 数组。 */
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

  // 分支组只剩一条分支时不再具备分支意义，交给父序列删除整个分支节点。
  if (props.node.branches.length <= 1) {
    emit('remove')
  }
}
</script>

<style scoped>
.branch-group {
  --branch-gap: 0px;
  --branch-width: 220px;

  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: max-content;
}

:global(.editor-shell--debug-box) .branch-group::before {
  /* 调试包围盒不参与布局，只用来观察递归节点真实占位。 */
  content: "";
  position: absolute;
  inset: -10px -12px;
  z-index: 0;
  border: 1px dashed var(--debug-box-color, #334155);
  border-radius: 8px;
  pointer-events: none;
}

.branch-group > * {
  position: relative;
  z-index: 1;
}

.branch-group__toolbar {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  background: var(--flow-bg);
  color: #475569;
  font-size: 13px;
  font-weight: 600;
}

.branch-add-button {
  position: relative;
  height: 28px;
  padding: 0 10px;
  border: 1px solid #bfdbfe;
  border-radius: 5px;
  background: #eff6ff;
  color: #1d4ed8;
  cursor: pointer;
}

.branch-add-button::before {
  content: "";
  position: absolute;
  left: 50%;
  bottom: 100%;
  width: 1px;
  height: 8px;
  background: #cbd5e1;
  transform: translateX(-50%);
}

.branch-title-card {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 180px;
  min-height: 54px;
  padding: 12px 58px 12px 14px;
  border: 1px solid transparent;
  border-radius: 6px;
  background: #7c3aed;
  color: #fff;
  box-shadow: 0 8px 22px rgba(15, 23, 42, 0.08);
}

.branch-title-card span {
  font-size: 15px;
  font-weight: 700;
}

.branch-title-card__delete {
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

.branch-title-card__delete:hover {
  background: rgba(255, 255, 255, 0.28);
}

.branch-group__body {
  position: relative;
  display: flex;
  align-items: stretch;
  gap: var(--branch-gap);
  min-width: calc(var(--branch-count) * var(--branch-width));
  padding: 28px 18px 0;
  /* 中心窄遮罩用于擦除父级贯穿线，避免递归嵌套时父线穿过子分支组。 */
  background-image: linear-gradient(var(--flow-bg), var(--flow-bg));
  background-position: center top;
  background-repeat: no-repeat;
  background-size: 16px 100%;
}

.branch-group__body::before,
.branch-group__body::after {
  content: "";
  position: absolute;
  left: 50%;
  width: 1px;
  height: 28px;
  background: #cbd5e1;
  transform: translateX(-50%);
}

.branch-group__body::before {
  top: 0;
}

.branch-group__body::after {
  bottom: -28px;
}

.branch-column {
  position: relative;
  display: flex;
  /* 让嵌套分支的实际宽度参与父级布局，避免深层节点溢出压盖兄弟分支。 */
  flex: 0 0 max-content;
  flex-direction: column;
  align-items: center;
  min-width: var(--branch-width);
  padding: 28px 14px;
  background-image: linear-gradient(#cbd5e1, #cbd5e1);
  background-position: center top;
  background-repeat: no-repeat;
  background-size: 1px 100%;
}

.branch-column::before,
.branch-column::after {
  /* 每列自己画上下半线，首尾列截半后自然形成分支汇入/汇出的横线。 */
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  border-top: 1px solid #cbd5e1;
}

.branch-column::before {
  top: 0;
}

.branch-column::after {
  bottom: 0;
}

.branch-column:first-child::before,
.branch-column:first-child::after {
  left: 50%;
}

.branch-column:last-child::before,
.branch-column:last-child::after {
  right: 50%;
}

.branch-column > * {
  position: relative;
  z-index: 1;
}

.branch-condition {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 190px;
  min-height: 48px;
  padding: 8px;
  border: 1px solid #f59e0b;
  border-radius: 6px;
  background: #fff7ed;
  box-shadow: 0 6px 16px rgba(245, 158, 11, 0.1);
}

.branch-condition__title {
  min-width: 0;
  flex: 1;
  padding: 0 4px;
  color: #92400e;
  font-size: 13px;
  font-weight: 600;
  line-height: 26px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.branch-condition button {
  height: 26px;
  padding: 0 7px;
  border: 1px solid #fecaca;
  border-radius: 4px;
  background: #fff1f2;
  color: #be123c;
  font-size: 12px;
  cursor: pointer;
}

.branch-group__join {
  position: relative;
  width: 100%;
  min-width: max-content;
  padding-top: 28px;
}
</style>
