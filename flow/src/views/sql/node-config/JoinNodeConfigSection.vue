<template>
  <div class="config-section">
    <div class="join-config">
      <div class="join-config__left">
        <div class="config-panel config-panel--compact">
          <div class="config-section__header config-section__header--panel">
            <span>连接方式</span>
          </div>
          <div
            class="config-section__body config-section__body--panel join-type-list"
          >
            <div class="join-type-row">
              <button
                v-for="type in joinTypeOptions.slice(0, 2)"
                :key="type.value"
                type="button"
                class="join-type-btn"
                :class="{
                  'join-type-btn--active': localJoinType === type.value,
                }"
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
                :class="{
                  'join-type-btn--active': localJoinType === type.value,
                }"
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
          <div
            class="config-section__body config-section__body--panel join-source-form"
          >
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
            <span class="config-section__count"
              >{{ localConditions.length }} 个条件</span
            >
            <span
              class="config-section__link"
              :class="{
                'config-section__link--disabled': loading || !canAddCondition,
              }"
              @click="addCondition"
            >
              添加连接字段
            </span>
            <!-- <span
              v-if="localConditions.length > 0"
              class="config-section__link config-section__link--danger"
              @click="removeAll"
            >
              删除全部
            </span> -->
          </div>
        </div>

        <div class="config-section__body config-section__body--panel">
          <div v-if="loading" class="config-section__empty">字段加载中...</div>
          <div v-else-if="!hasBothSources" class="config-section__empty">
            请先设置左侧表单和右侧表单
          </div>
          <div
            v-else-if="leftFields.length === 0 || rightFields.length === 0"
            class="config-section__empty"
          >
            当前前序节点无可选字段
          </div>
          <div
            v-else-if="localConditions.length === 0"
            class="config-section__empty"
          >
            暂未添加连接字段
          </div>
          <div v-else class="join-conditions">
            <div
              v-for="(condition, index) in localConditions"
              :key="index"
              class="join-condition"
            >
              <a-select
                class="join-condition__field"
                placeholder="选择左侧字段"
                :value="condition.leftField"
                :options="leftFieldOptions"
                @change="
                  (value) => handleLeftFieldChange(index, value as string)
                "
              />
              <span class="join-condition__eq">=</span>
              <a-select
                class="join-condition__field"
                placeholder="选择右侧字段"
                :value="condition.rightField"
                :options="rightFieldOptions"
                @change="
                  (value) => handleRightFieldChange(index, value as string)
                "
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
  import { computed, inject, onMounted, onUnmounted, ref } from "vue";
  import { DeleteOutlined } from "@ant-design/icons-vue";
  import { sqlNodeContextKey, type GetNodeContext } from "../nodeContext";
  import {
    fetchJoinNodeUpstreamFields,
    type InputField,
    type JoinConditionPersisted,
    type JoinConfig,
    type JoinType,
    type JoinUpstreamForm,
  } from "../inputNodeMock";

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
  const upstreamForms = ref<JoinUpstreamForm[]>([]); // 后台接口返回的表单配置
  const localJoinType = ref<JoinType>(props.config.joinType);
  const localLeftNodeId = ref<string>(props.config.leftNodeId);
  const localRightNodeId = ref<string>(props.config.rightNodeId);
  const localConditions = ref<JoinConditionPersisted[]>([]);
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
    return upstreamForms.value.map((form) => ({
      label: form.name,
      value: form.id,
    }));
  });

  const leftFields = computed<InputField[]>(() => {
    return (
      upstreamForms.value.find((f) => f.id === localLeftNodeId.value)?.fields ||
      []
    );
  });

  const rightFields = computed<InputField[]>(() => {
    return (
      upstreamForms.value.find((f) => f.id === localRightNodeId.value)
        ?.fields || []
    );
  });

  const hasBothSources = computed(() => {
    return Boolean(localLeftNodeId.value) && Boolean(localRightNodeId.value);
  });

  const canAddCondition = computed(() => {
    return (
      hasBothSources.value &&
      leftFields.value.length > 0 &&
      rightFields.value.length > 0
    );
  });

  const leftFieldOptions = computed(() => {
    return leftFields.value.map((field) => ({
      label: `${field.name} (${field.key})`,
      value: field.key, // TODO 要看后台返回的结构
    }));
  });

  const rightFieldOptions = computed(() => {
    return rightFields.value.map((field) => ({
      label: `${field.name} (${field.key})`,
      value: field.key,
    }));
  });

  /**
   *  判断已有的配置是否陈腐的老旧的，需要抛弃了
   * 比如已经连好了前面的两个表单，也配好了这个节点，但又修改了边，或者修改了表单，这时候就很可能不能用之前的配置了
   */
  const isConfigStale = (): boolean => {
    const hasConfig =
      localJoinType.value !== "inner" ||
      localLeftNodeId.value ||
      localRightNodeId.value ||
      localConditions.value.length > 0;

    if (!hasConfig) return false;

    const validNodeIds = new Set(upstreamForms.value.map((o) => o.id));
    const validLeftFieldKeys = new Set(leftFields.value.map((f) => f.key));
    const validRightFieldKeys = new Set(rightFields.value.map((f) => f.key));

    const leftNodeValid =
      !localLeftNodeId.value || validNodeIds.has(localLeftNodeId.value);
    const rightNodeValid =
      !localRightNodeId.value || validNodeIds.has(localRightNodeId.value);
    const leftFieldsValid = localConditions.value.every(
      (c) => !c.leftField || validLeftFieldKeys.has(c.leftField),
    );
    const rightFieldsValid = localConditions.value.every(
      (c) => !c.rightField || validRightFieldKeys.has(c.rightField),
    );

    return !(
      leftNodeValid &&
      rightNodeValid &&
      leftFieldsValid &&
      rightFieldsValid
    );
  };

  const loadUpstreamFields = async () => {
    localJoinType.value = props.config.joinType;
    localLeftNodeId.value = props.config.leftNodeId;
    localRightNodeId.value = props.config.rightNodeId;
    localConditions.value = props.config.joinConditions;

    const nodeContext = getNodeContext?.(props.nodeId);
    if (!nodeContext) {
      upstreamForms.value = [];
      loading.value = false;
      return;
    }

    const currentToken = ++loadToken;
    loading.value = true;
    const result = await fetchJoinNodeUpstreamFields(nodeContext);
    if (currentToken !== loadToken) return;
    upstreamForms.value = result;
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
    // TODO 这里要看后台的实现，如果前序没配好，那返回的是啥？报错吗？
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

  onMounted(() => {
    console.log("onMoutned");

    void loadUpstreamFields();
  });

  onUnmounted(() => {
    console.log("11111 unmounted");
  });

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
    // 这里可以默认选择一项，也可以不选择
    const defaultLeft = leftFields.value[0]?.key || "";
    const defaultRight = rightFields.value[0]?.key || "";
    localConditions.value.push({ leftField: "", rightField: "" });
    pendingLocalChange.value = true;
  };

  const removeCondition = (index: number) => {
    const next = [...localConditions.value];
    next.splice(index, 1);
    localConditions.value = next;
    pendingLocalChange.value = true;
  };

  const handleLeftFieldChange = (index: number, value: string) => {
    localConditions.value[index].leftField = value;
    pendingLocalChange.value = true;
  };

  const handleRightFieldChange = (index: number, value: string) => {
    localConditions.value[index].rightField = value;
    pendingLocalChange.value = true;
  };

  const flushDraft = () => {
    if (!pendingLocalChange.value) return;
    pendingLocalChange.value = false;
    emit("change-config", {
      joinType: localJoinType.value,
      leftNodeId: localLeftNodeId.value, //TODO
      rightNodeId: localRightNodeId.value,
      joinConditions: localConditions.value,
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
