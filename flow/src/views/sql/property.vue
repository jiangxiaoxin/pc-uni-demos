<template>
  <div class="property-panel" :class="{ 'property-panel--visible': visible }">
    <template v-if="visible && nodeData">
      <div class="property-top">
        <div class="property-meta">
          <component :is="nodeIconComponent" class="property-node-icon" />
          <div class="property-node-type">{{ nodeTypeLabel }}</div>
          <div class="property-name-field">
            <span class="property-name-label">节点名称:</span>
            <a-input
              v-model:value="editableName"
              class="property-node-input"
              :bordered="false"
              placeholder="请输入节点名称"
              @pressEnter="handleSubmitName"
              @blur="handleSubmitName"
            />
          </div>
        </div>

        <div class="property-tabs" role="tablist" aria-label="节点属性标签">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            type="button"
            class="property-tab"
            :class="{ 'property-tab--active': activeTab === tab.key }"
            @click="activeTab = tab.key"
          >
            {{ tab.label }}
          </button>
        </div>
      </div>

      <div class="property-bottom">
        <template v-if="activeTab === 'config'">
          <template v-if="isInputNode && inputBinding">
            <div class="input-config-layout">
              <div class="input-config-sidebar">
                <div class="input-config-card">
                  <div class="input-config-card__header">
                    <span>数据源</span>
                    <a-button size="small" type="link" @click="emit('change-input-source')">
                      更改数据源
                    </a-button>
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
                  <div class="input-config-card__header">
                    <span>字段结构</span>
                  </div>
                  <a-table
                    :columns="fieldTableColumns"
                    :data-source="inputBinding.fields"
                    :pagination="false"
                    size="small"
                    :scroll="{ y: 220 }"
                    row-key="key"
                  />
                </div>
              </div>
            </div>
          </template>

          <template v-else>
            <div class="property-row">
              <span class="property-label">节点 ID</span>
              <span class="property-value">{{ nodeData.id }}</span>
            </div>
            <div class="property-row">
              <span class="property-label">节点类型</span>
              <span class="property-value">{{ nodeData.type }}</span>
            </div>
            <div class="property-row">
              <span class="property-label">颜色</span>
              <span class="property-value">{{ nodeColor }}</span>
            </div>
          </template>
        </template>

        <template v-else-if="activeTab === 'preview'">
          <template v-if="isInputNode && inputBinding">
            <div class="input-config-card input-config-card--grow">
              <div class="input-config-card__header">
                <span>数据预览</span>
                <span class="input-config-count">{{ inputPreviewRows.length }} 行</span>
              </div>
              <a-table
                :columns="previewTableColumns"
                :data-source="inputPreviewRows"
                :pagination="false"
                size="small"
                :scroll="{ x: 'max-content', y: 260 }"
                row-key="__previewKey"
              />
            </div>
          </template>

          <template v-else>
            <div class="property-preview-card">
              <pre class="property-preview-content">{{ previewContent }}</pre>
            </div>
          </template>
        </template>

        <template v-else>
          <a-textarea
            v-model:value="editableRemark"
            :auto-size="{ minRows: 6, maxRows: 10 }"
            placeholder="请输入节点备注"
            @blur="handleSubmitRemark"
          />
        </template>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from "vue";
  import { getNodeTypeConfig } from "./menus";
  import { defaultSqlNodeIcon, sqlNodeIconMap } from "./nodes/iconMap";
  import {
    getPreviewRowsByBinding,
    type BoundInputSource,
    type InputField,
  } from "./inputNodeMock";

  interface SqlNodeData {
    id: string;
    type: string;
    properties?: Record<string, unknown>;
  }

  interface TableColumn {
    title: string;
    dataIndex: string;
    key: string;
    width?: number;
  }

  const emit = defineEmits<{
    (e: "submit-name", name: string): void;
    (e: "submit-property", payload: { key: string; value: string }): void;
    (e: "change-input-source"): void;
  }>();

  const props = withDefaults(
    defineProps<{
      visible?: boolean;
      nodeData?: SqlNodeData | null;
    }>(),
    {
      visible: false,
      nodeData: null,
    },
  );

  const editableName = ref("");
  const editableRemark = ref("");
  const activeTab = ref<"config" | "preview" | "remark">("config");
  const tabs = [
    { key: "config" as const, label: "节点配置" },
    { key: "preview" as const, label: "数据预览" },
    { key: "remark" as const, label: "节点备注" },
  ];

  const nodeConfig = computed(() => {
    if (!props.nodeData) return undefined;
    return getNodeTypeConfig(props.nodeData.type);
  });

  const nodeLabel = computed(() => {
    if (!props.nodeData) return "";
    return (
      String(props.nodeData.properties?.title || "") ||
      String(props.nodeData.properties?.name || "") ||
      nodeConfig.value?.name ||
      props.nodeData.type
    );
  });

  const nodeTypeLabel = computed(() => {
    return nodeConfig.value?.name || props.nodeData?.type || "";
  });

  const nodeColor = computed(() => {
    if (props.nodeData?.properties?.color) {
      return String(props.nodeData.properties.color);
    }
    return nodeConfig.value?.color || "#0369A1";
  });

  const nodeIconComponent = computed(() => {
    return sqlNodeIconMap[props.nodeData?.type || ""] || defaultSqlNodeIcon;
  });

  const previewContent = computed(() => {
    if (!props.nodeData) return "";
    return JSON.stringify(props.nodeData, null, 2);
  });

  const isInputNode = computed(() => props.nodeData?.type === "in-node");

  const inputBinding = computed<BoundInputSource | null>(() => {
    const binding = props.nodeData?.properties?.inputBinding;
    if (!binding || typeof binding !== "object") return null;
    return binding as BoundInputSource;
  });

  const fieldTableColumns = computed<TableColumn[]>(() => [
    { title: "字段名称", dataIndex: "name", key: "name" },
    { title: "字段类型", dataIndex: "type", key: "type", width: 180 },
  ]);

  const previewTableColumns = computed<TableColumn[]>(() => {
    return (inputBinding.value?.fields || []).map((field: InputField) => ({
      title: field.name,
      dataIndex: field.key,
      key: field.key,
      width: 180,
    }));
  });

  const inputPreviewRows = computed(() => {
    return getPreviewRowsByBinding(inputBinding.value).map((row, index) => ({
      __previewKey: `${props.nodeData?.id || "node"}-${index}`,
      ...row,
    }));
  });

  watch(
    () => [props.visible, nodeLabel.value, props.nodeData?.id],
    () => {
      editableName.value = nodeLabel.value;
      editableRemark.value = String(props.nodeData?.properties?.remark || "");
      activeTab.value = "config";
    },
    { immediate: true },
  );

  const handleSubmitName = () => {
    const nextName = editableName.value.trim();
    if (!nextName || nextName === nodeLabel.value) {
      editableName.value = nodeLabel.value;
      return;
    }
    emit("submit-name", nextName);
  };

  const handleSubmitRemark = () => {
    const nextRemark = editableRemark.value.trim();
    const currentRemark = String(props.nodeData?.properties?.remark || "");
    if (nextRemark === currentRemark) {
      editableRemark.value = currentRemark;
      return;
    }
    emit("submit-property", {
      key: "remark",
      value: nextRemark,
    });
  };
</script>

<style lang="scss" scoped>
  .property-panel {
    width: 100%;
    height: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    border-top: 0 solid #e8e8e8;
    background: #fff;
    transition:
      height 0.24s ease,
      border-top-width 0.24s ease,
      padding 0.24s ease;
    padding: 0 20px;
    box-sizing: border-box;
  }

  .property-panel--visible {
    height: 400px;
    border-top-width: 1px;
    padding: 16px 20px;
  }

  .property-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    min-height: 40px;
    padding-bottom: 12px;
    flex-wrap: wrap;
    border-bottom: 1px solid #e5e7eb;
  }

  .property-meta,
  .property-tabs {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    min-width: 0;
  }

  .property-node-icon {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
    color: v-bind(nodeColor);
  }

  .property-node-type {
    flex-shrink: 0;
    font-size: 13px;
    line-height: 20px;
    font-weight: 600;
    color: #334155;
    white-space: nowrap;
  }

  .property-name-label {
    flex-shrink: 0;
    font-size: 13px;
    color: #475569;
    white-space: nowrap;
  }

  .property-name-field {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 240px;
    max-width: 100%;
    margin-left: 12px;
  }

  .property-node-input {
    flex: 1;
    min-width: 0;
    height: 32px;
    padding: 0 10px;
    border: 1px solid #dbe2ea;
    border-radius: 8px;
    background: #f8fafc;

    :deep(.ant-input) {
      height: 30px;
      padding: 0;
      font-size: 14px;
      font-weight: 500;
      color: #0f172a;
      background: transparent;
    }
  }

  .property-tab {
    height: 32px;
    padding: 0 12px;
    border: 1px solid #dbe2ea;
    border-radius: 999px;
    background: #f8fafc;
    color: #64748b;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .property-tab--active {
    border-color: #7dd3fc;
    background: #e0f2fe;
    color: #0369a1;
  }

  .property-bottom {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
    overflow: auto;
    padding-top: 16px;
  }

  .property-row {
    display: grid;
    grid-template-columns: 88px 1fr;
    gap: 12px;
    align-items: start;
    padding: 10px 12px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
  }

  .property-label {
    font-size: 12px;
    font-weight: 600;
    color: #64748b;
  }

  .property-value {
    font-size: 13px;
    color: #0f172a;
    word-break: break-all;
  }

  .property-preview-card,
  .input-config-card {
    min-height: 0;
    padding: 14px 16px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
  }

  .property-preview-card,
  .input-config-card--grow {
    flex: 1;
  }

  .property-preview-content {
    height: 100%;
    margin: 0;
    overflow: auto;
    font-size: 12px;
    line-height: 1.6;
    color: #0f172a;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .input-config-layout {
    display: grid;
    grid-template-columns: 280px minmax(0, 1fr);
    gap: 12px;
    min-height: 0;
    flex: 1;
  }

  .input-config-sidebar,
  .input-config-main {
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-height: 0;
  }

  .input-config-card__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 12px;
    font-size: 13px;
    font-weight: 600;
    color: #334155;
  }

  .input-config-source-name {
    font-size: 14px;
    font-weight: 600;
    color: #0f172a;
  }

  .input-config-count {
    font-size: 12px;
    font-weight: 500;
    color: #64748b;
  }

  .input-config-fields {
    display: flex;
    flex-direction: column;
    gap: 8px;
    overflow: auto;
  }

  .input-config-field {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 10px 12px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    background: #fff;
  }

  .input-config-field__name {
    min-width: 0;
    font-size: 13px;
    color: #0f172a;
    word-break: break-all;
  }

  .input-config-field__type {
    flex-shrink: 0;
    font-size: 12px;
    color: #64748b;
  }

  .property-bottom :deep(.ant-input),
  .property-bottom :deep(.ant-input-affix-wrapper),
  .property-bottom :deep(.ant-input-textarea textarea) {
    border-radius: 8px;
  }
</style>
