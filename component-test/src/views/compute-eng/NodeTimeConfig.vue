<template>
  <div class="config-section">
    <div class="section-title">定时配置</div>

    <div class="info-row">
      <span class="label">定时作用域</span>
      <a-select
        :value="timeConfig.scope"
        :options="timerScopeOptions"
        placeholder="请选择定时作用域"
        size="small"
        class="field-control"
        @update:value="updateTimeConfig({ scope: $event })"
      />
    </div>

    <div class="info-row">
      <span class="label">定时间隔</span>
      <a-input-group compact class="interval-control">
        <a-input-number
          :value="timeConfig.interval.value"
          placeholder="请输入定时间隔"
          size="small"
          class="interval-value"
          :min="0"
          :controls="false"
          @update:value="updateInterval({ value: $event })"
        />
        <a-select
          :value="timeConfig.interval.unit"
          :options="timerUnitOptions"
          size="small"
          class="interval-unit"
          @update:value="updateInterval({ unit: $event })"
        />
      </a-input-group>
    </div>

    <div class="info-row">
      <span class="label">最多次数</span>
      <a-input-number
        :value="timeConfig.maxTimes"
        placeholder="请输入最多次数"
        size="small"
        class="field-control"
        :min="0"
        :controls="false"
        :precision="0"
        @update:value="updateTimeConfig({ maxTimes: $event })"
      />
    </div>

    <div class="info-row">
      <span class="label">定时并发策略</span>
      <a-select
        :value="timeConfig.concurrencyPolicy"
        :options="concurrencyPolicyOptions"
        placeholder="请选择并发策略"
        size="small"
        class="field-control"
        allowClear
        @update:value="updateTimeConfig({ concurrencyPolicy: $event })"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from "vue";
  import {
    concurrencyPolicyOptions,
    defaultTimeConfig,
    NodeTimeConfig,
    TimeIntervalConfig,
    timerScopeOptions,
    timerUnitOptions,
  } from "./symbols";


  //TODO 除了定时并发策略可以不选 其他3个都需要
  const props = defineProps<{
    modelValue?: Partial<NodeTimeConfig>;
  }>();

  const emit = defineEmits<{
    (e: "update:modelValue", value: NodeTimeConfig): void;
  }>();

  const normalizeTimeConfig = (
    value?: Partial<NodeTimeConfig>,
  ): NodeTimeConfig => {
    const defaultConfig = defaultTimeConfig();

    return {
      ...defaultConfig,
      ...value,
      interval: {
        ...defaultConfig.interval,
        ...value?.interval,
      },
    };
  };

  const timeConfig = computed(() => normalizeTimeConfig(props.modelValue));

  const updateTimeConfig = (part: Partial<NodeTimeConfig>) => {
    emit(
      "update:modelValue",
      normalizeTimeConfig({
        ...timeConfig.value,
        ...part,
      }),
    );
  };

  const updateInterval = (part: Partial<TimeIntervalConfig>) => {
    updateTimeConfig({
      interval: {
        ...timeConfig.value.interval,
        ...part,
      },
    });
  };
</script>

<style scoped lang="scss">
  .config-section {
    margin-top: 16px;
    padding: 12px;
    background: #f5f5f5;
    border-radius: 6px;

    .section-title {
      font-size: 13px;
      font-weight: 600;
      color: #262626;
      margin-bottom: 10px;
      padding-bottom: 8px;
      border-bottom: 1px solid #e8e8e8;
    }
  }

  .info-row {
    display: flex;
    align-items: center;
    margin-bottom: 6px;
    font-size: 14px;
    min-height: 24px;
  }

  .label {
    color: #666;
    flex-shrink: 0;
    margin-right: 8px;
    width: 120px;
  }

  .field-control,
  .interval-control {
    flex: 1;
    min-width: 0;
  }

  .interval-control {
    display: flex;
  }

  .interval-value {
    flex: 1;
    min-width: 0;
  }

  .interval-unit {
    width: 92px;
  }
</style>
