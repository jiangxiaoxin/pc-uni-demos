<template>
  <div class="node-preview">
    <div class="node-preview__table-wrap">
      <a-table
        class="node-preview__table"
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
  import { computed, onMounted, ref } from "vue";

  interface PreviewColumn {
    key?: string;
    name?: string;
    title?: string;
    dataIndex?: string;
    width?: number;
  }

  interface PreviewResult {
    columns: PreviewColumn[];
    rows: Record<string, unknown>[];
  }

  interface TableColumn {
    title: string;
    dataIndex: string;
    key: string;
    width?: number;
    ellipsis?: boolean;
  }

  type PreviewFetcher = (payload: unknown) => Promise<PreviewResult>;
  type PreviewPayload = unknown | (() => unknown);

  const props = withDefaults(
    defineProps<{
      payload: PreviewPayload;
      fetcher: PreviewFetcher;
      rowKeyPrefix?: string;
      minColumnWidth?: number;
    }>(),
    {
      rowKeyPrefix: "preview",
      minColumnWidth: 100,
    },
  );

  const loading = ref(false);
  const columns = ref<PreviewColumn[]>([]);
  const rows = ref<Record<string, unknown>[]>([]);
  let requestToken = 0;

  const tableColumns = computed<TableColumn[]>(() => {
    return columns.value.map((column, index) => {
      const key = column.key || column.dataIndex || `col_${index}`;
      const width = Math.max(column.width || props.minColumnWidth, props.minColumnWidth);
      return {
        title: column.title || column.name || key,
        dataIndex: column.dataIndex || key,
        key,
        width,
        ellipsis: true,
      };
    });
  });

  const scrollX = computed(() => {
    const totalWidth = tableColumns.value.reduce((sum, column) => {
      return sum + (column.width || props.minColumnWidth);
    }, 0);
    return Math.max(totalWidth, 320);
  });

  const scrollY = "100%";

  const resolvePayload = () => {
    return typeof props.payload === "function" ? props.payload() : props.payload;
  };

  const loadPreview = async () => {
    const token = ++requestToken;
    loading.value = true;
    try {
      // TODO: 这里统一触发节点预览接口；当前大多传入的是 inputNodeMock 里的 mock fetcher，用于先跑通预览链路，后续应整体切换到真实后端接口。
      const result = await props.fetcher(resolvePayload());
      if (token !== requestToken) return;
      columns.value = result.columns || [];
      rows.value = (result.rows || []).map((row, index) => {
        const existedKey = String(
          (row.id as string | number | undefined) ??
            (row.key as string | number | undefined) ??
            `${props.rowKeyPrefix}-${index}`,
        );
        return {
          __previewKey: existedKey,
          ...row,
        };
      });
    } finally {
      if (token === requestToken) {
        loading.value = false;
      }
    }
  };

  onMounted(() => {
    void loadPreview();
  });
</script>

<style scoped lang="scss">
  .node-preview {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
    padding: 4px 6px;
  }

  .node-preview__table-wrap {
    flex: 1;
    min-height: 0;
  }

  .node-preview :deep(.node-preview__table.ant-table-wrapper),
  .node-preview :deep(.node-preview__table .ant-spin-nested-loading),
  .node-preview :deep(.node-preview__table .ant-spin-container),
  .node-preview :deep(.node-preview__table .ant-table),
  .node-preview :deep(.node-preview__table .ant-table-container) {
    height: 100%;
    min-height: 0;
  }

  .node-preview :deep(.node-preview__table .ant-table-container) {
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  .node-preview :deep(.node-preview__table .ant-table-body) {
    flex: 1;
    min-height: 0;
    overflow: auto;
  }

  .node-preview :deep(.node-preview__table .ant-table-placeholder),
  .node-preview
    :deep(.node-preview__table .ant-table-tbody > .ant-table-placeholder > .ant-table-cell) {
    height: 100%;
  }

  .node-preview :deep(.node-preview__table .ant-empty) {
    margin-block: 0;
  }
</style>
