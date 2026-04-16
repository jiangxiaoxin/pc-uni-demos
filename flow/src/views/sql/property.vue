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
              placeholder="请输入节点名称"
              @pressEnter.stop="handleSubmitName"
              @blur.stop="handleSubmitName"
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
            @click="handleTabClick(tab.key)"
          >
            {{ tab.label }}
          </button>
        </div>
      </div>

      <div class="property-bottom">
        <template v-if="isConnectionInvalid">
          <div class="block-tip">
            <div class="block-tip__title">连线未满足要求</div>
            <div class="block-tip__content">{{ connectionInvalidTip }}</div>
          </div>
        </template>
        <template v-else>
          <div v-show="activeTab === 'config'" class="property-tab-panel">
            <template v-if="isInputNode && inputBindingPersisted">
              <InputNodeConfigSection
                ref="inputNodeRef"
                :key="`${nodeData.id}-config-input`"
                :binding="inputBindingPersisted"
                @change-source="emit('change-input-source')"
              />
            </template>
            <template v-else-if="isFieldNode">
              <FieldNodeConfigSection
                ref="fieldNodeRef"
                :key="`${nodeData.id}-config-field`"
                :node-id="nodeData.id"
                :field-settings="draftFieldSettings"
                :configured="fieldSettingsConfigured"
                @change-fields="handleFieldSettingsChange"
              />
            </template>
            <template v-else-if="isDistinctNode">
              <DistinctNodeConfigSection
                ref="distinctNodeRef"
                :key="`${nodeData.id}-config-distinct`"
                :node-id="nodeData.id"
                :selected-fields="draftDistinctFields"
                @change-fields="handleDistinctFieldsChange"
              />
            </template>
            <template v-else-if="isGroupNode">
              <GroupNodeConfigSection
                ref="groupNodeRef"
                :key="`${nodeData.id}-config-group`"
                :node-id="nodeData.id"
                :group-fields="draftGroupFields"
                :aggregate-fields="draftAggregateFields"
                @change-group-fields="handleGroupFieldsChange"
                @change-aggregate-fields="handleGroupAggregateFieldsChange"
              />
            </template>
            <template v-else-if="isWhereNode">
              <WhereNodeConfigSection
                ref="whereNodeRef"
                :key="`${nodeData.id}-config-where`"
                :node-id="nodeData.id"
                :where-logic="draftWhereLogic"
                :where-conditions="draftWhereConditions"
                @change-logic="handleWhereLogicChange"
                @change-conditions="handleWhereConditionsChange"
              />
            </template>
            <template v-else-if="isJoinNode">
              <JoinNodeConfigSection
                ref="joinNodeRef"
                :key="`${nodeData.id}-config-join`"
                :node-id="nodeData.id"
                :config="draftJoinConfig"
                @change-config="handleJoinConfigChange"
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
          </div>

          <div v-show="activeTab === 'preview'" class="property-tab-panel">
            <template v-if="isInputNode && inputBindingPersisted">
              <NodePreviewTableSection
                :key="`${nodeData.id}-preview-input`"
                :visible="activeTab === 'preview'"
                :payload="inputBindingPersisted"
                :fetcher="fetchInputPreviewByBinding"
              />
            </template>
            <template v-else-if="isFieldNode && nodeData">
              <NodePreviewTableSection
                :key="`${nodeData.id}-preview-field`"
                :visible="activeTab === 'preview'"
                :payload="buildFieldNodePreviewPayload"
                :fetcher="fetchFieldNodePreviewByPayload"
              />
            </template>
            <template v-else-if="isDistinctNode && nodeData">
              <NodePreviewTableSection
                :key="`${nodeData.id}-preview-distinct`"
                :visible="activeTab === 'preview'"
                :payload="buildDistinctPreviewPayload"
                :fetcher="fetchDistinctPreviewByPayload"
              />
            </template>
            <template v-else-if="isGroupNode && nodeData">
              <NodePreviewTableSection
                :key="`${nodeData.id}-preview-group`"
                :visible="activeTab === 'preview'"
                :payload="buildGroupNodePreviewPayload"
                :fetcher="fetchGroupNodePreviewByPayload"
              />
            </template>
            <template v-else-if="isWhereNode && nodeData">
              <NodePreviewTableSection
                :key="`${nodeData.id}-preview-where`"
                :visible="activeTab === 'preview'"
                :payload="buildWhereNodePreviewPayload"
                :fetcher="fetchWherePreviewByPayload"
              />
            </template>
            <template v-else-if="isJoinNode && nodeData">
              <NodePreviewTableSection
                :key="`${nodeData.id}-preview-join`"
                :visible="activeTab === 'preview'"
                :payload="buildJoinNodePreviewPayload"
                :fetcher="fetchJoinPreviewByPayload"
              />
            </template>
            <template v-else-if="isOutputNode && nodeData">
              <NodePreviewTableSection
                :key="`${nodeData.id}-preview-output`"
                :visible="activeTab === 'preview'"
                :payload="buildOutputPreviewPayload"
                :fetcher="fetchOutputPreviewByPayload"
              />
            </template>

            <template v-else>
              <!-- TODO 这个在所有节点类型都处理完后，我要删除它 -->
              <div class="property-preview-card property-preview-card--grow">
                <pre class="property-preview-content">{{ previewContent }}</pre>
              </div>
            </template>
          </div>

          <div v-show="activeTab === 'remark'" class="property-remark">
            <a-textarea
              v-model:value="editableRemark"
              placeholder="请输入节点备注"
            />
          </div>
        </template>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
  import { computed, inject, ref, watch } from "vue";
  import { getNodeTypeConfig } from "./menus";
  import { defaultSqlNodeIcon, sqlNodeIconMap } from "./nodes/iconMap";
  import FieldNodeConfigSection from "./node-config/FieldNodeConfigSection.vue";
  import InputNodeConfigSection from "./node-config/InputNodeConfigSection.vue";
  import DistinctNodeConfigSection from "./node-config/DistinctNodeConfigSection.vue";
  import GroupNodeConfigSection from "./node-config/GroupNodeConfigSection.vue";
  import WhereNodeConfigSection from "./node-config/WhereNodeConfigSection.vue";
  import JoinNodeConfigSection from "./node-config/JoinNodeConfigSection.vue";
  import NodePreviewTableSection from "./NodePreviewTableSection.vue";
  import { sqlNodeContextKey, type GetNodeContext } from "./nodeContext";
  import {
    fetchDistinctPreviewByPayload,
    fetchFieldNodePreviewByPayload,
    fetchGroupNodePreviewByPayload,
    fetchInputPreviewByBinding,
    fetchOutputPreviewByPayload,
    fetchWherePreviewByPayload,
    fetchJoinPreviewByPayload,
  } from "./inputNodeMock";
  import type {
    DistinctPreviewPayload,
    FieldNodePreviewPayload,
    FieldSettingPersistedItem,
    GroupAggregateFieldPersistedItem,
    GroupNodePreviewPayload,
    InputBindingPersisted,
    JoinConditionPersisted,
    JoinConfig,
    JoinNodePreviewPayload,
    JoinType,
    OutputPreviewPayload,
    WhereConditionPersisted,
    WhereLogic,
    WhereNodePreviewPayload,
  } from "./types";

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
  const draftGroupFields = ref<string[]>([]);
  const draftAggregateFields = ref<GroupAggregateFieldPersistedItem[]>([]);
  const inputNodeRef = ref<{ flushDraft: () => void } | null>(null);
  const fieldNodeRef = ref<{ flushDraft: () => void } | null>(null);
  const distinctNodeRef = ref<{ flushDraft: () => void } | null>(null);
  const groupNodeRef = ref<{ flushDraft: () => void } | null>(null);
  const whereNodeRef = ref<{ flushDraft: () => void } | null>(null);
  const joinNodeRef = ref<{ flushDraft: () => void } | null>(null);
  const draftWhereLogic = ref<WhereLogic>("and");
  const draftWhereConditions = ref<WhereConditionPersisted[]>([]);
  const draftJoinConfig = ref<JoinConfig>({
    joinType: "inner",
    leftNodeId: "",
    rightNodeId: "",
    joinConditions: [],
  });
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
  const isGroupNode = computed(() => props.nodeData?.type === "group-node");
  const isWhereNode = computed(() => props.nodeData?.type === "where-node");
  const isJoinNode = computed(() => props.nodeData?.type === "join-node");
  const isOutputNode = computed(() => props.nodeData?.type === "out-node");

  const requiredMinIncoming = computed(() => {
    return Number(nodeConfig.value?.defaultConfig?.requiredMinIncoming || 0);
  });

  // 如果节点的输入线有数量要求，那么就要先判断是否满足要求，不满足的显示提示，不显示内部tab功能
  const isConnectionInvalid = computed(() => {
    return requiredMinIncoming.value > 0 && (props.incomingCount || 0) < requiredMinIncoming.value;
  });

  const connectionInvalidTip = computed(() => {
    return (
      nodeConfig.value?.defaultConfig?.emptyLinkTip ||
      "当前节点前序连线不满足要求，请先完成连线。"
    );
  });

  const availableTabs = computed(() => {
    if (isOutputNode.value) {
      return tabs.filter((tab) => tab.key !== "config");
    }
    return tabs;
  });

  const inputBindingPersisted = computed<InputBindingPersisted | null>(() => {
    const binding = props.nodeData?.properties?.inputBinding;
    if (!binding || typeof binding !== "object") return null;
    return binding as InputBindingPersisted;
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

  const groupFields = computed<string[]>(() => {
    const fields = props.nodeData?.properties?.groupFields;
    if (!Array.isArray(fields)) return [];
    return fields.filter((field): field is string => typeof field === "string");
  });

  const aggregateFields = computed<GroupAggregateFieldPersistedItem[]>(() => {
    const fields = props.nodeData?.properties?.aggregateFields;
    if (!Array.isArray(fields)) return [];
    return fields.filter((field): field is GroupAggregateFieldPersistedItem => {
      return (
        typeof field === "object" &&
        field !== null &&
        typeof (field as GroupAggregateFieldPersistedItem).key === "string" &&
        typeof (field as GroupAggregateFieldPersistedItem).method === "string"
      );
    });
  });

  const whereLogic = computed<WhereLogic>(() => {
    const logic = props.nodeData?.properties?.whereLogic;
    return logic === "or" ? "or" : "and";
  });

  const whereConditions = computed<WhereConditionPersisted[]>(() => {
    const conditions = props.nodeData?.properties?.whereConditions;
    if (!Array.isArray(conditions)) return [];
    return conditions.filter((item): item is WhereConditionPersisted => {
      return (
        typeof item === "object" &&
        item !== null &&
        typeof (item as WhereConditionPersisted).key === "string" &&
        typeof (item as WhereConditionPersisted).relation === "string"
      );
    });
  });

  const joinType = computed<JoinType>(() => {
    const type = props.nodeData?.properties?.joinType;
    if (type === "inner" || type === "outer" || type === "left" || type === "right") {
      return type;
    }
    return "inner";
  });

  const joinLeftNodeId = computed<string>(() => {
    return String(props.nodeData?.properties?.leftNodeId || "");
  });

  const joinRightNodeId = computed<string>(() => {
    return String(props.nodeData?.properties?.rightNodeId || "");
  });

  const joinConditions = computed<JoinConditionPersisted[]>(() => {
    const conditions = props.nodeData?.properties?.joinConditions;
    if (!Array.isArray(conditions)) return [];
    return conditions.filter((item): item is JoinConditionPersisted => {
      return (
        typeof item === "object" &&
        item !== null &&
        typeof (item as JoinConditionPersisted).leftField === "string" &&
        typeof (item as JoinConditionPersisted).rightField === "string"
      );
    });
  });

  const resolveCurrentNodeContext = () => {
    if (!props.nodeData || !getNodeContext) return null;
    return getNodeContext(props.nodeData.id);
  };

  const buildFieldNodePreviewPayload = (): FieldNodePreviewPayload => {
    const nodeContext = resolveCurrentNodeContext();
    // TODO: 这里先按当前草稿配置组装字段节点预览请求体，供 inputNodeMock 的预览接口消费；后续接真实接口时保持这个意图不变。
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
    // TODO: 这里先把去重字段草稿拼成预览请求体，当前给 inputNodeMock 使用，后续替换真实预览接口时继续沿用这层组装职责。
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
    // TODO: 这里先组装输出节点预览请求体，当前由 mock 预览接口消费，后续真实接口接入后仍由属性面板统一传参。
    return {
      nodeId: props.nodeData?.id || "",
      nodeType: props.nodeData?.type || "",
      upstreamNodes: nodeContext?.upstreamNodes || [],
      currentNode: nodeContext?.currentNode || null,
    };
  };

  const buildGroupNodePreviewPayload = (): GroupNodePreviewPayload => {
    const nodeContext = resolveCurrentNodeContext();
    // TODO: 这里先把分组/聚合草稿配置组装成预览请求体，当前用于 inputNodeMock 预览，后续应平滑切换到真实接口。
    return {
      nodeId: props.nodeData?.id || "",
      nodeType: props.nodeData?.type || "",
      upstreamNodes: nodeContext?.upstreamNodes || [],
      currentNode: nodeContext?.currentNode
        ? {
            ...nodeContext.currentNode,
            properties: {
              ...(nodeContext.currentNode.properties || {}),
              groupFields: [...draftGroupFields.value],
              aggregateFields: draftAggregateFields.value.map((field) => ({ ...field })),
            },
          }
        : null,
    };
  };

  const buildWhereNodePreviewPayload = (): WhereNodePreviewPayload => {
    const nodeContext = resolveCurrentNodeContext();
    // TODO: 这里把筛选条件草稿组装成预览请求体，当前由 inputNodeMock 消费，后续应替换为真实预览接口。
    return {
      nodeId: props.nodeData?.id || "",
      nodeType: props.nodeData?.type || "",
      upstreamNodes: nodeContext?.upstreamNodes || [],
      currentNode: nodeContext?.currentNode
        ? {
            ...nodeContext.currentNode,
            properties: {
              ...(nodeContext.currentNode.properties || {}),
              whereLogic: draftWhereLogic.value,
              whereConditions: draftWhereConditions.value.map((cond) => ({ ...cond })),
            },
          }
        : null,
    };
  };

  const buildJoinNodePreviewPayload = (): JoinNodePreviewPayload => {
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
              joinType: draftJoinConfig.value.joinType,
              leftNodeId: draftJoinConfig.value.leftNodeId,
              rightNodeId: draftJoinConfig.value.rightNodeId,
              joinConditions: draftJoinConfig.value.joinConditions.map((cond) => ({ ...cond })),
            },
          }
        : null,
    };
  };

  // Rebuild local drafts whenever the panel opens or the selected node changes.
  // Child editors work against these drafts first, then flush them back in one shot.
  watch(
    () => [props.visible, props.nodeData?.id],
    () => {
      editableName.value = nodeLabel.value;
      editableRemark.value = String(props.nodeData?.properties?.remark || "");
      draftDistinctFields.value = [...distinctFields.value];
      draftFieldSettings.value = fieldSettings.value.map((field) => ({ ...field }));
      draftGroupFields.value = [...groupFields.value];
      draftAggregateFields.value = aggregateFields.value.map((field) => ({ ...field }));
      draftWhereLogic.value = whereLogic.value;
      draftWhereConditions.value = whereConditions.value.map((cond) => ({ ...cond }));
      draftJoinConfig.value = {
        joinType: joinType.value,
        leftNodeId: joinLeftNodeId.value,
        rightNodeId: joinRightNodeId.value,
        joinConditions: joinConditions.value.map((cond) => ({ ...cond })),
      };
      const defaultTab = availableTabs.value[0]?.key || "remark";
      activeTab.value = defaultTab;
    },
    { immediate: true },
  );

  // Different node types expose different tabs.
  // If the current tab becomes unavailable, fall back to the first valid tab.
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

  const handleGroupFieldsChange = (fields: string[]) => {
    draftGroupFields.value = [...fields];
  };

  const handleGroupAggregateFieldsChange = (fields: GroupAggregateFieldPersistedItem[]) => {
    draftAggregateFields.value = fields.map((field) => ({ ...field }));
  };

  const handleWhereLogicChange = (logic: WhereLogic) => {
    draftWhereLogic.value = logic;
  };

  const handleWhereConditionsChange = (conditions: WhereConditionPersisted[]) => {
    draftWhereConditions.value = conditions.map((cond) => ({ ...cond }));
  };

  const handleJoinConfigChange = (config: JoinConfig) => {
    draftJoinConfig.value = { ...config };
  };

  const isEqualByJSON = <T>(a: T, b: T): boolean => JSON.stringify(a) === JSON.stringify(b);

  /**
   * Flush local property drafts back to the parent editor state.
   *
   * This panel keeps remark, distinct fields, and field settings in local refs
   * while the user is editing. The parent calls this before node switches or
   * panel close so unsaved draft changes are committed once as a diff payload.
   *
   */
  const flushDraftProperties = () => {
    console.log('flushDraftProperties');

    if (!props.nodeData) {
      console.log('不需要刷新');

      return
    };

    console.log(1111);


    // 先让子组件 flush 草稿
    inputNodeRef.value?.flushDraft();
    fieldNodeRef.value?.flushDraft();
    distinctNodeRef.value?.flushDraft();
    groupNodeRef.value?.flushDraft();
    whereNodeRef.value?.flushDraft();
    joinNodeRef.value?.flushDraft();

    // 节点名称在输入框失焦或回车时才会触发 submit-name。
    // 但用户可能直接点击 toolbar 的保存按钮，此时 input 不会失焦，
    // 因此必须在 flush 阶段主动把名称草稿同步出去，防止保存时丢失。
    const currentName = nodeLabel.value;
    const nextName = editableName.value.trim();
    if (nextName && nextName !== currentName) {
      emit("submit-name", nextName);
    }

    const nextProperties: Record<string, unknown> = {};
    const currentRemark = String(props.nodeData.properties?.remark || "");
    if (editableRemark.value !== currentRemark) {
      nextProperties.remark = editableRemark.value;
    }
    // TODO 既然节点类型是确定的，那对应的它的节点属性也就是确定的，它需要关心的数据也就是确定的，那就没必要每次都像下面这样，把每个种类的节点属性都判断一遍

    // Compare serialized structures so only changed fields are emitted upstream.
    if (!isEqualByJSON(draftDistinctFields.value, distinctFields.value)) {
      nextProperties.distinctFields = [...draftDistinctFields.value];
    }

    if (!isEqualByJSON(draftFieldSettings.value, fieldSettings.value)) {
      nextProperties.fieldSettings = draftFieldSettings.value.map((field) => ({ ...field }));
    }

    if (!isEqualByJSON(draftGroupFields.value, groupFields.value)) {
      nextProperties.groupFields = [...draftGroupFields.value];
    }

    if (!isEqualByJSON(draftAggregateFields.value, aggregateFields.value)) {
      nextProperties.aggregateFields = draftAggregateFields.value.map((field) => ({ ...field }));
    }

    if (draftWhereLogic.value !== whereLogic.value) {
      nextProperties.whereLogic = draftWhereLogic.value;
    }

    if (!isEqualByJSON(draftWhereConditions.value, whereConditions.value)) {
      nextProperties.whereConditions = draftWhereConditions.value.map((cond) => ({ ...cond }));
    }

    const currentJoinConfig = {
      joinType: joinType.value,
      leftNodeId: joinLeftNodeId.value,
      rightNodeId: joinRightNodeId.value,
      joinConditions: joinConditions.value,
    };
    if (!isEqualByJSON(draftJoinConfig.value, currentJoinConfig)) {
      nextProperties.joinType = draftJoinConfig.value.joinType;
      nextProperties.leftNodeId = draftJoinConfig.value.leftNodeId;
      nextProperties.rightNodeId = draftJoinConfig.value.rightNodeId;
      nextProperties.joinConditions = draftJoinConfig.value.joinConditions.map((cond) => ({ ...cond }));
    }

    if (Object.keys(nextProperties).length === 0) {
      console.log('property 里不需要emit');

      return
    }
    emit("submit-properties", nextProperties);
  };

  const handleTabClick = (key: typeof activeTab.value) => {
    if (activeTab.value === key) return;
    if (key === "preview") {
      flushDraftProperties();
    }
    activeTab.value = key;
  };

  // Expose the flush hook so the parent can persist drafts before selection changes.
  defineExpose({
    flushDraftProperties,
  });
</script>

<style lang="scss" scoped>
 @use "./block-tip.scss";
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
    min-width: 240px;
    max-width: 100%;
    margin-left: 4px;
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

  .property-tab-panel {
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

 
</style>
