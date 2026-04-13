<template>
  <div class="group-config">
    <div class="group-config__panel">
      <div class="group-config__header">
        <span class="group-config__title">分组字段</span>
        <div class="group-config__header-actions">
          <span class="group-config__count">{{ localGroupFields.length }}/{{ upstreamFields.length }}</span>
          <span
            class="group-config__link"
            :class="{ 'group-config__link--disabled': loading || upstreamFields.length === 0 }"
            @click="!loading && upstreamFields.length > 0 && openGroupSelector()"
          >
            添加字段
          </span>
        </div>
      </div>

      <div class="group-config__body">
        <div v-if="loading" class="group-config__empty">字段加载中...</div>
        <div v-else-if="localGroupFields.length === 0" class="group-config__empty">
          暂未添加分组字段
        </div>
        <VueDraggable
          v-else
          v-model="draggableGroupFields"
          class="group-config__draggable"
          item-key="key"
          handle=".group-config-item__drag"
          ghost-class="group-config-item--ghost"
          chosen-class="group-config-item--chosen"
          drag-class="group-config-item--dragging"
          :animation="160"
          @end="handleGroupSortEnd"
        >
          <div
            v-for="field in localGroupFields"
            :key="field.key"
            class="group-config-item"
          >
            <div class="group-config-item__meta">
              <span class="group-config-item__name">{{ field.name }}</span>
              <span class="group-config-item__code">{{ field.key }}</span>
              <span class="group-config-item__type">{{ field.type }}</span>
            </div>
            <div class="group-config-item__actions">
              <span
                class="group-config-item__action group-config-item__action--danger"
                title="删除"
                @click="removeGroupField(field.key)"
              >
                <DeleteOutlined class="group-config-item__action-icon" />
              </span>
              <span class="group-config-item__drag" title="拖动排序">
                <DragOutlined class="group-config-item__action-icon" />
              </span>
            </div>
          </div>
        </VueDraggable>
      </div>
    </div>

    <div class="group-config__panel group-config__panel--wide">
      <div class="group-config__header">
        <span class="group-config__title">汇总字段</span>
        <div class="group-config__header-actions">
          <span class="group-config__count">{{ localAggregateFields.length }}/{{ upstreamFields.length }}</span>
          <span
            class="group-config__link"
            :class="{ 'group-config__link--disabled': loading || upstreamFields.length === 0 }"
            @click="!loading && upstreamFields.length > 0 && openAggregateSelector()"
          >
            添加字段
          </span>
        </div>
      </div>

      <div class="group-config__body">
        <div v-if="loading" class="group-config__empty">字段加载中...</div>
        <div v-else-if="localAggregateFields.length === 0" class="group-config__empty">
          暂未添加汇总字段
        </div>
        <VueDraggable
          v-else
          v-model="draggableAggregateFields"
          class="group-config__draggable"
          item-key="key"
          handle=".group-config-item__drag"
          ghost-class="group-config-item--ghost"
          chosen-class="group-config-item--chosen"
          drag-class="group-config-item--dragging"
          :animation="160"
          @end="handleAggregateSortEnd"
        >
          <div
            v-for="field in localAggregateFields"
            :key="field.key"
            class="group-config-item group-config-item--aggregate"
          >
            <div class="group-config-item__meta">
              <span class="group-config-item__name">{{ field.name }}</span>
              <span class="group-config-item__code">{{ field.key }}</span>
              <span class="group-config-item__type">{{ field.type }}</span>
            </div>
            <div class="group-config-item__controls">
              <a-select
                size="small"
                class="group-config-item__method"
                :value="field.method"
                :options="getMethodOptions(field.type)"
                @change="(value) => updateAggregateMethod(field.key, value)"
              />
              <span
                class="group-config-item__action group-config-item__action--danger"
                title="删除"
                @click="removeAggregateField(field.key)"
              >
                <DeleteOutlined class="group-config-item__action-icon" />
              </span>
              <span class="group-config-item__drag" title="拖动排序">
                <DragOutlined class="group-config-item__action-icon" />
              </span>
            </div>
          </div>
        </VueDraggable>
      </div>
    </div>

    <a-modal
      :open="groupSelectorOpen"
      title="选择分组字段"
      ok-text="确定"
      cancel-text="取消"
      @ok="confirmGroupFields"
      @cancel="groupSelectorOpen = false"
    >
      <div class="group-selector">
        <div v-if="loading" class="group-selector__empty">字段加载中...</div>
        <div v-else-if="upstreamFields.length === 0" class="group-selector__empty">
          当前前序节点无可选字段
        </div>
        <div v-else class="group-selector__list">
          <label
            v-for="field in upstreamFields"
            :key="field.key"
            class="group-selector__item"
          >
            <input v-model="draftGroupKeys" type="checkbox" :value="field.key" />
            <span class="group-selector__name">{{ field.name }}</span>
            <span class="group-selector__code">{{ field.key }}</span>
            <span class="group-selector__type">{{ field.type }}</span>
          </label>
        </div>
      </div>
    </a-modal>

    <a-modal
      :open="aggregateSelectorOpen"
      title="选择汇总字段"
      ok-text="确定"
      cancel-text="取消"
      @ok="confirmAggregateFields"
      @cancel="aggregateSelectorOpen = false"
    >
      <div class="group-selector">
        <div v-if="loading" class="group-selector__empty">字段加载中...</div>
        <div v-else-if="upstreamFields.length === 0" class="group-selector__empty">
          当前前序节点无可选字段
        </div>
        <div v-else class="group-selector__list">
          <label
            v-for="field in upstreamFields"
            :key="field.key"
            class="group-selector__item"
          >
            <input v-model="draftAggregateKeys" type="checkbox" :value="field.key" />
            <span class="group-selector__name">{{ field.name }}</span>
            <span class="group-selector__code">{{ field.key }}</span>
            <span class="group-selector__type">{{ field.type }}</span>
          </label>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
  import { computed, inject, onMounted, ref, watch } from "vue";
  import { DeleteOutlined, DragOutlined } from "@ant-design/icons-vue";
  import { VueDraggable } from "vue-draggable-plus";
  import { sqlNodeContextKey, type GetNodeContext } from "./nodeContext";
  import {
    fetchGroupNodeUpstreamFields,
    getGroupAggregateMethodOptions,
    type GroupAggregateFieldItem,
    type GroupAggregateFieldPersistedItem,
    type GroupAggregateMethod,
    type InputField,
  } from "./inputNodeMock";

  const emit = defineEmits<{
    (e: "change-group-fields", value: string[]): void;
    (e: "change-aggregate-fields", value: GroupAggregateFieldPersistedItem[]): void;
  }>();

  const props = withDefaults(
    defineProps<{
      nodeId: string;
      groupFields?: string[];
      aggregateFields?: GroupAggregateFieldPersistedItem[];
    }>(),
    {
      groupFields: () => [], // 分组字段
      aggregateFields: () => [], // 汇总字段
    },
  );

  const getNodeContext = inject<GetNodeContext>(sqlNodeContextKey);
  const loading = ref(false);
  const upstreamFields = ref<InputField[]>([]);
  const localGroupFields = ref<InputField[]>([]);
  const localAggregateFields = ref<GroupAggregateFieldItem[]>([]);
  const groupSelectorOpen = ref(false);
  const aggregateSelectorOpen = ref(false);
  const draftGroupKeys = ref<string[]>([]);
  const draftAggregateKeys = ref<string[]>([]);
  let loadToken = 0;

  const resolveMethod = (fieldType: string, method?: string): GroupAggregateMethod => {
    const options = getGroupAggregateMethodOptions(fieldType);
    const matched = options.find((item) => item.value === method);
    return matched?.value || options[0]?.value || "count";
  };

  const toAggregatePersisted = (fields: GroupAggregateFieldItem[]) => {
    return fields.map<GroupAggregateFieldPersistedItem>((field) => ({
      key: field.key,
      method: field.method,
    }));
  };

  const syncLocalState = () => {
    const upstreamMap = new Map(upstreamFields.value.map((field) => [field.key, field]));

    localGroupFields.value = props.groupFields
      .map((key) => upstreamMap.get(key))
      .filter((field): field is InputField => Boolean(field));

    localAggregateFields.value = props.aggregateFields
      .map((field) => {
        const upstreamField = upstreamMap.get(field.key);
        if (!upstreamField) return null;
        return {
          ...upstreamField,
          method: resolveMethod(upstreamField.type, field.method),
        } satisfies GroupAggregateFieldItem;
      })
      .filter((field): field is GroupAggregateFieldItem => Boolean(field));
  };

  const loadUpstreamFields = async () => {
    const nodeContext = getNodeContext?.(props.nodeId);
    if (!nodeContext) {
      upstreamFields.value = [];
      localGroupFields.value = [];
      localAggregateFields.value = [];
      loading.value = false;
      return;
    }

    const currentToken = ++loadToken;
    loading.value = true;
    const fields = await fetchGroupNodeUpstreamFields(nodeContext);
    if (currentToken !== loadToken) return;
    upstreamFields.value = fields;
    loading.value = false;
    syncLocalState();
  };

  const buildOrderedKeys = (draftKeys: string[], currentKeys: string[]) => {
    const selectedKeySet = new Set(draftKeys);
    const orderedCurrentKeys = currentKeys.filter((key) => selectedKeySet.has(key));
    const appendedKeys = upstreamFields.value
      .map((field) => field.key)
      .filter((key) => selectedKeySet.has(key) && !orderedCurrentKeys.includes(key));
    return [...orderedCurrentKeys, ...appendedKeys];
  };

  const emitGroupFields = (fields: InputField[]) => {
    emit(
      "change-group-fields",
      fields.map((field) => field.key),
    );
  };

  const emitAggregateFields = (fields: GroupAggregateFieldItem[]) => {
    emit("change-aggregate-fields", toAggregatePersisted(fields));
  };

  const draggableGroupFields = computed({
    get: () => localGroupFields.value,
    set: (value: InputField[]) => {
      localGroupFields.value = value;
    },
  });

  const draggableAggregateFields = computed({
    get: () => localAggregateFields.value,
    set: (value: GroupAggregateFieldItem[]) => {
      localAggregateFields.value = value;
    },
  });

  const getMethodOptions = (type: string) => {
    return getGroupAggregateMethodOptions(type);
  };

  onMounted(() => {
    void loadUpstreamFields();
  });

  watch(
    () => [props.groupFields, props.aggregateFields],
    () => {
      console.log('sync');
      
      syncLocalState();
    },
    { deep: true },
  );

  const openGroupSelector = () => {
    draftGroupKeys.value = localGroupFields.value.map((field) => field.key);
    groupSelectorOpen.value = true;
  };

  const openAggregateSelector = () => {
    draftAggregateKeys.value = localAggregateFields.value.map((field) => field.key);
    aggregateSelectorOpen.value = true;
  };

  const confirmGroupFields = () => {
    const orderedKeys = buildOrderedKeys(
      draftGroupKeys.value,
      localGroupFields.value.map((field) => field.key),
    );
    const upstreamMap = new Map(upstreamFields.value.map((field) => [field.key, field]));
    const nextFields = orderedKeys
      .map((key) => upstreamMap.get(key))
      .filter((field): field is InputField => Boolean(field));
    localGroupFields.value = nextFields;
    emitGroupFields(nextFields);
    groupSelectorOpen.value = false;
  };

  const confirmAggregateFields = () => {
    const orderedKeys = buildOrderedKeys(
      draftAggregateKeys.value,
      localAggregateFields.value.map((field) => field.key),
    );
    const upstreamMap = new Map(upstreamFields.value.map((field) => [field.key, field]));
    const currentMethodMap = new Map(localAggregateFields.value.map((field) => [field.key, field.method]));
    const nextFields = orderedKeys
      .map((key) => {
        const upstreamField = upstreamMap.get(key);
        if (!upstreamField) return null;
        return {
          ...upstreamField,
          method: resolveMethod(upstreamField.type, currentMethodMap.get(key)),
        } satisfies GroupAggregateFieldItem;
      })
      .filter((field): field is GroupAggregateFieldItem => Boolean(field));
    localAggregateFields.value = nextFields;
    emitAggregateFields(nextFields);
    aggregateSelectorOpen.value = false;
  };

  const removeGroupField = (fieldKey: string) => {
    const nextFields = localGroupFields.value.filter((field) => field.key !== fieldKey);
    localGroupFields.value = nextFields;
    emitGroupFields(nextFields);
  };

  const removeAggregateField = (fieldKey: string) => {
    const nextFields = localAggregateFields.value.filter((field) => field.key !== fieldKey);
    localAggregateFields.value = nextFields;
    emitAggregateFields(nextFields);
  };

  const handleGroupSortEnd = () => {
    emitGroupFields(localGroupFields.value);
  };

  const handleAggregateSortEnd = () => {
    emitAggregateFields(localAggregateFields.value);
  };

  const updateAggregateMethod = (fieldKey: string, value: GroupAggregateMethod) => {
    const targetField = localAggregateFields.value.find((field) => field.key === fieldKey);
    if (!targetField) return;
    // targetField.method = resolveMethod(targetField.type, value);
    targetField.method = value;
    emitAggregateFields(localAggregateFields.value);
  };
</script>

<style scoped lang="scss">
  .group-config {
    flex: 1;
    min-height: 0;
    display: flex;
    gap: 6px;
    padding: 4px 6px;
    overflow: hidden;
  }

  .group-config__panel {
    flex: 1 1 0;
    min-width: 0;
    display: flex;
    flex-direction: column;
    border: 1px solid #e2e8f0;
    background: #fff;
    overflow: hidden;
  }

  .group-config__panel--wide {
    flex: 1.2 1 0;
  }

  .group-config__header {
    min-height: 30px;
    padding: 0 6px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    border-bottom: 1px solid #e2e8f0;
    color: #334155;
    font-size: 12px;
    font-weight: 600;
  }

  .group-config__header-actions {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }

  .group-config__count {
    color: #64748b;
    font-weight: 500;
  }

  .group-config__link {
    color: #1677ff;
    cursor: pointer;
    user-select: none;
    font-weight: 500;
  }

  .group-config__link--disabled {
    color: #94a3b8;
    cursor: not-allowed;
  }

  .group-config__body {
    flex: 1;
    min-height: 0;
    overflow: auto;
    padding: 4px;
  }

  .group-config__draggable {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .group-config__empty {
    height: 100%;
    min-height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #94a3b8;
    font-size: 12px;
    text-align: center;
  }

  .group-config-item {
    min-width: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 6px;
    border: 1px solid #e2e8f0;
    background: #fff;
  }

  .group-config-item--aggregate {
    align-items: stretch;
  }

  .group-config-item--ghost {
    opacity: 0.55;
    background: #f8fbff;
    border-color: #91caff;
  }

  .group-config-item--chosen,
  .group-config-item--dragging {
    border-color: #1677ff;
    box-shadow: 0 0 0 1px rgba(22, 119, 255, 0.12);
  }

  .group-config-item__meta {
    min-width: 0;
    flex: 1;
    display: inline-flex;
    align-items: center;
    gap: 14px;
    font-size: 12px;
    overflow: hidden;
  }

  .group-config-item__name,
  .group-selector__name {
    min-width: 0;
    width: 120px;
    color: #0f172a;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .group-config-item__code,
  .group-config-item__type,
  .group-selector__code,
  .group-selector__type {
    color: #64748b;
    word-break: break-all;
  }

  .group-config-item__code,
  .group-selector__code {
    width: 120px;
  }

  .group-config-item__type,
  .group-selector__type {
    width: 92px;
  }

  .group-config-item__actions,
  .group-config-item__controls {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  .group-config-item__method {
    width: 132px;
  }

  .group-config-item__action,
  .group-config-item__drag {
    width: 16px;
    height: 16px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: #64748b;
    cursor: pointer;
    border-radius: 2px;
    transition: color 0.2s ease, background-color 0.2s ease;
  }

  .group-config-item__action-icon {
    width: 12px;
    height: 12px;
    font-size: 12px;
    line-height: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .group-config-item__action:hover,
  .group-config-item__drag:hover {
    color: #334155;
    background: #f1f5f9;
  }

  .group-config-item__action--danger {
    color: #ef4444;
  }

  .group-config-item__action--danger:hover {
    color: #dc2626;
    background: #fee2e2;
  }

  .group-selector {
    height: 420px;
    min-height: 0;
    border: 1px solid #e2e8f0;
    background: #fff;
  }

  .group-selector__list {
    height: 100%;
    overflow: auto;
  }

  .group-selector__item {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 8px 10px;
    border-bottom: 1px solid #f1f5f9;
    font-size: 12px;
  }

  .group-selector__item input[type="checkbox"] {
    width: 20px;
    flex: 0 0 20px;
    margin: 2px 0 0;
  }

  .group-selector__empty {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #94a3b8;
    font-size: 12px;
  }
</style>
