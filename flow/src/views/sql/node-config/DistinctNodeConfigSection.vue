<template>
  <div class="config-section config-section--narrow">
    <div class="config-section__header">
      <span>字段列表</span>
      <div class="config-section__header-actions">
        <span class="config-section__count">{{ localSelectedFields.length }}/{{ upstreamFields.length }}</span>
        <span
          class="config-section__link"
          :class="{ 'config-section__link--disabled': loading }"
          @click="!loading && handleOpenSelector()"
        >
          添加去重字段
        </span>
      </div>
    </div>

    <div class="config-section__body">
      <VueDraggable
        v-if="localSelectedFields.length > 0"
        v-model="draggableSelectedFields"
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
          v-for="(field, index) in localSelectedFields"
          :key="field.key"
          class="config-item"
        >
          <div class="config-item__meta">
            <span class="config-item__name">{{ field.name }}</span>
            <span class="config-item__code">{{ field.key }}</span>
            <span class="config-item__type">{{ field.type }}</span>
          </div>
          <div class="config-item__actions">
            <span
              title="删除"
              class="config-item__action config-item__action--danger"
              @click="removeField(index)"
            >
              <DeleteOutlined class="config-item__action-icon" />
            </span>
            <span
              title="拖动排序"
              class="config-item__drag"
            >
              <DragOutlined class="config-item__action-icon" />
            </span>
          </div>
        </div>
      </VueDraggable>

      <div v-if="localSelectedFields.length === 0" class="config-section__empty">
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
      <div class="config-selector">
        <div>{{ draftSelectedKeys }}</div>
        <div v-if="loading" class="config-selector__empty">字段加载中...</div>
        <div v-else-if="upstreamFields.length === 0" class="config-selector__empty">
          当前无可选字段
        </div>
        <div v-else class="config-selector__list">
          <div
            v-for="field in upstreamFields"
            :key="field.key"
            class="config-selector__item"
          >
            <input
              v-model="draftSelectedKeys"
              type="checkbox"
              :value="field.key"
            />
            <span class="config-selector__name">{{ field.name }}</span>
            <span class="config-selector__code">{{ field.key }}</span>
            <span class="config-selector__type">{{ field.type }}</span>
          </div>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
  import { computed, inject, onMounted, ref } from "vue";
  import { DeleteOutlined, DragOutlined } from "@ant-design/icons-vue";
  import { VueDraggable } from "vue-draggable-plus";
  import { sqlNodeContextKey, type GetNodeContext } from "../nodeContext";
  import { fetchDistinctNodeUpstreamFields } from "../inputNodeMock";
  import type { InputField } from "../types";

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
    // TODO: 当前去重节点的可选字段来自 inputNodeMock 模拟接口，目的是先打通配置交互，后续应替换为真实上游字段接口。
    const fields = await fetchDistinctNodeUpstreamFields(nodeContext);
    upstreamFields.value = fields;
    loading.value = false;
    syncLocalSelected();
  };

  onMounted(() => {
    console.log('mounted');
    
    void loadUpstreamFields();
  });

  const handleOpenSelector = () => {
    draftSelectedKeys.value = localSelectedFields.value.map((field) => field.key);
    selectorOpen.value = true;
  };

  const buildOrderedKeys = (draftKeys: string[], currentKeys: string[]) => {
    const selectedKeySet = new Set(draftKeys); // 这次弹框里选择的去重字段列表
    // 如果本地配置里有，那就保持原有的顺序。没有的就加在后面
    const orderedCurrentKeys = currentKeys.filter((key) => selectedKeySet.has(key));
    const appendedKeys = upstreamFields.value
      .map((field) => field.key)
      .filter((key) => selectedKeySet.has(key) && !orderedCurrentKeys.includes(key));
    return [...orderedCurrentKeys, ...appendedKeys];
  };

  const pendingLocalChange = ref(false); // dirty flag. true = local data changed, need to reCalc

  const flushDraft = () => {
    console.log('去重 flush');
    
    if (!pendingLocalChange.value) return;
    pendingLocalChange.value = false;
    emit(
      "change-fields",
      localSelectedFields.value.map((field) => field.key),
    );
  };

  const confirmSelectFields = () => {
    const orderedKeys = buildOrderedKeys(
      draftSelectedKeys.value,
      localSelectedFields.value.map((field) => field.key),
    );
    const upstreamFieldMap = new Map(upstreamFields.value.map((field) => [field.key, field])); //构建好map以后下面就直接 get，时间O[1]
    const selected = orderedKeys
      .map((key) => upstreamFieldMap.get(key))
      .filter((field): field is InputField => Boolean(field));
    localSelectedFields.value = selected;
    pendingLocalChange.value = true;
    selectorOpen.value = false;
  };

  const removeField = (index: number) => {
    localSelectedFields.value.splice(index, 1);
    pendingLocalChange.value = true;
  };

  const handleSortEnd = () => {
    pendingLocalChange.value = true;
  };

  defineExpose({ flushDraft });
</script>

<style scoped lang="scss">
  @use "./config-section-shared.scss";
</style>
