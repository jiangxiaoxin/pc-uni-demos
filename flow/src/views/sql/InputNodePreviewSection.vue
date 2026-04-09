<template>
  <div class="input-preview">
    <!-- <div class="input-preview__header">
      <span class="input-preview__title">数据预览</span>
      <span class="input-preview__meta">{{ rows.length }} 行</span>
    </div> -->

    <div class="input-preview__table-wrap">
      <a-table
        class="input-preview__table"
        :loading="loading"
        :columns="tableColumns"
        :data-source="rows"
        :pagination="false"
        size="small"
        :scroll="{ x: scrollX, y: scrollY }"
        row-key="__previewKey"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from "vue";
  import {
    fetchInputPreviewByBinding,
    type BoundInputSource,
    type InputField,
  } from "./inputNodeMock";

  interface TableColumn {
    title: string;
    dataIndex: string;
    key: string;
    width?: number;
    ellipsis?: boolean;
  }

  const props = defineProps<{
    inputBinding: BoundInputSource;
  }>();

  const loading = ref(false);
  const columns = ref<InputField[]>([]);
  const rows = ref<Record<string, unknown>[]>([]);
  let requestToken = 0;

  const tableColumns = computed<TableColumn[]>(() => {
    return columns.value.map((field) => ({
      title: field.name,
      dataIndex: field.key,
      key: field.key,
      width: 120,
      ellipsis: true,
    }));
  });

  const scrollX = computed(() => {
    return Math.max(tableColumns.value.length * 120, 320);
  });

  const scrollY = "calc(100% - 40px)";

  const loadPreview = async () => {
    const token = ++requestToken;
    loading.value = true;
    try {
      const result = await fetchInputPreviewByBinding(props.inputBinding);
      if (token !== requestToken) return;
      columns.value = result.columns;
      rows.value = result.rows.map((row, index) => ({
        __previewKey: `${props.inputBinding.sourceId}-${index}`,
        ...row,
      }));
    } finally {
      if (token === requestToken) {
        loading.value = false;
      }
    }
  };

  watch(
    () => props.inputBinding,
    () => {
      void loadPreview();
    },
    { immediate: true, deep: true },
  );
</script>

<style scoped lang="scss">
  .input-preview {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
    padding: 4px 6px;
  }

  // .input-preview__header {
  //   display: flex;
  //   align-items: center;
  //   justify-content: space-between;
  //   min-height: 20px;
  //   color: #334155;
  // }

  // .input-preview__title {
  //   font-size: 13px;
  //   font-weight: 600;
  //   line-height: 20px;
  // }

  // .input-preview__meta {
  //   font-size: 12px;
  //   font-weight: 500;
  //   line-height: 20px;
  //   color: #64748b;
  // }

  .input-preview__table-wrap {
    flex: 1;
    min-height: 0;
  }

  .input-preview :deep(.input-preview__table.ant-table-wrapper),
  .input-preview :deep(.input-preview__table .ant-spin-nested-loading),
  .input-preview :deep(.input-preview__table .ant-spin-container),
  .input-preview :deep(.input-preview__table .ant-table),
  .input-preview :deep(.input-preview__table .ant-table-container) {
    height: 100%;
    min-height: 0;
  }

  .input-preview :deep(.input-preview__table .ant-table-container) {
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  .input-preview :deep(.input-preview__table .ant-table-body) {
    flex: 1;
    min-height: 0;
    overflow: auto;
  }

  .input-preview :deep(.input-preview__table .ant-table-placeholder),
  .input-preview
    :deep(.input-preview__table .ant-table-tbody > .ant-table-placeholder > .ant-table-cell) {
    height: 100%;
  }

  .input-preview :deep(.input-preview__table .ant-empty) {
    margin-block: 0;
  }
</style>
