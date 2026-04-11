<template>
  <div class="distinct-config">
    <div class="distinct-config__toolbar">
      <span
        class="distinct-config__link"
        :class="{ 'distinct-config__link--disabled': loading }"
        @click="!loading && handleOpenSelector()"
      >
        添加去重字段
      </span>
    </div>

    <div class="distinct-config__list">
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
            class="distinct-action-icon"
            :class="{ 'distinct-action-icon--disabled': index === 0 }"
            @click="index !== 0 && moveField(index, -1)"
            title="上移"
          >
            <UpOutlined class="distinct-action-icon__svg" />
          </span>
          <span
            title="下移"
            class="distinct-action-icon"
            :class="{ 'distinct-action-icon--disabled': index === localSelectedFields.length - 1 }"
            @click="index !== localSelectedFields.length - 1 && moveField(index, 1)"
          >
            <DownOutlined class="distinct-action-icon__svg" />
          </span>
          <span
            title="删除"
            class="distinct-action-icon distinct-action-icon--danger"
            @click="removeField(index)"
          >
            <DeleteOutlined class="distinct-action-icon__svg" />
          </span>
        </div>
      </div>

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
  import { inject, onMounted, ref, watch } from "vue";
  import { DeleteOutlined, DownOutlined, UpOutlined } from "@ant-design/icons-vue";
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
  const syncLocalSelected = () => {
    const keySet = new Set(props.selectedFields);
    localSelectedFields.value = upstreamFields.value.filter((field) => keySet.has(field.key));
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

  const confirmSelectFields = () => {
    const selected = upstreamFields.value.filter((field) =>
      draftSelectedKeys.value.includes(field.key),
    );
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

  const moveField = (index: number, offset: -1 | 1) => {
    const targetIndex = index + offset;
    if (targetIndex < 0 || targetIndex >= localSelectedFields.value.length) return;
    const next = [...localSelectedFields.value];
    const current = next[index];
    next[index] = next[targetIndex];
    next[targetIndex] = current;
    localSelectedFields.value = next;
    emit(
      "change-fields",
      next.map((field) => field.key),
    );
  };
</script>

<style scoped lang="scss">
  .distinct-config {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 4px 6px;
  }

  .distinct-config__toolbar {
    min-height: 28px;
    display: flex;
    align-items: center;
    justify-content: flex-start;
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
    border: 1px solid #e2e8f0;
    background: #fff;
    width: 100%;
  }

  .distinct-field-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 6px;
    border-bottom: 1px solid #f1f5f9;
  }

  .distinct-field-item:last-child {
    border-bottom: 0;
  }

  .distinct-field-item__meta {
    min-width: 0;
    display: inline-flex;
    align-items: center;
    gap: 16px;
    font-size: 12px;
  }

  .distinct-field-item__name {
    color: #0f172a;
    font-weight: 500;
  }

  .distinct-field-item__code,
  .distinct-field-item__type {
    color: #64748b;
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
    min-height: 120px;
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



