<template>
  <a-drawer
    :open="visible"
    title="属性面板"
    placement="right"
    :width="500"
    :maskClosable="false"
    @close="handleClose"
  >
    <template #extra>
      <a-button size="small" style="margin-right: 8px" @click="handleClose">
        取消
      </a-button>
      <a-button type="primary" size="small" @click="handleConfirm">
        确定
      </a-button>
    </template>
    <div class="property-content">
      <div class="info-row">
        <span class="label">节点 ID：</span>
        <span class="value">{{ localNodeId || "未选择" }}</span>
      </div>

      <div class="info-row">
        <span class="label">节点标题：</span>
        <a-input
          :value="titleValue"
          placeholder="请输入节点标题"
          size="small"
          @change="handleTitleChange"
        />
      </div>

      <template v-if="localNodeId">
        <div class="config-section">
          <div class="section-title">属性配置</div>
          <div
            v-for="(value, key) in currentConfig"
            :key="key"
            class="info-row"
          >
            <span class="label">{{ key }}：</span>
            <span class="value">{{ value }}</span>
          </div>
        </div>
      </template>

      <template v-else>
        <div class="empty-tip">该节点暂无属性配置</div>
      </template>
    </div>
  </a-drawer>
</template>

<script setup lang="ts">
  import { computed, inject, nextTick, ref, type Ref } from "vue";
  import { NODE_CONFIGS_KEY } from "./symbols";

  const emit = defineEmits<{
    (e: "update-title", payload: { nodeId: string; title: string }): void;
  }>();

  const visible = ref(false);

  const nodeConfigs = inject<Ref<Record<string, any>>>(
    NODE_CONFIGS_KEY,
    ref({}),
  );

  const currentConfig = computed(() => {
    if (!localNodeId.value) return null;
    return nodeConfigs.value[localNodeId.value] || null;
  });

  // 标题本地编辑值
  const titleValue = ref("");
  const localNodeId = ref("");
  const localNodeProperties = ref<Record<string, any>>({}); //TODO 这个 properties 大概率并不用，因为属性是单独放置的对象

  const open = (nodeId: string, nodeProperties: Record<string, any>) => {
    localNodeId.value = nodeId;
    localNodeProperties.value = nodeProperties;
    titleValue.value = nodeProperties.title || nodeProperties.name || "";
    visible.value = true
  };

  const clearData = () => {
    nextTick(() => {
      localNodeId.value = "";
      localNodeProperties.value = {};
      titleValue.value = "";
    });
  };

  const handleTitleChange = (e: Event) => {
    titleValue.value = (e.target as HTMLInputElement).value;
  };

  const handleConfirm = () => {
    const title = titleValue.value.trim()
    if (localNodeId.value && title) {
      emit("update-title", {
        nodeId: localNodeId.value,
        title: title,
      });
    }
    handleClose()
  };

  const handleClose = () => {
    visible.value = false;
    clearData();
  };

  defineExpose({
    open,
    close: handleClose
  });

</script>

<style scoped lang="scss">
  .property-content {
    // padding: 16px; // 不要这么多的空余
  }

  .info-row {
    display: flex;
    align-items: center;
    margin-bottom: 16px;
    font-size: 14px;

    .label {
      color: #666;
      flex-shrink: 0;
      margin-right: 8px;
      width: 80px;
    }

    .value {
      color: #262626;
      font-weight: 500;
      flex: 1;
    }

    :deep(.ant-input) {
      flex: 1;
    }
  }

  .config-section {
    margin-top: 16px;
    padding: 12px;
    background: #f5f5f5;
    border-radius: 6px;

    .section-title {
      font-size: 13px;
      font-weight: 600;
      color: #262626;
      margin-bottom: 10px;
      padding-bottom: 8px;
      border-bottom: 1px solid #e8e8e8;
    }
  }

  .empty-tip {
    margin-top: 16px;
    padding: 24px;
    text-align: center;
    color: #999;
    font-size: 13px;
    background: #f5f5f5;
    border-radius: 6px;
  }
</style>
