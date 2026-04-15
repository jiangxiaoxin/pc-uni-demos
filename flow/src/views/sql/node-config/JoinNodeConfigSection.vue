<template>
  <div class="config-section">
    <div class="join-config">
      <div class="join-config__left">
        <div class="config-panel config-panel--compact">
          <div class="config-section__header config-section__header--panel">
            <span>连接方式</span>
          </div>
          <div class="config-section__body config-section__body--panel join-type-list">
            <div class="join-type-row">
              <button
                v-for="type in joinTypeOptions.slice(0, 2)"
                :key="type.value"
                type="button"
                class="join-type-btn"
                :class="{ 'join-type-btn--active': localJoinType === type.value }"
                @click="setJoinType(type.value)"
              >
                {{ type.label }}
              </button>
            </div>
            <div class="join-type-row">
              <button
                v-for="type in joinTypeOptions.slice(2, 4)"
                :key="type.value"
                type="button"
                class="join-type-btn"
                :class="{ 'join-type-btn--active': localJoinType === type.value }"
                @click="setJoinType(type.value)"
              >
                {{ type.label }}
              </button>
            </div>
          </div>
        </div>

        <div class="config-panel config-panel--compact">
          <div class="config-section__header config-section__header--panel">
            <span>表单设置</span>
          </div>
          <div class="config-section__body config-section__body--panel join-source-form">
            <div class="join-source-row">
              <span class="join-source-label">左侧表单</span>
              <a-select
                class="join-source-select"
                placeholder="选择左侧表单"
                :value="localLeftNodeId"
                :options="predecessorOptions"
                @change="(value) => setLeftNodeId(value as string)"
              />
            </div>
            <div class="join-source-row">
              <span class="join-source-label">右侧表单</span>
              <a-select
                class="join-source-select"
                placeholder="选择右侧表单"
                :value="localRightNodeId"
                :options="predecessorOptions"
                @change="(value) => setRightNodeId(value as string)"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="config-panel join-config__right">
        <div class="config-section__header config-section__header--panel">
          <span>连接字段</span>
          <div class="config-section__header-actions">
            <span class="config-section__count">{{ localConditions.length }} 个条件</span>
            <span
              class="config-section__link"
              :class="{ 'config-section__link--disabled': loading || !canAddCondition }"
              @click="addCondition"
            >
              添加连接字段
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

        <div class="config-section__body config-section__body--panel">
          <div v-if="loading" class="config-section__empty">字段加载中...</div>
          <div v-else-if="!hasBothSources" class="config-section__empty">
            请先设置左侧表单和右侧表单
          </div>
          <div v-else-if="leftFields.length === 0 || rightFields.length === 0" class="config-section__empty">
            当前前序节点无可选字段
          </div>
          <div v-else-if="localConditions.length === 0" class="config-section__empty">
            暂未添加连接字段
          </div>
          <div v-else class="join-conditions">
            <div
              v-for="(condition, index) in localConditions"
              :key="condition.__id"
              class="join-condition"
            >
              <a-select
                class="join-condition__field"
                placeholder="选择左侧字段"
                :value="condition.leftField"
                :options="leftFieldOptions"
                @change="(value) => handleLeftFieldChange(index, value as string)"
              />
              <span class="join-condition__eq">=</span>
              <a-select
                class="join-condition__field"
                placeholder="选择右侧字段"
                :value="condition.rightField"
                :options="rightFieldOptions"
                @change="(value) => handleRightFieldChange(index, value as string)"
              />
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
  </div>
</template>

<script setup lang="ts">
  import { computed, inject, onMounted, ref, watch } from "vue";
  import { DeleteOutlined } from "@ant-design/icons-vue";
  import { sqlNodeContextKey, type GetNodeContext } from "../nodeContext";
  import {
    fetchJoinNodeUpstreamFields,
    type InputField,
    type JoinConditionPersisted,
    type JoinConfig,
    type JoinType,
  } from "../inputNodeMock";

  interface JoinConditionLocal {
    __id: string;
    leftField: string;
    rightField: string;
  }

  const emit = defineEmits<{
    (e: "change-config", value: JoinConfig): void;
  }>();

  const props = withDefaults(
    defineProps<{
      nodeId: string;
      config?: JoinConfig;
    }>(),
    {
      config: () => ({
        joinType: "inner",
        leftNodeId: "",
        rightNodeId: "",
        joinConditions: [],
      }),
    },
  );

  const getNodeContext = inject<GetNodeContext>(sqlNodeContextKey);
  const loading = ref(false);
  const leftFields = ref<InputField[]>([]);
  const rightFields = ref<InputField[]>([]);
  const localJoinType = ref<JoinType>(props.config.joinType);
  const localLeftNodeId = ref<string>(props.config.leftNodeId);
  const localRightNodeId = ref<string>(props.config.rightNodeId);
  const localConditions = ref<JoinConditionLocal[]>([]);
  const pendingLocalChange = ref(false); // 本地配置是否有发生变化，用于判断是否需要跟外层同步数据
  let loadToken = 0;

  const joinTypeOptions: { label: string; value: JoinType }[] = [
    { label: "内连接", value: "inner" },
    { label: "外连接", value: "outer" },
    { label: "左连接", value: "left" },
    { label: "右连接", value: "right" },
  ];

  /**
   * 表单设置的选项。显示前置两个节点的节点名。前面这两个节点名用户可以自己修改
   */
  const predecessorOptions = computed(() => {
    const nodeContext = getNodeContext?.(props.nodeId);
    const fromIds = nodeContext?.currentNode?.fromIds || [];
    return fromIds
      .map((id) => {
        const node = nodeContext?.upstreamNodes.find((n) => n.id === id);
        if (!node) return null;
        return {
          label: String(node.properties?.title || node.properties?.name || node.id),
          value: node.id,
        };
      })
      .filter((item): item is NonNullable<typeof item> => Boolean(item));
  });

  const hasBothSources = computed(() => {
    return Boolean(localLeftNodeId.value) && Boolean(localRightNodeId.value);
  });

  const canAddCondition = computed(() => {
    return hasBothSources.value && leftFields.value.length > 0 && rightFields.value.length > 0;
  });

  const leftFieldOptions = computed(() => {
    return leftFields.value.map((field) => ({
      label: `${field.name} (${field.key})`,
      value: field.key,
    }));
  });

  const rightFieldOptions = computed(() => {
    return rightFields.value.map((field) => ({
      label: `${field.name} (${field.key})`,
      value: field.key,
    }));
  });

  const generateId = () => `join_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  const toPersistedConditions = (conditions: JoinConditionLocal[]): JoinConditionPersisted[] => {
    return conditions.map((c) => ({
      leftField: c.leftField,
      rightField: c.rightField,
    }));
  };

  const buildLocalCondition = (
    item: JoinConditionPersisted,
    existingId?: string,
  ): JoinConditionLocal => {
    return {
      __id: existingId || generateId(),
      leftField: item.leftField || "",
      rightField: item.rightField || "",
    };
  };

  const syncLocalConditions = () => {
    const current = localConditions.value;
    const persisted = props.config.joinConditions;

    if (
      current.length === persisted.length &&
      persisted.every((item, index) => {
        const next = buildLocalCondition(item);
        return (
          current[index].leftField === next.leftField &&
          current[index].rightField === next.rightField
        );
      })
    ) {
      return;
    }

    localConditions.value = persisted.map((item, index) =>
      buildLocalCondition(item, current[index]?.__id),
    );
  };

  /**
   *  判断已有的配置是否陈腐的老旧的，需要抛弃了
   */
  const isConfigStale = (): boolean => {
    const hasConfig =
      localJoinType.value !== "inner" ||
      localLeftNodeId.value ||
      localRightNodeId.value ||
      localConditions.value.length > 0;

    if (!hasConfig) return false;

    const validNodeIds = new Set(predecessorOptions.value.map((o) => o.value));
    const validLeftFieldKeys = new Set(leftFields.value.map((f) => f.key));
    const validRightFieldKeys = new Set(rightFields.value.map((f) => f.key));

    const leftNodeValid = !localLeftNodeId.value || validNodeIds.has(localLeftNodeId.value);
    const rightNodeValid = !localRightNodeId.value || validNodeIds.has(localRightNodeId.value);
    const leftFieldsValid = localConditions.value.every(
      (c) => !c.leftField || validLeftFieldKeys.has(c.leftField),
    );
    const rightFieldsValid = localConditions.value.every(
      (c) => !c.rightField || validRightFieldKeys.has(c.rightField),
    );

    return !(leftNodeValid && rightNodeValid && leftFieldsValid && rightFieldsValid);
  };

  const loadUpstreamFields = async () => {
    const nodeContext = getNodeContext?.(props.nodeId);
    if (!nodeContext) {
      leftFields.value = [];
      rightFields.value = [];
      loading.value = false;
      return;
    }

    const currentToken = ++loadToken;
    loading.value = true;
    const result = await fetchJoinNodeUpstreamFields(
      nodeContext,
      localLeftNodeId.value,
      localRightNodeId.value,
    );
    if (currentToken !== loadToken) return;
    leftFields.value = result.left;
    rightFields.value = result.right;
    loading.value = false;

    // 如果已有配置与接口返回的表单/字段不一致，清空配置重新走配置流程
    if (isConfigStale()) {
      localJoinType.value = "inner";
      localLeftNodeId.value = "";
      localRightNodeId.value = "";
      localConditions.value = [];
      pendingLocalChange.value = true;
    }

    // 如果还没有设置左右节点，尝试用前序节点自动填充
    const fromIds = nodeContext.currentNode?.fromIds || [];
    let autoChanged = false;
    if (!localLeftNodeId.value && fromIds[0]) {
      localLeftNodeId.value = fromIds[0];
      autoChanged = true;
    }
    if (!localRightNodeId.value && fromIds[1]) {
      localRightNodeId.value = fromIds[1];
      autoChanged = true;
    }
    if (autoChanged) {
      pendingLocalChange.value = true;
    }
  };

  // 当左右节点选择发生变化时，重新加载对应的字段列表
  watch(
    () => [localLeftNodeId.value, localRightNodeId.value],
    () => {
      console.log('localLeftNodeId localRightNodeId 变了');
      
      void loadUpstreamFields();
    },
  );

  onMounted(() => {
    void loadUpstreamFields();
  });

  watch(
    () => props.config,
    () => {
      console.log('==config 变了');
      
      localJoinType.value = props.config.joinType;
      localLeftNodeId.value = props.config.leftNodeId;
      localRightNodeId.value = props.config.rightNodeId;
      syncLocalConditions();
    },
    { deep: true, immediate: true },
  );

  const setJoinType = (type: JoinType) => {
    if (localJoinType.value === type) return;
    localJoinType.value = type;
    pendingLocalChange.value = true;
  };

  const setLeftNodeId = (nodeId: string) => {
    if (localLeftNodeId.value === nodeId) return;
    localLeftNodeId.value = nodeId;
    localConditions.value = [];
    pendingLocalChange.value = true;
  };

  const setRightNodeId = (nodeId: string) => {
    if (localRightNodeId.value === nodeId) return;
    localRightNodeId.value = nodeId;
    localConditions.value = [];
    pendingLocalChange.value = true;
  };

  const addCondition = () => {
    if (!canAddCondition.value) return;
    const defaultLeft = leftFields.value[0]?.key || "";
    const defaultRight = rightFields.value[0]?.key || "";
    localConditions.value = [
      ...localConditions.value,
      { __id: generateId(), leftField: defaultLeft, rightField: defaultRight },
    ];
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

  const handleLeftFieldChange = (index: number, value: string) => {
    const next = [...localConditions.value];
    next[index] = { ...next[index], leftField: value };
    localConditions.value = next;
    pendingLocalChange.value = true;
  };

  const handleRightFieldChange = (index: number, value: string) => {
    const next = [...localConditions.value];
    next[index] = { ...next[index], rightField: value };
    localConditions.value = next;
    pendingLocalChange.value = true;
  };

  const flushDraft = () => {
    if (!pendingLocalChange.value) return;
    pendingLocalChange.value = false;
    emit("change-config", {
      joinType: localJoinType.value,
      leftNodeId: localLeftNodeId.value,
      rightNodeId: localRightNodeId.value,
      joinConditions: toPersistedConditions(localConditions.value),
    });
  };

  defineExpose({ flushDraft });
</script>

<style scoped lang="scss">
  @use "./config-section-shared.scss";

  .join-config {
    display: flex;
    flex: 1;
    gap: 6px;
    min-height: 0;
    padding: 2px 4px;
    overflow: hidden;
  }

  .join-config__left {
    display: flex;
    flex-direction: column;
    gap: 6px;
    width: 320px;
    flex-shrink: 0;
  }

  .join-config__right {
    flex: 1;
    min-width: 0;
  }

  .config-panel--compact {
    flex: 1 1 auto; // auto 先算已有空间，再平分剩余空间 // flex: 1 1 0; 直接平分空间
  }

  .join-type-list {
    display: flex;
    flex-direction: column;
    flex: 1;
    gap: 4px;
  }

  .join-type-row {
    display: flex;
    flex: 1;
    gap: 4px;
  }

  .join-type-btn {
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: center;
    min-width: 0;
    height: auto;
    padding: 0 4px;
    border: 1px solid #dbe2ea;
    border-radius: 6px;
    background: #f8fafc;
    color: #64748b;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      border-color: #7dd3fc;
      background: #f0f9ff;
    }
  }

  .join-type-btn--active {
    border-color: #7dd3fc;
    background: #e0f2fe;
    color: #0369a1;
    font-weight: 600;
  }

  .join-source-form {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .join-source-row {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .join-source-label {
    font-size: 12px;
    font-weight: 600;
    color: #334155;
    margin-bottom: 6px;
  }

  .join-source-select {
    width: 100%;
  }

  .join-conditions {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .join-condition {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    background: linear-gradient(180deg, #fff 0%, #f8fafc 100%);
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
  }

  .join-condition__field {
    flex: 1;
    min-width: 0;
  }

  .join-condition__eq {
    flex-shrink: 0;
    color: #64748b;
    font-size: 12px;
    font-weight: 600;
  }
</style>
