<template>
  <a-modal
    :open="open"
    title="选择数据源和字段"
    width="820px"
    ok-text="确定"
    cancel-text="取消"
    :ok-button-props="{ disabled: !selectedSource || selectedFieldKeys.length === 0 }"
    @ok="handleConfirm"
    @cancel="$emit('update:open', false)"
  >
    <div class="bind-modal">
      <div class="bind-panel">
        <div class="bind-panel__header">
          <div class="bind-panel__title-group">
            <span class="bind-panel__title">数据源</span>
            <span class="bind-panel__meta">共 {{ sources.length }} 张表</span>
          </div>
        </div>
        <div class="bind-source-list">
          <button
            v-for="source in sources"
            :key="source.id"
            type="button"
            class="bind-source-item"
            :class="{ 'bind-source-item--active': source.id === currentSourceId }"
            @click="handleSelectSource(source.id)"
          >
            <div class="bind-source-item__name">{{ source.name }}</div>
            <div class="bind-source-item__desc">{{ source.description || "暂无描述" }}</div>
          </button>
        </div>
      </div>

      <div class="bind-panel bind-panel--fields">
        <div class="bind-panel__header">
          <div class="bind-panel__title-group">
            <span class="bind-panel__title">字段</span>
            <span class="bind-panel__meta">
              已选 {{ selectedFieldKeys.length }} / {{ currentFields.length }}
            </span>
          </div>
          <a-button
            class="bind-panel__action"
            size="small"
            type="link"
            :disabled="fieldsLoading || currentFields.length === 0"
            @click="handleToggleSelectAll"
          >
            {{ isAllSelected ? "取消全选" : "全选" }}
          </a-button>
        </div>
        <div v-if="selectedSource" class="bind-field-panel">
          <div v-if="fieldsLoading" class="bind-empty">字段加载中...</div>
          <div v-else class="bind-field-list">
            <label
              v-for="field in currentFields"
              :key="field.key"
              class="bind-field-item"
            >
              <input
                v-model="selectedFieldKeys"
                type="checkbox"
                :value="field.key"
              />
              <span class="bind-field-item__name">{{ field.name }}</span>
              <span class="bind-field-item__type">{{ field.type }}</span>
            </label>
          </div>
        </div>
        <div v-else class="bind-empty">请选择左侧数据源后加载字段</div>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from "vue";
  import {
    fetchInputSourceFields,
    type BoundInputSource,
    type InputField,
    type InputSource,
  } from "./inputNodeMock";

  const emit = defineEmits<{
    (e: "update:open", value: boolean): void;
    (e: "confirm", value: BoundInputSource): void;
  }>();

  const props = withDefaults(
    defineProps<{
      open: boolean;
      sources: InputSource[];
      initialBinding?: BoundInputSource | null;
    }>(),
    {
      initialBinding: null,
    },
  );

  const currentSourceId = ref<string>("");
  const currentFields = ref<InputField[]>([]);
  const selectedFieldKeys = ref<string[]>([]);
  const fieldsLoading = ref(false);
  const shouldRestoreInitialSelection = ref(false);
  const hasInitialized = ref(false);

  const selectedSource = computed(() => {
    return props.sources.find((source) => source.id === currentSourceId.value);
  });

  const isAllSelected = computed(() => {
    return currentFields.value.length > 0 && selectedFieldKeys.value.length === currentFields.value.length;
  });

  watch(
    () => [props.open, props.initialBinding?.sourceId],
    () => {
      if (!props.open) return;

      const sourceId = props.initialBinding?.sourceId || "";
      currentSourceId.value = sourceId;
      currentFields.value = [];
      selectedFieldKeys.value = [];
      shouldRestoreInitialSelection.value = Boolean(sourceId);
      hasInitialized.value = false;
    },
    { immediate: true },
  );

  watch(
    currentSourceId,
    async (sourceId) => {
      if (!sourceId) {
        currentFields.value = [];
        selectedFieldKeys.value = [];
        fieldsLoading.value = false;
        return;
      }

      fieldsLoading.value = true;
      const fields = await fetchInputSourceFields(sourceId);
      if (currentSourceId.value !== sourceId) {
        fieldsLoading.value = false;
        return;
      }

      currentFields.value = fields;
      if (
        shouldRestoreInitialSelection.value &&
        props.initialBinding?.sourceId === sourceId &&
        (props.initialBinding?.fields?.length || 0) > 0
      ) {
        selectedFieldKeys.value = (props.initialBinding?.fields || [])
          .map((field) => field.key)
          .filter((key) => fields.some((field) => field.key === key));
      } else {
        selectedFieldKeys.value = fields.map((field) => field.key);
      }
      shouldRestoreInitialSelection.value = false;
      hasInitialized.value = true;
      fieldsLoading.value = false;
    },
    { immediate: true },
  );

  const handleSelectSource = (sourceId: string) => {
    if (currentSourceId.value === sourceId && hasInitialized.value) return;
    shouldRestoreInitialSelection.value = false;
    currentSourceId.value = sourceId;
  };

  const handleToggleSelectAll = () => {
    if (fieldsLoading.value || currentFields.value.length === 0) return;
    selectedFieldKeys.value = isAllSelected.value
      ? []
      : currentFields.value.map((field) => field.key);
  };

  const handleConfirm = () => {
    if (!selectedSource.value) return;

    const fields = currentFields.value.filter((field) =>
      selectedFieldKeys.value.includes(field.key),
    );

    emit("confirm", {
      sourceId: selectedSource.value.id,
      sourceName: selectedSource.value.name,
      fields,
    });
    emit("update:open", false);
  };
</script>

<style scoped lang="scss">
  .bind-modal {
    display: grid;
    grid-template-columns: 260px minmax(0, 1fr);
    gap: 16px;
    height: 380px;
    min-height: 0;
  }

  .bind-panel {
    display: flex;
    flex-direction: column;
    min-height: 0;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    background: #f8fafc;
    overflow: hidden;
  }

  .bind-panel__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 12px 14px;
    border-bottom: 1px solid #e2e8f0;
    background: #fff;
  }

  .bind-panel__title-group {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
  }

  .bind-panel__title {
    font-size: 13px;
    font-weight: 600;
    color: #334155;
    line-height: 20px;
  }

  .bind-panel__meta {
    font-size: 12px;
    font-weight: 500;
    color: #64748b;
    line-height: 20px;
    white-space: nowrap;
  }

  .bind-panel__action {
    flex-shrink: 0;
    padding-inline: 0;
    font-size: 12px;
    font-weight: 500;
  }

  .bind-source-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 12px 14px;
    border: 0;
    border-bottom: 1px solid #e2e8f0;
    background: transparent;
    text-align: left;
    cursor: pointer;
    transition: background 0.2s ease;
  }

  .bind-source-item:last-child {
    border-bottom: 0;
  }

  .bind-source-item:hover,
  .bind-source-item--active {
    background: #e0f2fe;
  }

  .bind-source-item__name {
    font-size: 13px;
    font-weight: 600;
    color: #0f172a;
  }

  .bind-source-item__desc {
    font-size: 12px;
    color: #64748b;
  }

  .bind-panel--fields {
    background: #fff;
  }

  .bind-field-panel {
    display: flex;
    flex: 1;
    min-height: 0;
  }

  .bind-source-list,
  .bind-field-list {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
    overflow: auto;
  }

  .bind-source-list {
    background: #f8fafc;
  }

  .bind-field-item {
    display: grid;
    grid-template-columns: 20px minmax(0, 1fr) 120px;
    align-items: center;
    gap: 12px;
    padding: 12px 14px;
    border-bottom: 1px solid #f1f5f9;
  }

  .bind-field-item:last-child {
    border-bottom: 0;
  }

  .bind-field-item__name {
    min-width: 0;
    font-size: 13px;
    color: #0f172a;
    word-break: break-all;
  }

  .bind-field-item__type {
    font-size: 12px;
    color: #64748b;
    text-align: right;
  }

  .bind-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
    min-height: 220px;
    color: #94a3b8;
    font-size: 13px;
  }

  :deep(.ant-modal-body) {
    max-height: 70vh;
    overflow: hidden;
  }
</style>
