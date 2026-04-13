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
      console.log('props.selectedFields');
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
  .distinct-config {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    gap: 0;
    padding: 4px 6px;
    max-width: 380px;
  }

  .distinct-config__header {
    min-height: 24px;
    padding: 0 6px 4px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    color: #334155;
    font-size: 12px;
    font-weight: 600;
  }

  .distinct-config__header-actions {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }

  .distinct-config__count {
    color: #64748b;
    font-weight: 500;
  }

  .distinct-config__link {
    flex-shrink: 0;
    font-size: 12px;
    font-weight: 500;
    line-height: 18px;
    color: #1677ff;
    cursor: pointer;
    user-select: none;
  }

  .distinct-config__link--disabled {
    color: #94a3b8;
    cursor: not-allowed;
  }

  .distinct-config__list {
    flex: 1;
    min-height: 0;
    overflow: auto;
    padding: 0 6px 4px;
  }

  .distinct-config__draggable {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .distinct-field-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 6px;
    background: #fff;
    border: 1px solid #e2e8f0;
    cursor: default;
  }

  .distinct-field-item--ghost {
    opacity: 0.55;
    background: #f8fbff;
    border-color: #91caff;
  }

  .distinct-field-item--chosen,
  .distinct-field-item--dragging {
    border-color: #1677ff;
    box-shadow: 0 0 0 1px rgba(22, 119, 255, 0.12);
  }

  .distinct-field-item__meta {
    min-width: 0;
    flex: 1;
    display: flex;
    align-items: center;
    gap: 8px;
    overflow: hidden;
  }

  .distinct-field-item__name {
    min-width: 120px;
    flex: 1 1 120px;
    color: #0f172a;
    font-size: 13px;
    font-weight: 500;
    line-height: 20px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .distinct-field-item__code,
  .distinct-field-item__type {
    flex: 0 1 96px;
    min-width: 0;
    color: #64748b;
    font-size: 12px;
    line-height: 18px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .distinct-field-item__actions {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }

  .distinct-action-icon {
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

  .distinct-action-icon__svg {
    width: 12px;
    height: 12px;
    font-size: 12px;
    line-height: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .distinct-action-icon:hover {
    background: #f1f5f9;
    color: #334155;
  }

  .distinct-action-icon--drag {
    cursor: grab;
  }

  .distinct-action-icon--drag:active {
    cursor: grabbing;
  }

  .distinct-action-icon--disabled {
    color: #cbd5e1;
    cursor: not-allowed;
    pointer-events: none;
  }

  .distinct-action-icon--danger {
    color: #ef4444;
  }

  .distinct-action-icon--danger:hover {
    color: #dc2626;
    background: #fee2e2;
  }

  .distinct-config__empty {
    height: 100%;
    min-height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #94a3b8;
    font-size: 12px;
  }

  .distinct-selector {
    height: 420px;
    min-height: 0;
    border: 1px solid #e2e8f0;
    background: #fff;
  }

  .distinct-selector__list {
    height: 100%;
    overflow: auto;
  }

  .distinct-selector__item {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 8px 10px;
    border-bottom: 1px solid #f1f5f9;
    font-size: 12px;
  }

  .distinct-selector__item input[type="checkbox"] {
    width: 20px;
    flex: 0 0 20px;
    margin: 2px 0 0;
  }

  .distinct-selector__empty {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #94a3b8;
    font-size: 12px;
  }

  .distinct-selector__name {
    width: 140px;
    min-width: 0;
    color: #0f172a;
    word-break: break-all;
  }

  .distinct-selector__code {
    width: 140px;
    min-width: 0;
    color: #64748b;
    word-break: break-all;
  }

  .distinct-selector__type {
    width: 120px;
    color: #64748b;
    text-align: right;
  }
</style>


