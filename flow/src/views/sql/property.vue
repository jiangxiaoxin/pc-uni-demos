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
            <InputNodeConfigSection
              :input-binding="inputBinding"
              @change-source="emit('change-input-source')"
            />
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
            <div class="property-preview-card property-preview-card--grow">
              <div class="property-preview-header">
                <span>数据预览</span>
                <span class="property-preview-count">{{ inputPreviewRows.length }} 行</span>
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
            <div class="property-preview-card property-preview-card--grow">
              <pre class="property-preview-content">{{ previewContent }}</pre>
            </div>
          </template>
        </template>

        <template v-else>
          <div class="property-remark">
            <a-textarea
              v-model:value="editableRemark"
              :auto-size="{ minRows: 6, maxRows: 10 }"
              placeholder="请输入节点备注"
              @blur="handleSubmitRemark"
            />
          </div>
        </template>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from "vue";
  import { getNodeTypeConfig } from "./menus";
  import { defaultSqlNodeIcon, sqlNodeIconMap } from "./nodes/iconMap";
  import InputNodeConfigSection from "./InputNodeConfigSection.vue";
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
    box-sizing: border-box;
  }

  .property-panel--visible {
    height: 400px;
    border-top-width: 1px;
    padding-top: 6px;
  }

  .property-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    min-height: 36px;
    padding: 0 6px 6px;
    flex-wrap: wrap;
    border-bottom: 1px solid #e5e7eb;
  }

  .property-meta,
  .property-tabs {
    display: inline-flex;
    align-items: center;
    gap: 6px;
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
    gap: 4px;
    min-width: 240px;
    max-width: 100%;
    margin-left: 4px;
  }

  .property-node-input {
    flex: 1;
    min-width: 0;
    height: 30px;
    padding: 0 8px;
    border: 1px solid #dbe2ea;
    border-radius: 8px;
    background: #f8fafc;

    :deep(.ant-input) {
      height: 28px;
      padding: 0;
      font-size: 14px;
      font-weight: 500;
      color: #0f172a;
      background: transparent;
    }
  }

  .property-tab {
    height: 28px;
    padding: 0 10px;
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
    gap: 4px;
    overflow: auto;
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

  .property-preview-card {
    min-height: 0;
    padding: 4px 6px;
    background: transparent;
  }

  .property-preview-card--grow {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  .property-preview-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 4px;
    min-height: 20px;
    font-size: 13px;
    font-weight: 600;
    color: #334155;
  }

  .property-preview-count {
    font-size: 12px;
    font-weight: 500;
    color: #64748b;
  }

  .property-preview-card :deep(.ant-table-wrapper),
  .property-preview-card :deep(.ant-spin-nested-loading),
  .property-preview-card :deep(.ant-spin-container),
  .property-preview-card :deep(.ant-table),
  .property-preview-card :deep(.ant-table-container) {
    height: 100%;
    min-height: 0;
  }

  .property-preview-content {
    height: 100%;
    margin: 0;
    overflow: auto;
    white-space: pre-wrap;
    word-break: break-word;
    font-size: 12px;
    line-height: 1.5;
    color: #0f172a;
  }

  .property-remark {
    padding: 6px;
  }
</style>
