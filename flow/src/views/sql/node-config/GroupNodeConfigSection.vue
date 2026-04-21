<template>
  <div class="group-config">
    <div class="config-panel">
      <div class="config-section__header config-section__header--panel">
        <span>分组字段</span>
        <div class="config-section__header-actions">
          <span class="config-section__count"
            >{{ localGroupFields.length }}/{{ upstreamFields.length }}</span
          >
          <span
            class="config-section__link"
            :class="{
              'config-section__link--disabled':
                loading || upstreamFields.length === 0,
            }"
            @click="
              !loading && upstreamFields.length > 0 && openGroupSelector()
            "
          >
            添加字段
          </span>
        </div>
      </div>

      <div class="config-section__body config-section__body--panel">
        <div v-if="loading" class="config-section__empty">字段加载中...</div>
        <div
          v-else-if="localGroupFields.length === 0"
          class="config-section__empty"
        >
          暂未添加分组字段
        </div>
        <VueDraggable
          v-else
          v-model="draggableGroupFields"
          class="config-section__draggable"
          item-key="key"
          handle=".config-item__drag"
          ghost-class="config-item--ghost"
          chosen-class="config-item--chosen"
          drag-class="config-item--dragging"
          :animation="160"
          @end="handleGroupSortEnd"
        >
          <div
            v-for="field in localGroupFields"
            :key="field.key"
            class="config-item"
          >
            <div class="config-item__meta config-item__meta--wide">
              <span class="config-item__name">{{ field.name }}</span>
              <span
                class="config-item__code config-item__code--wide config-item__word-break"
                >{{ field.key }}</span
              >
              <span
                class="config-item__type config-item__type--compact config-item__word-break"
                >{{ field.type }}</span
              >
            </div>
            <div class="config-item__actions">
              <span
                class="config-item__action config-item__action--danger"
                title="删除"
                @click="removeGroupField(field.key)"
              >
                <DeleteOutlined class="config-item__action-icon" />
              </span>
              <span class="config-item__drag" title="拖动排序">
                <DragOutlined class="config-item__action-icon" />
              </span>
            </div>
          </div>
        </VueDraggable>
      </div>
    </div>

    <div class="config-panel config-panel--wide">
      <div class="config-section__header config-section__header--panel">
        <span>汇总字段</span>
        <div class="config-section__header-actions">
          <span class="config-section__count"
            >{{ localAggregateFields.length }}/{{ upstreamFields.length }}</span
          >
          <span
            class="config-section__link"
            :class="{
              'config-section__link--disabled':
                loading || upstreamFields.length === 0,
            }"
            @click="
              !loading && upstreamFields.length > 0 && openAggregateSelector()
            "
          >
            添加字段
          </span>
        </div>
      </div>

      <div class="config-section__body config-section__body--panel">
        <div v-if="loading" class="config-section__empty">字段加载中...</div>
        <div
          v-else-if="localAggregateFields.length === 0"
          class="config-section__empty"
        >
          暂未添加汇总字段
        </div>
        <VueDraggable
          v-else
          v-model="draggableAggregateFields"
          class="config-section__draggable"
          item-key="key"
          handle=".config-item__drag"
          ghost-class="config-item--ghost"
          chosen-class="config-item--chosen"
          drag-class="config-item--dragging"
          :animation="160"
          @end="handleAggregateSortEnd"
        >
          <div
            v-for="field in localAggregateFields"
            :key="field.sourceFieldKey"
            class="config-item config-item--aggregate"
          >
            <div class="config-item__meta config-item__meta--wide">
              <span class="config-item__name">{{ field.alias }}</span>
              <span
                class="config-item__code config-item__code--wide config-item__word-break"
                >{{ field.sourceFieldKey }}</span
              >
              <span
                class="config-item__type config-item__type--compact config-item__word-break"
                >{{ field.type }}</span
              >
            </div>
            <div class="config-item__controls">
              <a-select
                size="small"
                class="config-item__method"
                :value="field.method"
                :options="getMethodOptions(field.type)"
                @change="
                  (value) => updateAggregateMethod(field.sourceFieldKey, value)
                "
              />
              <span
                class="config-item__action config-item__action--danger"
                title="删除"
                @click="removeAggregateField(field.sourceFieldKey)"
              >
                <DeleteOutlined class="config-item__action-icon" />
              </span>
              <span class="config-item__drag" title="拖动排序">
                <DragOutlined class="config-item__action-icon" />
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
      <div class="config-selector">
        <div v-if="loading" class="config-selector__empty">字段加载中...</div>
        <div
          v-else-if="upstreamFields.length === 0"
          class="config-selector__empty"
        >
          当前前序节点无可选字段
        </div>
        <div v-else class="config-selector__list">
          <label
            v-for="field in upstreamFields"
            :key="field.key"
            class="config-selector__item"
          >
            <input
              v-model="draftGroupKeys"
              type="checkbox"
              :value="field.key"
            />
            <span
              class="config-selector__name config-selector__name--compact"
              >{{ field.name }}</span
            >
            <span
              class="config-selector__code config-selector__code--compact"
              >{{ field.key }}</span
            >
            <span
              class="config-selector__type config-selector__type--compact"
              >{{ field.type }}</span
            >
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
      <div class="config-selector">
        <div v-if="loading" class="config-selector__empty">字段加载中...</div>
        <div
          v-else-if="upstreamFields.length === 0"
          class="config-selector__empty"
        >
          当前前序节点无可选字段
        </div>
        <div v-else class="config-selector__list">
          <label
            v-for="field in upstreamFields"
            :key="field.key"
            class="config-selector__item"
          >
            <input
              v-model="draftAggregateKeys"
              type="checkbox"
              :value="field.key"
            />
            <span
              class="config-selector__name config-selector__name--compact"
              >{{ field.name }}</span
            >
            <span
              class="config-selector__code config-selector__code--compact"
              >{{ field.key }}</span
            >
            <span
              class="config-selector__type config-selector__type--compact"
              >{{ field.type }}</span
            >
          </label>
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
  import {
    fetchGroupNodeUpstreamFields,
    getGroupAggregateMethodOptions,
  } from "../inputNodeMock";
  import type {
    GroupAggregateFieldItem,
    GroupAggregateMethod,
    InputField,
  } from "../types";

  const emit = defineEmits<{
    (e: "change-group-fields", value: string[]): void;
    (e: "change-aggregate-fields", value: GroupAggregateFieldItem[]): void;
  }>();

  const props = withDefaults(
    defineProps<{
      nodeId: string;
      groupFields?: string[];
      aggregateFields?: GroupAggregateFieldItem[];
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

  // 字段类型可能发生变化，变化后，之前设定的汇总方法可能不适用，需要判断下汇总方法。
  const resolveMethod = (
    fieldType: string,
    method?: string,
  ): GroupAggregateMethod => {
    // debugger
    const options = getGroupAggregateMethodOptions(fieldType);
    const matched = options.find((item) => item.value === method);
    return matched?.value || options[0]?.value || "count";
  };

  const syncLocalState = () => {
    const upstreamMap = new Map(
      upstreamFields.value.map((field) => [field.key, field]),
    );

    localGroupFields.value = props.groupFields
      .map((key) => upstreamMap.get(key))
      .filter((field): field is InputField => Boolean(field));

    localAggregateFields.value = props.aggregateFields
      .map((field) => {
        const upstreamField = upstreamMap.get(field.sourceFieldKey);
        if (!upstreamField) return null;
        return {
          sourceFieldKey: field.sourceFieldKey,
          alias: field.alias ?? upstreamField.name,
          method: resolveMethod(upstreamField.type, field.method),
          type: upstreamField.type,
        } as GroupAggregateFieldItem;
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
    // TODO: 当前分组节点的上游字段列表通过 inputNodeMock 模拟接口返回，先满足配置/预览联调，后续应替换为真实字段血缘接口。
    const fields = await fetchGroupNodeUpstreamFields(nodeContext);
    // console.log('fields', fields);

    if (currentToken !== loadToken) return;
    upstreamFields.value = fields;
    loading.value = false;
    syncLocalState();
  };

  const buildOrderedKeys = (draftKeys: string[], currentKeys: string[]) => {
    const selectedKeySet = new Set(draftKeys);
    const orderedCurrentKeys = currentKeys.filter((key) =>
      selectedKeySet.has(key),
    );
    const appendedKeys = upstreamFields.value
      .map((field) => field.key)
      .filter(
        (key) => selectedKeySet.has(key) && !orderedCurrentKeys.includes(key),
      );
    return [...orderedCurrentKeys, ...appendedKeys];
  };

  const emitGroupFields = (fields: InputField[]) => {
    emit(
      "change-group-fields",
      fields.map((field) => field.key),
    );
  };

  const emitAggregateFields = (fields: GroupAggregateFieldItem[]) => {
    emit("change-aggregate-fields", fields);
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

  const openGroupSelector = () => {
    draftGroupKeys.value = localGroupFields.value.map((field) => field.key);
    groupSelectorOpen.value = true;
  };

  const openAggregateSelector = () => {
    draftAggregateKeys.value = localAggregateFields.value.map(
      (field) => field.sourceFieldKey,
    );
    aggregateSelectorOpen.value = true;
  };

  const pendingLocalChange = ref(false);

  const flushDraft = () => {
    if (!pendingLocalChange.value) return;
    pendingLocalChange.value = false;
    emitGroupFields(localGroupFields.value);
    emitAggregateFields(localAggregateFields.value);
  };

  const confirmGroupFields = () => {
    const orderedKeys = buildOrderedKeys(
      draftGroupKeys.value,
      localGroupFields.value.map((field) => field.key),
    );
    const upstreamMap = new Map(
      upstreamFields.value.map((field) => [field.key, field]),
    );
    const nextFields = orderedKeys
      .map((key) => upstreamMap.get(key))
      .filter((field): field is InputField => Boolean(field));
    localGroupFields.value = nextFields;
    pendingLocalChange.value = true;
    groupSelectorOpen.value = false;
  };

  const confirmAggregateFields = () => {
    const orderedKeys = buildOrderedKeys(
      draftAggregateKeys.value,
      localAggregateFields.value.map((field) => field.sourceFieldKey),
    );
    const upstreamMap = new Map(
      upstreamFields.value.map((field) => [field.key, field]),
    );
    const currentMap = new Map(
      localAggregateFields.value.map((field) => [field.sourceFieldKey, field]),
    );
    const nextFields = orderedKeys
      .map((key) => {
        const upstreamField = upstreamMap.get(key);
        if (!upstreamField) return null;
        const currentField = currentMap.get(key);
        return {
          sourceFieldKey: key,
          alias: currentField?.alias || upstreamField.name,
          method: resolveMethod(upstreamField.type, currentField?.method),
          type: upstreamField.type,
        } as GroupAggregateFieldItem;
      })
      .filter((field): field is GroupAggregateFieldItem => Boolean(field));
      console.log('nextFields',nextFields);
      
    localAggregateFields.value = nextFields;
    pendingLocalChange.value = true;
    aggregateSelectorOpen.value = false;
  };

  const removeGroupField = (fieldKey: string) => {
    const nextFields = localGroupFields.value.filter(
      (field) => field.key !== fieldKey,
    );
    localGroupFields.value = nextFields;
    pendingLocalChange.value = true;
  };

  const removeAggregateField = (fieldKey: string) => {
    const nextFields = localAggregateFields.value.filter(
      (field) => field.sourceFieldKey !== fieldKey,
    );
    localAggregateFields.value = nextFields;
    pendingLocalChange.value = true;
  };

  const handleGroupSortEnd = () => {
    pendingLocalChange.value = true;
  };

  const handleAggregateSortEnd = () => {
    pendingLocalChange.value = true;
  };

  const updateAggregateMethod = (
    fieldKey: string,
    value: GroupAggregateMethod,
  ) => {
    const targetField = localAggregateFields.value.find(
      (field) => field.sourceFieldKey === fieldKey,
    );
    if (!targetField) return;
    targetField.method = value;
    pendingLocalChange.value = true;
  };

  defineExpose({ flushDraft });
</script>

<style scoped lang="scss">
  @use "./config-section-shared.scss";

  .group-config {
    display: flex;
    flex: 1;
    gap: 8px;
    min-height: 0;
    padding: 4px 6px;
    overflow: hidden;
  }
</style>
