<template>
  <a-drawer
    :open="visible"
    title="属性面板"
    placement="right"
    :width="500"
    @close="handleClose"
  >
    <div class="property-content">
      <div>当前节点 ID：{{ nodeId || "未选择" }}</div>
    </div>
  </a-drawer>
</template>

<script setup lang="ts">
const props = defineProps<{
  visible: boolean;
  nodeId: string;
}>();

const emit = defineEmits<{
  (e: "update:visible", value: boolean): void;
}>();

const handleClose = () => {
  emit("update:visible", false);
};
</script>

<style scoped lang="scss">
.property-content {
  padding: 16px;
  background: #f5f5f5;
  border-radius: 6px;
  min-height: 200px;
}
</style>
