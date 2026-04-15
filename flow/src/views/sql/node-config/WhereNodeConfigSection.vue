<template>
  <div class="config-section">
    <div class="where-config">
      <div class="where-logic">
        <span class="where-logic__label">删选出满足</span>
        <button
          type="button"
          class="where-logic__btn"
          :class="{ 'where-logic__btn--active': localLogic === 'and' }"
          @click="setLogic('and')"
        >
          所有
        </button>
        <button
          type="button"
          class="where-logic__btn"
          :class="{ 'where-logic__btn--active': localLogic === 'or' }"
          @click="setLogic('or')"
        >
          任一
        </button>
        <span class="where-logic__label">条件的数据</span>
        <button
          type="button"
          class="where-logic__btn where-logic__btn--debug"
          @click="handleDebug"
        >
          调试
        </button>
      </div>

      <div class="config-section__header">
        <span>筛选条件</span>
        <div class="config-section__header-actions">
          <span class="config-section__count"
            >{{ localConditions.length }} 个条件</span
          >
          <span
            class="config-section__link"
            :class="{
              'config-section__link--disabled':
                loading || upstreamFields.length === 0,
            }"
            @click="addCondition"
          >
            添加筛选条件
          </span>
          <span
            v-if="localConditions.length > 0"
            class="config-section__link config-section__link--danger"
            @click="removeAll"
          >
            删除全部
          </span>
        </div>
      </div>

      <div class="config-section__body">
        <div v-if="loading" class="config-section__empty">字段加载中...</div>
        <div
          v-else-if="upstreamFields.length === 0"
          class="config-section__empty"
        >
          当前前序节点无可选字段
        </div>
        <div
          v-else-if="localConditions.length === 0"
          class="config-section__empty"
        >
          暂未添加筛选条件
        </div>
        <div v-else class="where-conditions">
          <div
            v-for="(condition, index) in localConditions"
            :key="condition.__id"
            class="where-condition"
          >
            <a-select
              class="where-condition__field"
              placeholder="选择字段"
              :value="condition.key"
              :options="fieldOptions"
              @change="(value) => handleFieldChange(index, value as string)"
            />
            <a-select
              class="where-condition__relation"
              placeholder="选择关系"
              :value="condition.relation"
              :options="getRelationOptions(condition.fieldType)"
              @change="
                (value) => handleRelationChange(index, value as WhereRelation)
              "
            />

            <template v-if="!isNoValueRelation(condition.relation)">
              <!-- Number range -->
              <template
                v-if="
                  isNumericFieldType(condition.fieldType) &&
                  condition.relation === 'range'
                "
              >
                <a-input-number
                  class="where-condition__range"
                  placeholder="最小值"
                  :value="
                    condition.rangeValue[0]
                      ? Number(condition.rangeValue[0])
                      : undefined
                  "
                  @change="
                    (value) =>
                      handleRangeChange(
                        index,
                        0,
                        value === null || value === undefined
                          ? ''
                          : String(value),
                      )
                  "
                />
                <span class="where-condition__range-sep">-</span>
                <a-input-number
                  class="where-condition__range"
                  placeholder="最大值"
                  :value="
                    condition.rangeValue[1]
                      ? Number(condition.rangeValue[1])
                      : undefined
                  "
                  @change="
                    (value) =>
                      handleRangeChange(
                        index,
                        1,
                        value === null || value === undefined
                          ? ''
                          : String(value),
                      )
                  "
                />
              </template>

              <!-- Date range -->
              <template
                v-else-if="
                  isDateTimeFieldType(condition.fieldType) &&
                  condition.relation === 'range'
                "
              >
                <a-date-picker
                  class="where-condition__date"
                  placeholder="开始日期时间"
                  :locale="locale"
                  show-time
                  format="YYYY-MM-DD HH:mm:ss"
                  :value="
                    condition.rangeValue[0]
                      ? dayjs(condition.rangeValue[0], 'YYYY-MM-DD HH:mm:ss')
                      : null
                  "
                  @change="
                    (_date: Dayjs | null, dateString: string) =>
                      handleRangeChange(index, 0, dateString)
                  "
                />
                <span class="where-condition__range-sep">-</span>
                <a-date-picker
                  class="where-condition__date"
                  placeholder="结束日期时间"
                  show-time
                  format="YYYY-MM-DD HH:mm:ss"
                  :value="
                    condition.rangeValue[1]
                      ? dayjs(condition.rangeValue[1], 'YYYY-MM-DD HH:mm:ss')
                      : null
                  "
                  @change="
                    (_date: Dayjs | null, dateString: string) =>
                      handleRangeChange(index, 1, dateString)
                  "
                />
              </template>

              <!-- Date single -->
              <template v-else-if="isDateTimeFieldType(condition.fieldType)">
                <a-date-picker
                  class="where-condition__value"
                  placeholder="选择日期时间"
                  show-time
                  format="YYYY-MM-DD HH:mm:ss"
                  :value="
                    condition.value
                      ? dayjs(condition.value, 'YYYY-MM-DD HH:mm:ss')
                      : null
                  "
                  @change="
                    (_date: Dayjs | null, dateString: string) =>
                      handleValueChange(index, dateString)
                  "
                />
              </template>

              <!-- in / notIn (any type) -->
              <template
                v-else-if="
                  condition.relation === 'in' || condition.relation === 'notIn'
                "
              >
                <WhereTagsInput
                  class="where-condition__value"
                  :model-value="condition.value"
                  @update:model-value="(value) => handleValueChange(index, value)"
                />
              </template>

              <!-- Number single -->
              <template v-else-if="isNumericFieldType(condition.fieldType)">
                <!-- !!! a-input-number 的change 事件是输入数字是才会触发，如果输入字母就不会触发 -->
                <a-input-number
                  class="where-condition__value"
                  placeholder="输入值"
                  :value="condition.value ? Number(condition.value) : undefined"
                  @change="
                    (value) =>
                      handleValueChange(
                        index,
                        value === null || value === undefined
                          ? ''
                          : String(value),
                      )
                  "
                />
              </template>

              <!-- Text / Other -->
              <template v-else>
                <a-input
                  class="where-condition__value"
                  placeholder="输入值"
                  :value="String(condition.value || '')"
                  @change="
                    (e: Event) =>
                      handleValueChange(
                        index,
                        (e.target as HTMLInputElement).value,
                      )
                  "
                />
              </template>
            </template>

            <span
              class="config-item__action config-item__action--danger"
              title="删除"
              @click="removeCondition(index)"
            >
              <DeleteOutlined class="config-item__action-icon" />
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, inject, onMounted, ref, watch } from "vue";
  import dayjs, { type Dayjs } from "dayjs";
  import { DeleteOutlined } from "@ant-design/icons-vue";
  import WhereTagsInput from "./wheretagsinput.vue";
  import { sqlNodeContextKey, type GetNodeContext } from "../nodeContext";
  import { fetchWhereNodeUpstreamFields } from "../inputNodeMock";
  import type {
    InputField,
    WhereConditionPersisted,
    WhereLogic,
    WhereRelation,
  } from "../types";
  import {
    isNumericFieldType,
    isDateTimeFieldType,
    getDefaultRelation,
    getRelationOptions,
    isNoValueRelation,
    type LocalWhereCondition,
    type SelectOption,
    buildDefaultCondition,
    generateId,
  } from "./where.helper";
  import locale from 'ant-design-vue/es/date-picker/locale/zh_CN';

  const emit = defineEmits<{
    (e: "change-logic", value: WhereLogic): void;
    (e: "change-conditions", value: WhereConditionPersisted[]): void;
  }>();

  const props = withDefaults(
    defineProps<{
      nodeId: string;
      whereLogic?: WhereLogic;
      whereConditions?: WhereConditionPersisted[];
    }>(),
    {
      whereLogic: "and",
      whereConditions: () => [],
    },
  );

  const getNodeContext = inject<GetNodeContext>(sqlNodeContextKey);
  const loading = ref(false);
  const upstreamFields = ref<InputField[]>([]);
  const localLogic = ref<WhereLogic>(props.whereLogic);
  const localConditions = ref<LocalWhereCondition[]>([]);
  let loadToken = 0;

  const pendingLocalChange = ref(false);

  const flushDraft = () => {
    if (!pendingLocalChange.value) return;
    pendingLocalChange.value = false;
    emit("change-logic", localLogic.value);
    emit("change-conditions", toPersistedConditions(localConditions.value));
  };

  const handleDebug = () => {
    console.log("调试数据筛选配置：", {
      whereLogic: localLogic.value,
      localConditions: localConditions.value,
      persistedConditions: toPersistedConditions(localConditions.value),
    });
  };

  const toPersistedConditions = (
    conditions: LocalWhereCondition[],
  ): WhereConditionPersisted[] => {
    return conditions.map((condition) => {
      const persisted: WhereConditionPersisted = {
        key: condition.key,
        relation: condition.relation,
      };
      if (!isNoValueRelation(condition.relation)) {
        if (condition.relation === "range") {
          persisted.value = [condition.rangeValue[0], condition.rangeValue[1]];
        } else {
          persisted.value = condition.value;
        }
      }
      return persisted;
    });
  };

  const buildLocalCondition = (
    item: WhereConditionPersisted,
    fields: InputField[],
    existingId?: string,
  ): LocalWhereCondition => {
    const fieldMap = new Map(fields.map((field) => [field.key, field]));
    const field = fieldMap.get(item.key);
    const rangeValue: [string, string] =
      item.relation === "range" &&
      Array.isArray(item.value) &&
      item.value.length === 2
        ? [String(item.value[0] || ""), String(item.value[1] || "")]
        : ["", ""];
    return {
      __id: existingId || generateId(),
      key: item.key,
      fieldName: field?.name || item.key,
      fieldType: field?.type || "varchar",
      relation: item.relation,
      value: item.relation === "range" ? "" : String(item.value ?? ""),
      rangeValue,
    };
  };

  const conditionDataEqual = (
    a: LocalWhereCondition,
    b: LocalWhereCondition,
  ): boolean => {
    return (
      a.key === b.key &&
      a.relation === b.relation &&
      a.value === b.value &&
      a.rangeValue[0] === b.rangeValue[0] &&
      a.rangeValue[1] === b.rangeValue[1]
    );
  };

  const syncLocalConditions = () => {
    const current = localConditions.value;
    const persisted = props.whereConditions;

    // 如果长度和内容都相同，直接保留现有数组（避免不必要的重新渲染）
    if (
      current.length === persisted.length &&
      persisted.every((item, index) => {
        const next = buildLocalCondition(item, upstreamFields.value);
        return conditionDataEqual(current[index], next);
      })
    ) {
      return;
    }

    localConditions.value = persisted.map((item, index) =>
      buildLocalCondition(item, upstreamFields.value, current[index]?.__id),
    );
  };

  const loadUpstreamFields = async () => {
    const nodeContext = getNodeContext?.(props.nodeId);
    if (!nodeContext) {
      upstreamFields.value = [];
      localConditions.value = [];
      loading.value = false;
      return;
    }

    const currentToken = ++loadToken;
    loading.value = true;
    const fields = await fetchWhereNodeUpstreamFields(nodeContext);
    if (currentToken !== loadToken) return;
    upstreamFields.value = fields;
    loading.value = false;
    syncLocalConditions();
  };

  onMounted(() => {
    void loadUpstreamFields();
  });

  watch(
    () => [props.whereConditions, props.whereLogic],
    () => {
      console.log("--whereConditions--whereLogic");

      localLogic.value = props.whereLogic ?? "and";
      syncLocalConditions();
    },
    { deep: true },
  );

  const fieldOptions = computed<SelectOption[]>(() => {
    return upstreamFields.value.map((field) => ({
      label: `${field.name} (${field.key})`,
      value: field.key,
    }));
  });

  const setLogic = (logic: WhereLogic) => {
    if (localLogic.value === logic) return;
    localLogic.value = logic;
    pendingLocalChange.value = true;
  };

  const addCondition = () => {
    const defaultCondition = buildDefaultCondition(upstreamFields.value);
    if (!defaultCondition) return;
    localConditions.value = [...localConditions.value, defaultCondition];
    pendingLocalChange.value = true;
  };

  const removeCondition = (index: number) => {
    const next = [...localConditions.value];
    next.splice(index, 1);
    localConditions.value = next;
    pendingLocalChange.value = true;
  };

  const removeAll = () => {
    localConditions.value = [];
    pendingLocalChange.value = true;
  };

  const handleFieldChange = (index: number, key: string) => {
    const field = upstreamFields.value.find((f) => f.key === key);
    if (!field) return;
    const next = [...localConditions.value];
    const oldCondition = next[index];
    const newRelation = getDefaultRelation(field.type);
    next[index] = {
      ...oldCondition,
      key: field.key,
      fieldName: field.name,
      fieldType: field.type,
      relation: newRelation,
      value: "",
      rangeValue: ["", ""],
    };
    localConditions.value = next;
    pendingLocalChange.value = true;
  };

  const handleRelationChange = (index: number, relation: WhereRelation) => {
    const next = [...localConditions.value];
    next[index] = {
      ...next[index],
      relation,
      value: "",
      rangeValue: ["", ""],
    };
    localConditions.value = next;
    pendingLocalChange.value = true;
  };

  const handleValueChange = (index: number, value: string) => {
    console.log('handleValueChange', value);
    const next = [...localConditions.value];
    next[index] = { ...next[index], value };
    localConditions.value = next;
    pendingLocalChange.value = true;
  };

  const handleRangeChange = (
    index: number,
    rangeIndex: 0 | 1,
    value: string,
  ) => {
    const next = [...localConditions.value];
    const nextRange: [string, string] = [...next[index].rangeValue] as [
      string,
      string,
    ];
    nextRange[rangeIndex] = value;
    next[index] = { ...next[index], rangeValue: nextRange };
    localConditions.value = next;
    pendingLocalChange.value = true;
  };

  defineExpose({ flushDraft });
</script>

<style scoped lang="scss">
  @use "./config-section-shared.scss";

  .where-config {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }

  .where-logic {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 6px 8px;
    flex-shrink: 0;
  }

  .where-logic__label {
    font-size: 12px;
    font-weight: 600;
    color: #334155;
  }

  .where-logic__btn {
    height: 24px;
    padding: 0 10px;
    border: 1px solid #dbe2ea;
    border-radius: 999px;
    background: #f8fafc;
    color: #64748b;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .where-logic__btn--active {
    border-color: #7dd3fc;
    background: #e0f2fe;
    color: #0369a1;
  }

  .where-logic__btn--debug {
    border-color: #fbbf24;
    background: #fef9c3;
    color: #92400e;
  }

  .where-conditions {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .where-condition {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    background: linear-gradient(180deg, #fff 0%, #f8fafc 100%);
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
  }

  .where-condition__field,
  .where-condition__relation {
    width: 220px;
    flex-shrink: 0;
  }

  .where-condition__value {
    flex: 1;
    min-width: 200px;
  }

  .where-condition__range {
    width: 200px;
    flex-shrink: 0;
  }

  .where-condition__date {
    width: 200px;
    flex-shrink: 0;
  }

  .where-condition__range-sep {
    flex-shrink: 0;
    color: #94a3b8;
    font-size: 12px;
  }

  .config-section__link--danger {
    color: #ef4444;

    &:hover {
      color: #dc2626;
    }
  }

  .config-section__header {
    justify-content: flex-start !important;
    gap: 20px !important;
  }


</style>
