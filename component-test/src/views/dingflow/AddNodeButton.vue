<template>
  <div class="add-node">
    <span class="add-node__line" aria-hidden="true"></span>
    <div class="add-node__actions">
      <a-dropdown
        v-model:open="open"
        :trigger="['click']"
        :get-popup-container="getPopupContainer"
        overlay-class-name="dingflow-add-node-dropdown"
      >
        <button
          class="add-node__main"
          type="button"
          aria-label="添加下一个节点"
          :aria-expanded="open"
        >
          <span>下一步</span>
        </button>

        <template #overlay>
          <a-menu @click="handleMenuClick">
            <a-menu-item key="action">动作</a-menu-item>
            <a-menu-item key="branch">分支</a-menu-item>
            <a-menu-item key="loop">循环</a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { MenuInfo } from 'ant-design-vue/es/menu/src/interface'
import type { AddableNodeKind } from './types'

const emit = defineEmits<{
  addAction: []
  addBranch: []
  addLoop: []
}>()

const open = ref(false)

function selectNode(type: AddableNodeKind) {
  if (type === 'action') {
    emit('addAction')
  } else if (type === 'branch') {
    emit('addBranch')
  } else {
    emit('addLoop')
  }

  open.value = false
}

function handleMenuClick(info: MenuInfo) {
  selectNode(info.key as AddableNodeKind)
}

function getPopupContainer() {
  return document.body
}
</script>

<style scoped>
.add-node {
  position: relative;
  display: flex;
  justify-content: center;
  width: 100%;
  height: 72px;
}

.add-node__line::before,
.add-node__line::after {
  content: "";
  position: absolute;
  left: 50%;
  width: 10px;
  background: blue;
  transform: translateX(-50%);
}

.add-node__line::before {
  top: 0;
  height: 24px;
}

.add-node__line::after {
  bottom: 0;
  height: 24px;
}

.add-node__actions {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 3;
  transform: translate(-50%, -50%);
}

.add-node__main {
  /* display: grid;
  place-items: center; */
  min-width: 64px;
  height: 28px;
  padding: 0 12px;
  border: none;
  border-radius: 999px;
  background: #1677ff;
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  line-height: 1;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(22, 119, 255, 0.28);
}

.add-node__main span {
  margin-top: 0;
}

:global(.dingflow-add-node-dropdown) {
  z-index: 3000;
}
</style>
