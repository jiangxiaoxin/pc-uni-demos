<template>
  <div class="input-config-layout">
    <div class="input-config-sidebar">
      <div class="input-config-card input-config-card--fixed">
        <div class="input-config-card__header">
          <span>数据源</span>
          <span class="input-config-link" @click="$emit('change-source')"
            >更改数据源</span
          >
        </div>
        <div v-if="loading" class="input-config-source-name">计算中...</div>
        <div v-else class="input-config-source-name">
          {{ displayBinding?.sourceName || "-" }}
        </div>
      </div>

      <div class="input-config-card input-config-card--grow">
        <div class="input-config-card__header">
          <span>字段列表</span>
          <span class="input-config-count"
            >{{ displayBinding?.fields.length || 0 }} 个字段</span
          >
        </div>
        <div class="input-config-fields">
          <div
            v-for="field in displayBinding?.fields || []"
            :key="field.key"
            class="input-config-field"
          >
            <div class="input-config-field__main">
              <span class="input-config-field__name">{{ field.name }}</span>
              <span class="input-config-field__code">
                ( {{ field.key }} )
              </span>
            </div>
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
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, onUnmounted, ref } from "vue";
  import type {
    BoundInputSource,
    InputBindingPersisted,
  } from "../types";

  defineEmits<{
    (e: "change-source"): void;
  }>();

  const props = defineProps<{
    binding?: InputBindingPersisted;
  }>();

  const loading = ref(false);
  const localSource = ref<BoundInputSource | null>(null);
  let loadToken = 0;

  const displayBinding = computed<BoundInputSource | null>(() => {
    if (!localSource.value) return null;
    const fieldKeys = props.binding?.fieldKeys || [];
    return {
      sourceId: localSource.value.sourceId,
      sourceName: localSource.value.sourceName,
      fields: localSource.value.fields.filter((field) =>
        fieldKeys.some((key) => key.fieldKey == field.key),
      ),
    };
  });

  // TODO
  const fetchInputSourceDetail = async () => {
    await new Promise((resolve) => {
      window.setTimeout(resolve, 2000);
    });
    return {
      id: "customer" + Math.random(),
      name: "我是个customer 表" + Math.random(),
      fields: [
        {
          key: "id",
          name: "我是个id",
          type: "number",
        },
        {
          key: "name",
          name: "我是个name",
          type: "string",
        },
        {
          key: "createTime",
          name: "我是个createTime",
          type: "datetime",
        },
      ],
    };
  };

  const loadSourceDetail = async () => {
    const currentToken = ++loadToken;
    loading.value = true;
    // 打开时获取数据源字段列表详情，匹配字段名，类型等
    const result = await fetchInputSourceDetail(props.binding);
    console.log(
      "🚀 ~ InputNodeConfigSection.vue:91 ~ loadSourceDetail ~ result:",
      result,
    );

    if (currentToken !== loadToken) return;
    localSource.value = {
      sourceId: props.binding?.sourceId || result.id,
      sourceName: result.name,
      fields: result.fields || [],
    };
    loading.value = false;
  };

  // TODO 调接口
  const loadTableData = async () => {
    await new Promise((resolve) => {
      window.setTimeout(resolve, 2000);
    });
    selectedFieldHeaderColumns.value = ["id", "name", "age"].map((key) => {
      return {
        title: key,
        dataIndex: key,
        key: key,
        width: 100,
        ellipsis: true,
      };
    });
    configTableRows.value = [
      {
        id: 1,
        name: "张三",
        age: 18,
      },
      {
        id: 2,
        name: "李四",
        age: 19,
      },
      {
        id: 3,
        name: "王五",
        age: 20,
      },
    ];
  };

  onMounted(() => {
    console.log("输入节点 mounted");

    console.log("props", props.binding);

    loadSourceDetail();
    loadTableData();
  });

  onUnmounted(() => {
    console.log("输入节点 unmounted");
  });

  const selectedFieldHeaderColumns = ref<any[]>([]);

  const configTableRows = ref<any[]>([]);

  const configHeaderScrollX = computed(() => {
    return Math.max(selectedFieldHeaderColumns.value.length * 100, 320);
  });

  const configTableScrollY = "calc(100% - 40px)";

  const flushDraft = () => {
    // 当前输入节点配置面板为只读展示，字段选择通过弹窗直接修改节点属性。
    // 保留 flushDraft 以统一所有配置组件的数据流接口。
  };

  defineExpose({ flushDraft });
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
    gap: 8px;
    padding: 4px 6px;
    background: #fff;
  }

  .input-config-field__main {
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .input-config-field__name {
    min-width: 0;
    font-size: 12px;
    color: #0f172a;
    word-break: break-all;
    line-height: 18px;
  }

  .input-config-field__code {
    font-size: 11px;
    color: #64748b;
    line-height: 18px;
    white-space: nowrap;
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

  .input-config-main :deep(.config-table .ant-table-container) {
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  .input-config-main :deep(.config-table .ant-table-body) {
    flex: 1;
    min-height: 0;
    overflow: auto;
  }

  .input-config-main :deep(.config-table .ant-table-placeholder) {
    display: none;
  }

  .input-config-main :deep(.config-table .ant-empty) {
    margin-block: 0;
  }
</style>
