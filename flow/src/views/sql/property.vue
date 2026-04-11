<template>
  <div class="property-panel" :class="{ 'property-panel--visible': visible }">
    <template v-if="visible && nodeData">
      <div class="property-top">
        <div class="property-meta">
          <component :is="nodeIconComponent" class="property-node-icon" />
          <div class="property-node-type">{{ nodeTypeLabel }}</div>
          <div class="property-name-field">
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
            v-for="tab in availableTabs"
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
        <template v-if="isConnectionInvalid">
          <div class="property-block-tip">
            <div class="property-block-tip__title">连线未满足要求</div>
            <div class="property-block-tip__content">{{ connectionInvalidTip }}</div>
          </div>
        </template>
        <template v-else>
          <template v-if="activeTab === 'config'">
            <template v-if="isInputNode && inputBinding">
              <InputNodeConfigSection
                :key="`${nodeData.id}-config-input`"
                :input-binding="inputBinding"
                @change-source="emit('change-input-source')"
              />
            </template>
            <template v-else-if="isFieldNode">
              <FieldNodeConfigSection
                :key="`${nodeData.id}-config-field`"
                :node-id="nodeData.id"
                :field-settings="draftFieldSettings"
                :configured="fieldSettingsConfigured"
                @change-fields="handleFieldSettingsChange"
              />
            </template>
            <template v-else-if="isDistinctNode">
              <DistinctNodeConfigSection
                :key="`${nodeData.id}-config-distinct`"
                :node-id="nodeData.id"
                :selected-fields="draftDistinctFields"
                @change-fields="handleDistinctFieldsChange"
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
              <NodePreviewTableSection
                :key="`${nodeData.id}-preview-input`"
                :payload="inputBinding"
                :fetcher="fetchInputPreviewByBinding"
              />
            </template>
            <template v-else-if="isFieldNode && nodeData">
              <NodePreviewTableSection
                :key="`${nodeData.id}-preview-field`"
                :payload="buildFieldNodePreviewPayload"
                :fetcher="fetchFieldNodePreviewByPayload"
              />
            </template>
            <template v-else-if="isDistinctNode && nodeData">
              <NodePreviewTableSection
                :key="`${nodeData.id}-preview-distinct`"
                :payload="buildDistinctPreviewPayload"
                :fetcher="fetchDistinctPreviewByPayload"
              />
            </template>
            <template v-else-if="isOutputNode && nodeData">
              <NodePreviewTableSection
                :key="`${nodeData.id}-preview-output`"
                :payload="buildOutputPreviewPayload"
                :fetcher="fetchOutputPreviewByPayload"
              />
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
                class="property-remark-input"
                placeholder="请输入节点备注"
              />
            </div>
          </template>
        </template>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
  import { computed, inject, ref, watch } from "vue";
  import { getNodeTypeConfig } from "./menus";
  import { defaultSqlNodeIcon, sqlNodeIconMap } from "./nodes/iconMap";
  import FieldNodeConfigSection from "./FieldNodeConfigSection.vue";
  import InputNodeConfigSection from "./InputNodeConfigSection.vue";
  import DistinctNodeConfigSection from "./DistinctNodeConfigSection.vue";
  import NodePreviewTableSection from "./NodePreviewTableSection.vue";
  import { sqlNodeContextKey, type GetNodeContext } from "./nodeContext";
  import {
    fetchDistinctPreviewByPayload,
    fetchFieldNodePreviewByPayload,
    fetchInputPreviewByBinding,
    fetchOutputPreviewByPayload,
    type BoundInputSource,
    type DistinctPreviewPayload,
    type FieldNodePreviewPayload,
    type FieldSettingPersistedItem,
    type InputBindingPersisted,
    type OutputPreviewPayload,
    resolveInputBinding,
  } from "./inputNodeMock";

  interface SqlNodeData {
    id: string;
    type: string;
    properties?: Record<string, unknown>;
  }

  const emit = defineEmits<{
    (e: "submit-name", name: string): void;
    (e: "submit-properties", payload: Record<string, unknown>): void;
    (e: "change-input-source"): void;
  }>();

  const props = withDefaults(
    defineProps<{
      visible?: boolean;
      nodeData?: SqlNodeData | null;
      incomingCount?: number;
    }>(),
    {
      visible: false,
      nodeData: null,
      incomingCount: 0,
    },
  );

  const getNodeContext = inject<GetNodeContext>(sqlNodeContextKey);
  const editableName = ref("");
  const editableRemark = ref("");
  const draftDistinctFields = ref<string[]>([]);
  const draftFieldSettings = ref<FieldSettingPersistedItem[]>([]);
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
  const isFieldNode = computed(() => props.nodeData?.type === "field-node");
  const isDistinctNode = computed(() => props.nodeData?.type === "distinct-node");
  const isOutputNode = computed(() => props.nodeData?.type === "out-node");

  const requiredMinIncoming = computed(() => {
    return Number(nodeConfig.value?.defaultConfig?.requiredMinIncoming || 0);
  });

  const isConnectionInvalid = computed(() => {
    return requiredMinIncoming.value > 0 && (props.incomingCount || 0) < requiredMinIncoming.value;
  });

  const connectionInvalidTip = computed(() => {
    return (
      nodeConfig.value?.defaultConfig?.emptyLinkTip ||
      "当前节点前序连线数量不足，请先完成连线。"
    );
  });

  const availableTabs = computed(() => {
    if (isOutputNode.value) {
      return tabs.filter((tab) => tab.key !== "config");
    }
    return tabs;
  });

  const inputBinding = computed<BoundInputSource | null>(() => {
    const binding = props.nodeData?.properties?.inputBinding;
    if (!binding || typeof binding !== "object") return null;
    return resolveInputBinding(binding as InputBindingPersisted);
  });

  const distinctFields = computed<string[]>(() => {
    const fields = props.nodeData?.properties?.distinctFields;
    if (!Array.isArray(fields)) return [];
    return fields.filter((field): field is string => typeof field === "string");
  });

  const fieldSettings = computed<FieldSettingPersistedItem[]>(() => {
    const fields = props.nodeData?.properties?.fieldSettings;
    if (!Array.isArray(fields)) return [];
    return fields as FieldSettingPersistedItem[];
  });

  const fieldSettingsConfigured = computed(() => {
    return Object.prototype.hasOwnProperty.call(props.nodeData?.properties || {}, "fieldSettings");
  });

  const resolveCurrentNodeContext = () => {
    if (!props.nodeData || !getNodeContext) return null;
    return getNodeContext(props.nodeData.id);
  };

  const buildFieldNodePreviewPayload = (): FieldNodePreviewPayload => {
    const nodeContext = resolveCurrentNodeContext();
    return {
      nodeId: props.nodeData?.id || "",
      nodeType: props.nodeData?.type || "",
      upstreamNodes: nodeContext?.upstreamNodes || [],
      currentNode: nodeContext?.currentNode
        ? {
            ...nodeContext.currentNode,
            properties: {
              ...(nodeContext.currentNode.properties || {}),
              fieldSettings: draftFieldSettings.value.map((field) => ({ ...field })),
            },
          }
        : null,
    };
  };

  const buildDistinctPreviewPayload = (): DistinctPreviewPayload => {
    const nodeContext = resolveCurrentNodeContext();
    return {
      nodeId: props.nodeData?.id || "",
      nodeType: props.nodeData?.type || "",
      upstreamNodes: nodeContext?.upstreamNodes || [],
      currentNode: nodeContext?.currentNode || null,
      fields: [...draftDistinctFields.value],
    };
  };

  const buildOutputPreviewPayload = (): OutputPreviewPayload => {
    const nodeContext = resolveCurrentNodeContext();
    return {
      nodeId: props.nodeData?.id || "",
      nodeType: props.nodeData?.type || "",
      upstreamNodes: nodeContext?.upstreamNodes || [],
      currentNode: nodeContext?.currentNode || null,
    };
  };

  watch(
    () => [props.visible, props.nodeData?.id],
    () => {
      editableName.value = nodeLabel.value;
      editableRemark.value = String(props.nodeData?.properties?.remark || "");
      draftDistinctFields.value = [...distinctFields.value];
      draftFieldSettings.value = fieldSettings.value.map((field) => ({ ...field }));
      const defaultTab = availableTabs.value[0]?.key || "remark";
      activeTab.value = defaultTab;
    },
    { immediate: true },
  );

  watch(
    availableTabs,
    (nextTabs) => {
      if (nextTabs.some((tab) => tab.key === activeTab.value)) return;
      activeTab.value = nextTabs[0]?.key || "remark";
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

  const handleDistinctFieldsChange = (fields: string[]) => {
    draftDistinctFields.value = [...fields];
  };

  const handleFieldSettingsChange = (fields: FieldSettingPersistedItem[]) => {
    draftFieldSettings.value = fields.map((field) => ({ ...field }));
  };

  const flushDraftProperties = () => {
    if (!props.nodeData) return;

    const nextProperties: Record<string, unknown> = {};
    const currentRemark = String(props.nodeData.properties?.remark || "");
    if (editableRemark.value !== currentRemark) {
      nextProperties.remark = editableRemark.value;
    }

    const currentDistinctFields = JSON.stringify(distinctFields.value);
    const nextDistinctFields = JSON.stringify(draftDistinctFields.value);
    if (nextDistinctFields !== currentDistinctFields) {
      nextProperties.distinctFields = [...draftDistinctFields.value];
    }

    const currentFieldSettings = JSON.stringify(fieldSettings.value);
    const nextFieldSettings = JSON.stringify(draftFieldSettings.value);
    if (nextFieldSettings !== currentFieldSettings) {
      nextProperties.fieldSettings = draftFieldSettings.value.map((field) => ({ ...field }));
    }

    if (Object.keys(nextProperties).length === 0) return;
    emit("submit-properties", nextProperties);
  };

  defineExpose({
    flushDraftProperties,
  });
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
  }

  .property-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    min-height: 36px;
    padding: 6px;
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
    flex: 1;
    min-height: 0;
    padding: 6px 12px 40px;
    display: flex;
    overflow-y: auto;
  }

  .property-remark-input {
    width: 100%;
    height: 100%;
  }

  .property-remark-input :deep(.ant-input) {
    height: 100%;
    resize: none;
  }

  .property-block-tip {
    flex: 1;
    min-height: 0;
    color: #92400e;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .property-block-tip__title {
    font-size: 14px;
    font-weight: 600;
    line-height: 20px;
  }

  .property-block-tip__content {
    font-size: 13px;
    line-height: 18px;
    word-break: break-word;
  }
</style>
