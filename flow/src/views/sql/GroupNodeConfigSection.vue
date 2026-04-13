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
    targetField.method = value;
    emitAggregateFields(localAggregateFields.value);
  };
</script>

<style scoped lang="scss">
  @use "./config-section-shared" as config;

  .group-config {
    display: flex;
    flex: 1;
    gap: 8px;
    min-height: 0;
    padding: 4px 6px;
    overflow: hidden;
  }

  .group-config__panel {
    @include config.panel-frame;
  }

  .group-config__panel--wide {
    flex: 1.2 1 0;
  }

  .group-config__header {
    @include config.section-header(30px, 0 8px, true);
  }

  .group-config__header-actions {
    @include config.section-header-actions;
  }

  .group-config__count {
    @include config.section-count;
  }

  .group-config__link {
    @include config.section-link;
  }

  .group-config__link--disabled {
    @include config.section-link-disabled;
  }

  .group-config__body {
    @include config.scroll-body(6px);
  }

  .group-config__draggable {
    @include config.draggable-list;
  }

  .group-config__empty {
    @include config.empty-state;
  }

  .group-config-item {
    @include config.card-row(8px);
  }

  .group-config-item--aggregate {
    align-items: stretch;
  }

  .group-config-item--ghost {
    @include config.sortable-ghost;
  }

  .group-config-item--chosen,
  .group-config-item--dragging {
    @include config.sortable-active;
  }

  .group-config-item__meta {
    @include config.field-meta(14px);
    font-size: 12px;
  }

  .group-config-item__name {
    @include config.field-name;
  }

  .group-config-item__code,
  .group-config-item__type {
    @include config.field-secondary;
    word-break: break-all;
  }

  .group-config-item__code {
    flex-basis: 120px;
  }

  .group-config-item__type {
    flex-basis: 92px;
  }

  .group-config-item__actions,
  .group-config-item__controls {
    @include config.action-group;
  }

  .group-config-item__method {
    width: 132px;
  }

  .group-config-item__action,
  .group-config-item__drag {
    @include config.icon-button-base;
  }

  .group-config-item__action-icon {
    @include config.icon-svg;
  }

  .group-config-item__drag {
    @include config.drag-handle;
  }

  .group-config-item__action--danger {
    @include config.icon-button-danger;
  }

  .group-selector {
    @include config.selector-panel;
  }

  .group-selector__list {
    @include config.selector-list;
  }

  .group-selector__item {
    @include config.selector-item;
  }

  .group-selector__item input[type="checkbox"] {
    @include config.selector-checkbox;
  }

  .group-selector__empty {
    @include config.selector-empty;
  }

  .group-selector__name {
    @include config.selector-name(120px);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .group-selector__code {
    @include config.selector-secondary(120px);
  }

  .group-selector__type {
    @include config.selector-secondary(92px);
  }
</style>
