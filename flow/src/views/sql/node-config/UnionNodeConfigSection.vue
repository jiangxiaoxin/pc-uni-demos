<template>
  <div class="config-section">
    <!-- 来源顺序 -->
    <div class="union-sources-bar">
      <span class="union-sources-label">来源顺序</span>
      <span class="union-sources-count"
        >{{ orderedSources.length }} 个来源</span
      >
    </div>

    <!-- 映射表格 -->
    <div class="union-mapping-wrapper">
      <div v-if="loading" class="config-section__empty">字段加载中...</div>
      <div
        v-else-if="orderedSources.length === 0"
        class="config-section__empty"
      >
        暂无上游节点
      </div>
      <div v-else-if="orderedSources.length < 2" class="config-section__empty">
        需要至少 2 个上游节点才能配置字段映射
      </div>
      <div v-else class="union-mapping-scroll">
        <div class="union-mapping-grid">
          <!-- 表头：合并结果 -->
          <div class="union-grid-row union-grid-row--header">
            <div class="union-grid-cell union-grid-cell--fixed">合并结果</div>
            <div
              v-for="col in resultColumns"
              :key="col.key"
              class="union-grid-cell"
              :title="`${col.name} (${col.type})`"
            >
              <div class="union-grid-field-name">{{ col.name }}</div>
              <div class="union-grid-field-type">{{ col.type }}</div>
            </div>
            <div class="union-grid-cell union-grid-cell--empty"></div>
          </div>

          <!-- 数据行：每个来源 -->
          <div
            v-for="source in orderedSources"
            :key="source.id"
            class="union-grid-row"
          >
            <div
              class="union-grid-cell union-grid-cell--fixed"
              :title="source.id"
            >
              <div class="union-grid-source-name">{{ source.name }}</div>
            </div>
            <div
              v-for="col in resultColumns"
              :key="col.key"
              class="union-grid-cell union-grid-cell--dropzone"
              :class="{
                'union-grid-cell--droppable':
                  dragInfo &&
                  dragInfo.fieldType === col.type &&
                  dragInfo.sourceId === source.id &&
                  !getMappedField(source.id, col.key),
              }"
              @dragover.prevent="
                handleDragOver($event, col.type, source.id, col.key)
              "
              @drop="handleDrop($event, source.id, col.key)"
            >
              <template v-if="getMappedField(source.id, col.key)">
                <div
                  class="union-field-tag"
                  draggable="true"
                  @dragstart="
                    handleDragStart(
                      $event,
                      source.id,
                      getMappedField(source.id, col.key)!,
                    )
                  "
                >
                  <span class="union-field-tag__name">{{
                    getMappedField(source.id, col.key)!.name
                  }}</span>
                </div>
              </template>
            </div>
            <!-- 空列 -->
            <div
              class="union-grid-cell union-grid-cell--empty union-grid-cell--dropzone"
              :class="{
                'union-grid-cell--droppable':
                  dragInfo && dragInfo.sourceId === source.id,
              }"
              @dragover.prevent="handleDragOverEmpty($event, source.id)"
              @drop="handleDropToEmpty($event, source.id)"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, inject, onMounted, ref } from "vue";
  import { sqlNodeContextKey, type GetNodeContext } from "../nodeContext";
  import { fetchUnionNodeUpstreamFields } from "../inputNodeMock";
  import type {
    InputField,
    JoinUpstreamForm,
    UnionConfig,
    UnionFieldMapping,
    UnionMode,
  } from "../types";

  const emit = defineEmits<{
    (e: "change-config", value: UnionConfig): void;
  }>();

  const props = withDefaults(
    defineProps<{
      nodeId: string;
      config?: UnionConfig;
    }>(),
    {
      config: () => ({
        mode: "union",
        sourceNodeIds: [],
        fieldMappings: [],
      }),
    },
  );

  const getNodeContext = inject<GetNodeContext>(sqlNodeContextKey);
  const loading = ref(false);
  const upstreamForms = ref<JoinUpstreamForm[]>([]);
  const localMode = ref<UnionMode>(props.config.mode);
  const localSourceNodeIds = ref<string[]>([...props.config.sourceNodeIds]);
  const localFieldMappings = ref<UnionFieldMapping[]>(
    props.config.fieldMappings.map((m) => ({
      targetField: m.targetField,
      targetName: m.targetName,
      targetType: m.targetType,
      sourceMap: { ...m.sourceMap },
    })),
  );
  const pendingLocalChange = ref(false);
  let loadToken = 0;

  const orderedSources = computed(() => {
    const map = new Map(upstreamForms.value.map((f) => [f.id, f]));
    return localSourceNodeIds.value
      .map((id) => map.get(id))
      .filter((f): f is JoinUpstreamForm => Boolean(f));
  });

  const dragInfo = ref<{
    sourceId: string;
    fieldKey: string;
    fieldType: string;
  } | null>(null);

  const resultColumns = computed(() =>
    localFieldMappings.value.map((m) => ({
      key: m.targetField,
      name: m.targetName,
      type: m.targetType,
    })),
  );

  const getFieldByKey = (
    sourceId: string,
    fieldKey: string,
  ): InputField | null => {
    const source = orderedSources.value.find((s) => s.id === sourceId);
    return source?.fields.find((f) => f.key === fieldKey) || null;
  };

  const generateDefaultMappings = () => {
    const mappings: UnionFieldMapping[] = [];
    const findOrCreateMapping = (field: InputField, sourceId: string) => {
      let mapping = mappings.find(
        (m) => m.targetName === field.name && m.targetType === field.type,
      );
      if (!mapping) {
        mapping = {
          targetField: field.name,
          targetName: field.name,
          targetType: field.type,
          sourceMap: {},
        };
        mappings.push(mapping);
      }
      mapping.sourceMap[sourceId] = field.key;
    };

    orderedSources.value.forEach((source) => {
      source.fields.forEach((field) => {
        findOrCreateMapping(field, source.id);
      });
    });

    localFieldMappings.value = mappings;
    pendingLocalChange.value = true;
  };

  const isConfigStale = (): boolean => {
    const validIds = new Set(upstreamForms.value.map((f) => f.id));
    const sourceIdsValid = localSourceNodeIds.value.every((id) =>
      validIds.has(id),
    );
    if (!sourceIdsValid) return true;
    if (localSourceNodeIds.value.length !== upstreamForms.value.length)
      return true;
    if (
      localFieldMappings.value.length === 0 &&
      upstreamForms.value.some((f) => f.fields.length > 0)
    )
      return true;

    for (const mapping of localFieldMappings.value) {
      for (const sourceId of Object.keys(mapping.sourceMap)) {
        if (!validIds.has(sourceId)) return true;
        const source = upstreamForms.value.find((f) => f.id === sourceId);
        if (!source) return true;
        const fieldKey = mapping.sourceMap[sourceId];
        if (fieldKey && !source.fields.some((f) => f.key === fieldKey))
          return true;
      }
    }

    return false;
  };

  const loadUpstreamForms = async () => {
    localMode.value = props.config.mode;
    localSourceNodeIds.value = [...props.config.sourceNodeIds];
    localFieldMappings.value = props.config.fieldMappings.map((m) => ({
      targetField: m.targetField,
      targetName: m.targetName,
      targetType: m.targetType,
      sourceMap: { ...m.sourceMap },
    }));

    const nodeContext = getNodeContext?.(props.nodeId);
    if (!nodeContext) {
      upstreamForms.value = [];
      loading.value = false;
      return;
    }

    const currentToken = ++loadToken;
    loading.value = true;
    const result = await fetchUnionNodeUpstreamFields(nodeContext);
    if (currentToken !== loadToken) return;
    upstreamForms.value = result;
    loading.value = false;

    const fromIds = nodeContext.currentNode?.fromIds || [];

    if (isConfigStale()) {
      localMode.value = "union";
      localSourceNodeIds.value = [...fromIds];
      localFieldMappings.value = [];
      generateDefaultMappings();
      pendingLocalChange.value = true;
    } else if (localSourceNodeIds.value.length === 0 && fromIds.length > 0) {
      localSourceNodeIds.value = [...fromIds];
      generateDefaultMappings();
      pendingLocalChange.value = true;
    } else {
      // 修复旧数据中缺失或被 col_ 污染的 targetName/targetType
      let fixed = false;
      localFieldMappings.value.forEach((mapping) => {
        if (!mapping.targetName || mapping.targetName.startsWith("col_")) {
          for (const sid of Object.keys(mapping.sourceMap)) {
            const f = getFieldByKey(sid, mapping.sourceMap[sid]);
            if (f) {
              mapping.targetName = f.name;
              mapping.targetType = f.type;
              fixed = true;
              break;
            }
          }
        }
      });
      if (fixed) pendingLocalChange.value = true;
    }
  };

  onMounted(() => {
    void loadUpstreamForms();
  });

  const getMappedField = (
    sourceId: string,
    colKey: string,
  ): InputField | null => {
    const mapping = localFieldMappings.value.find(
      (m) => m.targetField === colKey,
    );
    const fieldKey = mapping?.sourceMap[sourceId];
    if (!fieldKey) return null;
    return getFieldByKey(sourceId, fieldKey);
  };

  const handleDragStart = (
    e: DragEvent,
    sourceId: string,
    field: InputField,
  ) => {
    dragInfo.value = { sourceId, fieldKey: field.key, fieldType: field.type };
    e.dataTransfer?.setData("text/plain", JSON.stringify(dragInfo.value));
    e.dataTransfer!.effectAllowed = "move";
  };

  const handleDragOver = (
    e: DragEvent,
    targetType: string,
    sourceId: string,
    colKey: string,
  ) => {
    if (!dragInfo.value) return;
    if (
      dragInfo.value.fieldType === targetType &&
      dragInfo.value.sourceId === sourceId &&
      !getMappedField(sourceId, colKey)
    ) {
      e.preventDefault();
      e.dataTransfer!.dropEffect = "move";
    }
  };

  const handleDragOverEmpty = (e: DragEvent, sourceId: string) => {
    if (!dragInfo.value) return;
    if (dragInfo.value.sourceId === sourceId) {
      e.preventDefault();
      e.dataTransfer!.dropEffect = "move";
    }
  };

  const removeFieldFromMappings = (sourceId: string, fieldKey: string) => {
    localFieldMappings.value.forEach((m) => {
      if (m.sourceMap[sourceId] === fieldKey) {
        delete m.sourceMap[sourceId];
      }
    });
  };

  const cleanEmptyMappings = () => {
    localFieldMappings.value = localFieldMappings.value.filter(
      (m) => Object.keys(m.sourceMap).length > 0,
    );
  };

  const handleDrop = (
    e: DragEvent,
    targetSourceId: string,
    targetColKey: string,
  ) => {
    e.preventDefault();
    if (!dragInfo.value) return;
    const { sourceId, fieldKey, fieldType } = dragInfo.value;
    if (sourceId !== targetSourceId) return;

    const targetColumn = resultColumns.value.find(
      (c) => c.key === targetColKey,
    );
    if (!targetColumn || targetColumn.type !== fieldType) return;
    if (getMappedField(targetSourceId, targetColKey)) return;

    removeFieldFromMappings(targetSourceId, fieldKey);
    cleanEmptyMappings();

    const targetMapping = localFieldMappings.value.find(
      (m) => m.targetField === targetColKey,
    );
    if (targetMapping) {
      targetMapping.sourceMap[targetSourceId] = fieldKey;
    }

    pendingLocalChange.value = true;
    dragInfo.value = null;
  };

  const handleDropToEmpty = (e: DragEvent, sourceId: string) => {
    e.preventDefault();
    if (!dragInfo.value || dragInfo.value.sourceId !== sourceId) return;
    const { fieldKey, fieldType } = dragInfo.value;
    const field = getFieldByKey(sourceId, fieldKey);
    if (!field) return;

    removeFieldFromMappings(sourceId, fieldKey);
    cleanEmptyMappings();

    const newMapping: UnionFieldMapping = {
      targetField: `${field.name}_${Date.now()}`,
      targetName: field.name,
      targetType: fieldType,
      sourceMap: { [sourceId]: fieldKey },
    };
    localFieldMappings.value.push(newMapping);

    pendingLocalChange.value = true;
    dragInfo.value = null;
  };

  const flushDraft = () => {
    if (!pendingLocalChange.value) return;
    pendingLocalChange.value = false;
    emit("change-config", {
      mode: localMode.value,
      sourceNodeIds: [...localSourceNodeIds.value],
      fieldMappings: localFieldMappings.value.map((m) => ({
        targetField: m.targetField,
        targetName: m.targetName,
        targetType: m.targetType,
        sourceMap: { ...m.sourceMap },
      })),
    });
  };

  defineExpose({ flushDraft });
</script>

<style scoped lang="scss">
  @use "./config-section-shared.scss";

  .union-sources-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 0 8px;
    flex-shrink: 0;
  }

  .union-sources-label {
    font-size: 12px;
    font-weight: 600;
    color: #334155;
  }

  .union-sources-count {
    font-size: 12px;
    color: #64748b;
  }

  .union-sources-draggable {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
  }

  .union-source-chip {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 6px;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    background: #f8fafc;
    font-size: 12px;
    color: #334155;
    user-select: none;
  }

  .union-source-chip--ghost {
    opacity: 0.6;
    background: #f0f9ff;
    border-color: #91caff;
  }

  .union-source-chip--chosen,
  .union-source-chip--dragging {
    border-color: #1677ff;
    background: #e6f4ff;
  }

  .union-source-chip__name {
    white-space: nowrap;
  }

  .union-source-chip__drag {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 14px;
    height: 14px;
    color: #94a3b8;
    cursor: grab;

    &:active {
      cursor: grabbing;
    }

    &:hover {
      color: #64748b;
    }
  }

  .union-source-chip__drag-icon {
    font-size: 10px;
  }

  .union-mapping-wrapper {
    flex: 1;
    min-height: 0;
    overflow: hidden;
    background: #fff;
  }

  .union-mapping-scroll {
    width: 100%;
    height: 100%;
    overflow: auto;
  }

  .union-mapping-grid {
    display: flex;
    flex-direction: column;
    min-width: fit-content;
    gap: 1px;
    background: #e2e8f0;
    border: 1px solid #e2e8f0;
    overflow: hidden;
  }

  .union-grid-row {
    display: flex;
    align-items: stretch;
    gap: 1px;
    min-width: 0;
    background: #e2e8f0;
  }

  .union-grid-row--header {
    position: sticky;
    top: 0;
    z-index: 2;
    background: #e2e8f0;
    font-weight: 600;
  }

  .union-grid-cell {
    flex: 1;
    min-width: 110px;
    max-width: 160px;
    padding: 6px 4px;
    font-size: 12px;
    background: #fff;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .union-grid-cell--fixed {
    flex: 0 0 100px;
    min-width: 100px;
    max-width: 100px;
    display: flex;
    align-items: center;
    font-weight: 500;
    color: #334155;
    background: #f8fafc;
  }

  .union-grid-cell--empty {
    // flex: 0 0 40px;
    // min-width: 40px;
    // max-width: 40px;
    background: #fafafa;
  }

  .union-grid-cell--dropzone {
    min-height: 36px;
    transition: background-color 0.15s ease;
  }

  .union-grid-cell--droppable {
    background: #f0f9ff;
    box-shadow: inset 0 0 0 1px #7dd3fc;
  }

  .union-grid-field-name {
    color: #0f172a;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .union-grid-field-type {
    color: #64748b;
    font-size: 11px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .union-grid-source-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .union-field-tag {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 6px;
    border: 1px solid #bae6fd;
    border-radius: 4px;
    background: #e0f2fe;
    color: #0369a1;
    font-size: 12px;
    line-height: 18px;
    cursor: grab;
    max-width: 100%;

    &:active {
      cursor: grabbing;
    }
  }

  .union-field-tag__name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
