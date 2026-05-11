<template>
  <div class="cond-item">
    <select v-model="model.field" class="select select-field" @change="onFieldChange">
      <option v-for="f in fields" :key="f.key" :value="f.key">{{ f.label }}</option>
    </select>

    <select v-model="model.operator" class="select select-op">
      <option v-for="op in operators" :key="op.value" :value="op.value">{{ op.label }}</option>
    </select>

    <template v-if="!currentOp?.noValue">
      <select
        v-if="fieldDef?.type === 'enum'"
        v-model="model.value"
        class="select select-val"
      >
        <option v-for="o in fieldDef.enumOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
      </select>
      <input
        v-else-if="fieldDef?.type === 'number'"
        v-model.number="numberValue"
        type="number"
        class="input input-val"
        placeholder="数值"
      />
      <label v-else-if="fieldDef?.type === 'boolean'" class="bool-wrapper">
        <input v-model="booleanValue" type="checkbox" class="input-check" />
        <span>{{ booleanValue ? '真' : '假' }}</span>
      </label>
      <input
        v-else-if="fieldDef?.type === 'date'"
        v-model="stringValue"
        type="date"
        class="input input-val"
      />
      <input
        v-else
        v-model="stringValue"
        type="text"
        class="input input-val"
        placeholder="输入值"
      />
    </template>
    <span v-else class="no-value">—</span>

    <button class="del-btn" title="删除条件" @click="emit('remove')">
      <svg viewBox="0 0 24 24" width="14" height="14">
        <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Condition, FieldOption } from './types'
import { OPERATORS_BY_TYPE, defaultValueFor } from './types'

const model = defineModel<Condition>({ required: true })

const props = defineProps<{
  fields: FieldOption[]
}>()

const emit = defineEmits<{
  remove: []
}>()

const fieldDef = computed(() => props.fields.find(f => f.key === model.value.field))
const operators = computed(() => (fieldDef.value ? OPERATORS_BY_TYPE[fieldDef.value.type] : []))
const currentOp = computed(() => operators.value.find(o => o.value === model.value.operator))

// 让 v-model 在不同输入类型间共用 model.value，TS 类型分离
const stringValue = computed<string>({
  get: () => (model.value.value as string) ?? '',
  set: v => { model.value.value = v },
})
const numberValue = computed<number>({
  get: () => (model.value.value as number) ?? 0,
  set: v => { model.value.value = v },
})
const booleanValue = computed<boolean>({
  get: () => Boolean(model.value.value),
  set: v => { model.value.value = v },
})

function onFieldChange() {
  if (!fieldDef.value) return
  const ops = OPERATORS_BY_TYPE[fieldDef.value.type]
  model.value.operator = ops[0].value
  model.value.value = defaultValueFor(fieldDef.value)
}
</script>

<style scoped>
.cond-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.cond-item:hover {
  border-color: #c7d0ff;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.08);
}

.select,
.input {
  height: 32px;
  padding: 0 10px;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  background: #fff;
  font-size: 13px;
  color: #303133;
  outline: none;
  transition: border-color 0.15s;
}

.select {
  cursor: pointer;
  padding-right: 24px;
  appearance: none;
  background-image: linear-gradient(45deg, transparent 50%, #909399 50%),
    linear-gradient(135deg, #909399 50%, transparent 50%);
  background-position: calc(100% - 12px) 14px, calc(100% - 8px) 14px;
  background-size: 4px 4px;
  background-repeat: no-repeat;
}

.select:focus,
.input:focus {
  border-color: #667eea;
}

.select-field {
  min-width: 110px;
  font-weight: 500;
}

.select-op {
  min-width: 90px;
  color: #667eea;
  font-weight: 500;
}

.select-val,
.input-val {
  min-width: 140px;
  flex: 1;
}

.bool-wrapper {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 10px;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  font-size: 13px;
  color: #303133;
  cursor: pointer;
  user-select: none;
}

.input-check {
  width: 14px;
  height: 14px;
  margin: 0;
  accent-color: #667eea;
  cursor: pointer;
}

.no-value {
  flex: 1;
  font-size: 13px;
  color: #c0c4cc;
  padding: 0 10px;
}

.del-btn {
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  color: #c0c4cc;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.del-btn:hover {
  background: #fff1f0;
  color: #ff4d4f;
}
</style>
