<template>
  <div class="field-config-layout">
    <div class="field-config-sidebar">
      <div class="config-section__header">
        <span>字段列表</span>
        <div class="config-section__header-actions">
          <span class="config-section__count">{{ selectedCount }}/{{ upstreamFields.length }}</span>
          <span
            class="config-section__link"
            :class="{ 'config-section__link--disabled': loading || upstreamFields.length === 0 }"
            @click="toggleSelectAll"
          >
            {{ allSelected ? "取消全选" : "全选" }}
          </span>
        </div>
      </div>

      <div class="config-section__body">
        <div v-if="loading" class="config-section__empty">字段加载中...</div>
        <div v-else-if="localFields.length === 0" class="config-section__empty">
          当前前序节点无可设置字段
        </div>
        <VueDraggable
          v-else
          v-model="draggableFields"
          class="config-section__draggable"
          item-key="key"
          handle=".config-item__drag"
          ghost-class="config-item--ghost"
          chosen-class="config-item--chosen"
          drag-class="config-item--dragging"
          :animation="160"
          @end="handleSortEnd"
        >
          <div
            v-for="field in localFields"
            :key="field.key"
            class="config-item field-config-item"
          >
            <div class="field-config-item__row">
              <label class="field-config-item__checkbox">
                <input
                  :checked="field.selected"
                  type="checkbox"
                  @change="toggleField(field.key)"
                />
              </label>
              <a-input
                v-if="editingFieldKey === field.key"
                ref="editingInputRef"
                v-model:value="editingName"
                class="config-item__name field-config-item__name--editing"
                @blur="confirmRename"
                @keydown="handleEditingKeydown"
              />
              <span v-else class="config-item__name" :title="field.name">{{ field.name }}</span>
              <span class="config-item__code">{{ field.key }}</span>
              <span class="config-item__type">{{ field.type }}</span>
              <span
                class="config-item__action"
                :title="editingFieldKey === field.key ? '确认修改名称' : '修改名称'"
                @mousedown.prevent
                @click="editingFieldKey === field.key ? confirmRename() : startRename(field)"
              >
                <CheckOutlined
                  v-if="editingFieldKey === field.key"
                  class="config-item__action-icon"
                />
                <EditOutlined v-else class="config-item__action-icon" />
              </span>
              <span
                v-if="editingFieldKey === field.key"
                class="config-item__action"
                title="取消修改名称"
                @mousedown.prevent
                @click="cancelRename"
              >
                <CloseOutlined class="config-item__action-icon" />
              </span>
              <span class="config-item__drag" title="拖动排序">
                <DragOutlined class="config-item__action-icon" />
              </span>
            </div>
          </div>
        </VueDraggable>
      </div>
    </div>

    <div class="field-config-main">
      <div class="field-config-table-wrap">
        <div v-if="selectedCount === 0" class="config-section__empty field-config-table-empty">
          请选择字段
        </div>
        <a-table
          v-else
          class="field-config-table"
          :columns="selectedTableColumns"
          :data-source="[]"
          :locale="{ emptyText: null }"
          :pagination="false"
          size="small"
          :scroll="{ x: tableScrollX, y: '100%' }"
          row-key="__fieldKey"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, inject, nextTick, onMounted, ref, useTemplateRef, watch } from "vue";
  import { CheckOutlined, CloseOutlined, EditOutlined, DragOutlined } from "@ant-design/icons-vue";
  import { VueDraggable } from "vue-draggable-plus";
  import { sqlNodeContextKey, type GetNodeContext } from "../nodeContext";
  import {
    fetchFieldNodeUpstreamFields,
    type FieldSettingItem,
    type FieldSettingPersistedItem,
    type InputField,
  } from "../inputNodeMock";

  interface TableColumn {
    title: string;
    dataIndex: string;
    key: string;
    width: number;
    ellipsis: boolean;
  }

  const emit = defineEmits<{
    (e: "change-fields", value: FieldSettingPersistedItem[]): void;
  }>();

  const props = withDefaults(
    defineProps<{
      nodeId: string;
      fieldSettings?: FieldSettingPersistedItem[];
      configured?: boolean;
    }>(),
    {
      fieldSettings: () => [],
      configured: false,
    },
  );

  const getNodeContext = inject<GetNodeContext>(sqlNodeContextKey);
  const loading = ref(false);
  const upstreamFields = ref<InputField[]>([]);
  const localFields = ref<FieldSettingItem[]>([]);
  const editingFieldKey = ref("");
  const editingName = ref("");
  const editingInputRef = useTemplateRef<{
    input?: HTMLInputElement;
    $el?: HTMLElement;
  }>("editingInputRef");
  const pendingLocalChange = ref(false);
  let loadToken = 0;

  const persistedFieldSettingsEqual = (
    left: FieldSettingPersistedItem[],
    right: FieldSettingPersistedItem[],
  ) => {
    if (left.length !== right.length) return false;
    return left.every((field, index) => {
      const target = right[index];
      return field.key === target?.key && field.name === target?.name;
    });
  };

  const toPersistedFieldSettings = (fields: FieldSettingItem[]) => {
    return fields
      .filter((field) => field.selected)
      .map<FieldSettingPersistedItem>((field) => ({
        key: field.key,
        name: field.name,
      }));
  };

  const emitChange = (fields: FieldSettingItem[]) => {
    emit(
      "change-fields",
      toPersistedFieldSettings(fields),
    );
  };

  // 将“上游接口返回的最新字段列表”和“当前节点已保存的字段设置”合并成运行时可编辑的完整列表。
  // 合并规则：
  // 1. 未配置过时，以上游字段为准，默认全部选中。
  // 2. 配置过时，优先保留已保存字段的顺序和改名结果。
  // 3. 已保存但新上游中已不存在的字段会被丢弃。
  // 4. 新上游中新增、但历史上未保存过的字段会追加到末尾，并默认未选中。
  const buildMergedFields = (upstream: InputField[]) => {
    const existingMap = new Map(props.fieldSettings.map((field) => [field.key, field]));
    const upstreamMap = new Map(upstream.map((field) => [field.key, field]));

    if (!props.configured) {
      return upstream.map<FieldSettingItem>((field) => ({
        ...field,
        selected: true,
      }));
    }

    const orderedKeys = [
      ...props.fieldSettings.map((field) => field.key),
      ...upstream.filter((field) => !existingMap.has(field.key)).map((field) => field.key),
    ];

    return orderedKeys
      .map((key) => {
        const upstreamField = upstreamMap.get(key);
        if (!upstreamField) return null;
        const savedField = existingMap.get(key);
        return {
          key: upstreamField.key,
          type: upstreamField.type,
          name: savedField?.name || upstreamField.name,
          selected: existingMap.has(key),
        } satisfies FieldSettingItem;
      })
      .filter((field): field is FieldSettingItem => Boolean(field));
  };

  const loadUpstreamFields = async () => {
    const nodeContext = getNodeContext?.(props.nodeId);
    if (!nodeContext) {
      upstreamFields.value = [];
      localFields.value = [];
      loading.value = false;
      return;
    }

    const currentToken = ++loadToken;
    loading.value = true;
    // TODO: 当前字段节点的上游字段列表通过 inputNodeMock 模拟接口计算，目的是先验证节点配置联动，后续应替换为真实血缘/元数据接口。
    const fields = await fetchFieldNodeUpstreamFields(nodeContext);
    if (currentToken !== loadToken) return; // 防止旧请求结果覆盖新请求结果
    upstreamFields.value = fields;
    const mergedFields = buildMergedFields(fields);
    localFields.value = mergedFields;
    // localFields.value = [] // debug empty state
    loading.value = false;

    if (!persistedFieldSettingsEqual(toPersistedFieldSettings(mergedFields), props.fieldSettings)) {
      emitChange(mergedFields);
    }
  };

  const syncLocalFields = () => {
    if (loading.value) return;
    const nextFields = buildMergedFields(upstreamFields.value);
    if (fieldSettingsEqual(nextFields, localFields.value)) return;
    if (
      pendingLocalChange.value &&
      persistedFieldSettingsEqual(toPersistedFieldSettings(nextFields), props.fieldSettings)
    ) {
      pendingLocalChange.value = false;
      return;
    }
    localFields.value = nextFields;
  };

  const selectedFields = computed(() => {
    return localFields.value.filter((field) => field.selected);
  });

  const draggableFields = computed({
    get: () => localFields.value,
    set: (value: FieldSettingItem[]) => {
      localFields.value = value;
    },
  });

  const selectedCount = computed(() => selectedFields.value.length);

  const allSelected = computed(() => {
    return localFields.value.length > 0 && localFields.value.every((field) => field.selected);
  });

  const selectedTableColumns = computed<TableColumn[]>(() => {
    return selectedFields.value.map((field) => ({
      title: field.name,
      dataIndex: field.key,
      key: field.key,
      width: 120,
      ellipsis: true,
    }));
  });

  const tableScrollX = computed(() => {
    return Math.max(selectedTableColumns.value.length * 120, 320);
  });

  onMounted(() => {
    void loadUpstreamFields();
  });

  watch(
    () => props.fieldSettings,
    () => {
      if (
        pendingLocalChange.value &&
        persistedFieldSettingsEqual(props.fieldSettings, toPersistedFieldSettings(localFields.value))
      ) {
        pendingLocalChange.value = false;
        return;
      }
      syncLocalFields();
    },
    { deep: true },
  );

  const updateLocalFields = (fields: FieldSettingItem[]) => {
    localFields.value = fields;
    pendingLocalChange.value = true;
    emitChange(fields);
  };

  const startRename = async (field: FieldSettingItem) => {
    editingFieldKey.value = field.key;
    editingName.value = field.name;
    await nextTick();
    const inputElement =
      editingInputRef.value?.input || editingInputRef.value?.$el?.querySelector("input");
    inputElement?.focus();
  };

  const handleEditingKeydown = (event: KeyboardEvent) => {
    if (event.key === "Enter") {
      event.preventDefault();
      confirmRename();
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      cancelRename();
    }
  };

  const confirmRename = () => {
    if (!editingFieldKey.value) return;
    const nextName = editingName.value.trim();

    const targetField = localFields.value.find((field) => field.key === editingFieldKey.value);
    const fallbackName = targetField?.name || "";

    const resolvedName = nextName || fallbackName;

    const nextFields = localFields.value.map((field) =>
      field.key === editingFieldKey.value ? { ...field, name: resolvedName } : field,
    );

    editingFieldKey.value = "";
    editingName.value = "";
    updateLocalFields(nextFields);
  };

  const cancelRename = () => {
    editingFieldKey.value = "";
    editingName.value = "";
  };

  const toggleField = (fieldKey: string) => {
    const nextFields = localFields.value.map((field) =>
      field.key === fieldKey ? { ...field, selected: !field.selected } : field,
    );
    updateLocalFields(nextFields);
  };

  const toggleSelectAll = () => {
    if (loading.value || localFields.value.length === 0) return;
    const nextSelected = !allSelected.value;
    updateLocalFields(
      localFields.value.map((field) => ({
        ...field,
        selected: nextSelected,
      })),
    );
  };

  const handleSortEnd = () => {
    updateLocalFields([...localFields.value]);
  };

  const fieldSettingsEqual = (left: FieldSettingItem[], right: FieldSettingItem[]) => {
    if (left.length !== right.length) return false;
    return left.every((field, index) => {
      const target = right[index];
      return (
        field.key === target?.key &&
        field.name === target?.name &&
        field.type === target?.type &&
        field.selected === target?.selected
      );
    });
  };
</script>

<style scoped lang="scss">
  @use "./config-section-shared.scss";

  .field-config-layout {
    display: flex;
    gap: 8px;
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }

  .field-config-sidebar,
  .field-config-main {
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .field-config-sidebar {
    flex: 0 0 380px;
    min-width: 360px;
    max-width: 420px;
    padding: 4px 0;
    border-right: 1px solid #e2e8f0;
  }

  .field-config-item {
    cursor: default;
  }

  .field-config-item__row {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
    width: 100%;
    overflow: hidden;
  }

  .field-config-item__checkbox {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
  }

  .field-config-item__name--editing {
    width: 120px;
    min-width: 120px;
    flex: 1 1 120px;
  }

  .field-config-item__name--editing :deep(.ant-input) {
    padding: 0;
    border: 0;
    border-radius: 0;
    outline: none;
    box-shadow: none;
    border-bottom: 1px solid #1677ff;
    background: transparent;
    color: #0f172a;
    font-size: 13px;
    font-weight: 500;
    line-height: 20px;
  }

  .field-config-main {
    flex: 1 1 auto;
    min-width: 0;
    padding: 4px 6px 4px 0;
  }

  .field-config-table-wrap {
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }

  .field-config-table-empty {
    min-height: 100%;
  }

  .field-config-table-wrap :deep(.field-config-table.ant-table-wrapper),
  .field-config-table-wrap :deep(.field-config-table .ant-spin-nested-loading),
  .field-config-table-wrap :deep(.field-config-table .ant-spin-container),
  .field-config-table-wrap :deep(.field-config-table .ant-table),
  .field-config-table-wrap :deep(.field-config-table .ant-table-container) {
    height: 100%;
    min-height: 0;
  }

  .field-config-table-wrap :deep(.field-config-table .ant-table-container) {
    display: flex;
    flex-direction: column;
  }

  .field-config-table-wrap :deep(.field-config-table .ant-table-body) {
    flex: 1;
    min-height: 0;
    overflow: auto !important;
  }

  .field-config-table-wrap :deep(.field-config-table .ant-table-placeholder) {
    display: none;
  }
</style>
