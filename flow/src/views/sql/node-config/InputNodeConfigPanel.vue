<template>
  <div class="input-config-layout">
    <div class="input-config-sidebar">
      <div class="input-config-card input-config-card--fixed">
        <div class="input-config-card__header">
          <span>数据源</span>
          <span class="input-config-link" @click="$emit('change-source')">
            更改数据源
          </span>
        </div>
        <div class="input-config-source-name">{{ inputBinding.sourceName }}</div>
      </div>

      <div class="input-config-card input-config-card--grow">
        <div class="input-config-card__header">
          <span>字段列表</span>
          <span class="input-config-count">{{ inputBinding.fields.length }} 个字段</span>
        </div>
        <div class="input-config-fields">
          <div
            v-for="field in inputBinding.fields"
            :key="field.key"
            class="input-config-field"
          >
            <span class="input-config-field__name">{{ field.name }}</span>
            <span class="input-config-field__type">{{ field.type }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="input-config-main">
      <div class="input-config-card input-config-card--grow">
        <a-table
          class="config-table"
          :columns="selectedFieldHeaderColumns"
          :data-source="configTableRows"
          :pagination="false"
          size="small"
          :scroll="{ x: configHeaderScrollX, y: configTableScrollY }"
          row-key="__configKey"
          :show-header="true"
          table-layout="fixed"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from "vue";
  import { getPreviewRowsByBinding, type BoundInputSource, type InputField } from "../inputNodeMock";

  interface TableColumn {
    title: string;
    dataIndex: string;
    key: string;
    width?: number;
    ellipsis?: boolean;
  }

  defineEmits<{
    (e: "change-source"): void;
  }>();

  const props = defineProps<{
    inputBinding: BoundInputSource;
  }>();

  const selectedFieldHeaderColumns = computed<TableColumn[]>(() => {
    return (props.inputBinding?.fields || []).map((field: InputField) => ({
      title: field.name,
      dataIndex: field.key,
      key: field.key,
      width: 160,
      ellipsis: true,
    }));
  });

  const configTableRows = computed(() => {
    // TODO: 这里先只对 customer 做特判，是因为当前配置面板仅接了 customer 的表头/样例数据，避免其他 source 误展示半成品预览。
    if (props.inputBinding?.sourceId !== "customer") return [];
    // TODO: 这里读取的是 inputNodeMock 里的样例行数据，用来给输入节点配置面板展示前 10 条预览，后续应替换为真实的样例数据接口。
    return getPreviewRowsByBinding(props.inputBinding)
      .slice(0, 10)
      .map((row, index) => ({
        __configKey: `config-row-${index}`,
        ...row,
      }));
  });

  const configHeaderScrollX = computed(() => {
    return Math.max(selectedFieldHeaderColumns.value.length * 160, 320);
  });

  const configTableScrollY = "calc(100% - 36px)";
</script>

<style scoped lang="scss">
  .input-config-layout {
    display: grid;
    grid-template-columns: 300px minmax(0, 1fr);
    gap: 4px;
    min-height: 0;
    flex: 1;
    overflow: hidden;
  }

  .input-config-sidebar,
  .input-config-main {
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  .input-config-sidebar {
    padding: 4px 0;
    border-right: 1px solid #e2e8f0;
    overflow: hidden;
  }

  .input-config-main {
    overflow: hidden;
  }

  .input-config-card {
    min-height: 0;
    padding: 4px 6px;
    background: transparent;
  }

  .input-config-card__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 4px;
    min-height: 20px;
    font-size: 13px;
    font-weight: 600;
    color: #334155;
  }

  .input-config-card--fixed {
    flex: 0 0 48px;
  }

  .input-config-card--grow {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }

  .input-config-link {
    flex-shrink: 0;
    font-size: 12px;
    font-weight: 500;
    line-height: 18px;
    color: #1677ff;
    cursor: pointer;
    user-select: none;
  }

  .input-config-source-name {
    font-size: 13px;
    font-weight: 600;
    color: #0f172a;
    line-height: 18px;
    word-break: break-all;
  }

  .input-config-count {
    font-size: 12px;
    font-weight: 500;
    color: #64748b;
  }

  .input-config-fields {
    display: flex;
    flex-direction: column;
    flex: 1;
    gap: 2px;
    overflow: auto;
    min-height: 0;
    padding-top: 2px;
  }

  .input-config-field {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 4px 6px;
    background: #fff;
  }

  .input-config-field__name {
    min-width: 0;
    font-size: 12px;
    color: #0f172a;
    word-break: break-all;
    line-height: 18px;
  }

  .input-config-field__type {
    flex-shrink: 0;
    font-size: 11px;
    color: #64748b;
    line-height: 18px;
  }

  .input-config-main :deep(.config-table .ant-table-cell) {
    padding: 4px 6px;
  }

  .input-config-main :deep(.config-table.ant-table-wrapper),
  .input-config-main :deep(.config-table .ant-spin-nested-loading),
  .input-config-main :deep(.config-table .ant-spin-container),
  .input-config-main :deep(.config-table .ant-table),
  .input-config-main :deep(.config-table .ant-table-container) {
    height: 100%;
    min-height: 0;
  }

  .input-config-main :deep(.config-table .ant-table-body) {
    overflow-y: auto;
  }
</style>
