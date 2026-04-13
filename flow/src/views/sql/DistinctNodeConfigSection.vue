<template>
  <div class="distinct-config">
    <div class="distinct-config__header">
      <span class="distinct-config__title">字段列表</span>
      <div class="distinct-config__header-actions">
        <span class="distinct-config__count">{{ localSelectedFields.length }}/{{ upstreamFields.length }}</span>
        <span
          class="distinct-config__link"
          :class="{ 'distinct-config__link--disabled': loading }"
          @click="!loading && handleOpenSelector()"
        >
          添加去重字段
        </span>
      </div>
    </div>

    <div class="distinct-config__list">
      <VueDraggable
        v-if="localSelectedFields.length > 0"
        v-model="draggableSelectedFields"
        class="distinct-config__draggable"
        item-key="key"
        handle=".distinct-action-icon--drag"
        ghost-class="distinct-field-item--ghost"
        chosen-class="distinct-field-item--chosen"
        drag-class="distinct-field-item--dragging"
        :animation="160"
        @end="handleSortEnd"
      >
        <div
          v-for="(field, index) in localSelectedFields"
          :key="field.key"
          class="distinct-field-item"
        >
          <div class="distinct-field-item__meta">
            <span class="distinct-field-item__name">{{ field.name }}</span>
            <span class="distinct-field-item__code">{{ field.key }}</span>
            <span class="distinct-field-item__type">{{ field.type }}</span>
          </div>
          <div class="distinct-field-item__actions">
            <span
              title="删除"
              class="distinct-action-icon distinct-action-icon--danger"
              @click="removeField(index)"
            >
              <DeleteOutlined class="distinct-action-icon__svg" />
            </span>
            <span
              title="拖动排序"
              class="distinct-action-icon distinct-action-icon--drag"
            >
              <DragOutlined class="distinct-action-icon__svg" />
            </span>
          </div>
        </div>
      </VueDraggable>

      <div v-if="localSelectedFields.length === 0" class="distinct-config__empty">
        暂未添加去重字段
      </div>
    </div>

    <a-modal
      :open="selectorOpen"
      title="选择去重字段"
      ok-text="确定"
      cancel-text="取消"
      @ok="confirmSelectFields"
      @cancel="selectorOpen = false"
    >
      <div class="distinct-selector">
        <div v-if="loading" class="distinct-selector__empty">字段加载中...</div>
        <div v-else-if="upstreamFields.length === 0" class="distinct-selector__empty">
          当前前序节点无可选字段
        </div>
        <div v-else class="distinct-selector__list">
          <div
            v-for="field in upstreamFields"
            :key="field.key"
            class="distinct-selector__item"
          >
            <input
              v-model="draftSelectedKeys"
              type="checkbox"
              :value="field.key"
            />
            <span class="distinct-selector__name">{{ field.name }}</span>
            <span class="distinct-selector__code">{{ field.key }}</span>
            <span class="distinct-selector__type">{{ field.type }}</span>
          </div>
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
  import { fetchDistinctNodeUpstreamFields, type InputField } from "./inputNodeMock";

  const emit = defineEmits<{
    (e: "change-fields", value: string[]): void;
  }>();

  const props = withDefaults(
    defineProps<{
      nodeId: string;
      selectedFields?: string[];
    }>(),
    {
      selectedFields: () => [],
    },
  );

  const getNodeContext = inject<GetNodeContext>(sqlNodeContextKey);
  const loading = ref(false);
  const selectorOpen = ref(false);
  const upstreamFields = ref<InputField[]>([]);
  const localSelectedFields = ref<InputField[]>([]);
  const draftSelectedKeys = ref<string[]>([]);
  const draggableSelectedFields = computed({
    get: () => localSelectedFields.value,
    set: (value: InputField[]) => {
      localSelectedFields.value = value;
    },
  });
  const syncLocalSelected = () => {
    const upstreamFieldMap = new Map(upstreamFields.value.map((field) => [field.key, field]));
    localSelectedFields.value = props.selectedFields
      .map((key) => upstreamFieldMap.get(key))
      .filter((field): field is InputField => Boolean(field));
  };

  const loadUpstreamFields = async () => {
    const nodeContext = getNodeContext?.(props.nodeId);
    if (!nodeContext) {
      upstreamFields.value = [];
      localSelectedFields.value = [];
      loading.value = false;
      return;
    }

    loading.value = true;
    const fields = await fetchDistinctNodeUpstreamFields(nodeContext);
    upstreamFields.value = fields;
    loading.value = false;
    syncLocalSelected();
  };

  watch(
    () => props.selectedFields,
    () => {
      syncLocalSelected();
    },
    { immediate: true, deep: true },
  );

  onMounted(() => {
    void loadUpstreamFields();
  });

  const handleOpenSelector = () => {
    draftSelectedKeys.value = localSelectedFields.value.map((field) => field.key);
    selectorOpen.value = true;
  };

  const buildOrderedKeys = (draftKeys: string[], currentKeys: string[]) => {
    const selectedKeySet = new Set(draftKeys);
    const orderedCurrentKeys = currentKeys.filter((key) => selectedKeySet.has(key));
    const appendedKeys = upstreamFields.value
      .map((field) => field.key)
      .filter((key) => selectedKeySet.has(key) && !orderedCurrentKeys.includes(key));
    return [...orderedCurrentKeys, ...appendedKeys];
  };

  const confirmSelectFields = () => {
    const orderedKeys = buildOrderedKeys(
      draftSelectedKeys.value,
      localSelectedFields.value.map((field) => field.key),
    );
    const upstreamFieldMap = new Map(upstreamFields.value.map((field) => [field.key, field]));
    const selected = orderedKeys
      .map((key) => upstreamFieldMap.get(key))
      .filter((field): field is InputField => Boolean(field));
    localSelectedFields.value = selected;
    emit(
      "change-fields",
      selected.map((field) => field.key),
    );
    selectorOpen.value = false;
  };

  const removeField = (index: number) => {
    const next = [...localSelectedFields.value];
    next.splice(index, 1);
    localSelectedFields.value = next;
    emit(
      "change-fields",
      next.map((field) => field.key),
    );
  };

  const handleSortEnd = () => {
    emit(
      "change-fields",
      localSelectedFields.value.map((field) => field.key),
    );
  };
</script>

<style scoped lang="scss">
  @use "./config-section-shared" as config;

  .distinct-config {
    @include config.section-column;
    max-width: 380px;
  }

  .distinct-config__header {
    @include config.section-header;
  }

  .distinct-config__header-actions {
    @include config.section-header-actions;
  }

  .distinct-config__count {
    @include config.section-count;
  }

  .distinct-config__link {
    @include config.section-link;
  }

  .distinct-config__link--disabled {
    @include config.section-link-disabled;
  }

  .distinct-config__list {
    @include config.scroll-body;
  }

  .distinct-config__draggable {
    @include config.draggable-list;
  }

  .distinct-field-item {
    @include config.card-row(8px);
    cursor: default;
  }

  .distinct-field-item--ghost {
    @include config.sortable-ghost;
  }

  .distinct-field-item--chosen,
  .distinct-field-item--dragging {
    @include config.sortable-active;
  }

  .distinct-field-item__meta {
    @include config.field-meta;
  }

  .distinct-field-item__name {
    @include config.field-name;
  }

  .distinct-field-item__code,
  .distinct-field-item__type {
    @include config.field-secondary;
  }

  .distinct-field-item__actions {
    @include config.action-group;
  }

  .distinct-action-icon {
    @include config.icon-button-base;
  }

  .distinct-action-icon__svg {
    @include config.icon-svg;
  }

  .distinct-action-icon--drag {
    @include config.drag-handle;
  }

  .distinct-action-icon--disabled {
    @include config.icon-button-disabled;
  }

  .distinct-action-icon--danger {
    @include config.icon-button-danger;
  }

  .distinct-config__empty {
    @include config.empty-state;
  }

  .distinct-selector {
    @include config.selector-panel;
  }

  .distinct-selector__list {
    @include config.selector-list;
  }

  .distinct-selector__item {
    @include config.selector-item;
  }

  .distinct-selector__item input[type="checkbox"] {
    @include config.selector-checkbox;
  }

  .distinct-selector__empty {
    @include config.selector-empty;
  }

  .distinct-selector__name {
    @include config.selector-name;
  }

  .distinct-selector__code {
    @include config.selector-secondary;
  }

  .distinct-selector__type {
    @include config.selector-secondary(120px, right);
  }
</style>

