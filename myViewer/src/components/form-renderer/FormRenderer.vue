<template>
  <view class="form-renderer">
    <!-- 表单标题 -->
    <view v-if="schema.title" class="form-title">
      <text class="title-text">{{ schema.title }}</text>
    </view>
    
    <!-- 表单描述 -->
    <view v-if="schema.description" class="form-description">
      <text class="description-text">{{ schema.description }}</text>
    </view>

    <!-- 表单主体 -->
    <u-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      :label-position="layoutConfig.labelPosition"
      :label-width="layoutConfig.labelWidth"
      :border-bottom="layoutConfig.borderBottom"
      :error-type="layoutConfig.errorType"
      class="form-content"
    >
      <template v-for="field in schema.fields" :key="field.prop">
        <u-form-item
          :prop="field.prop"
          :label="field.label"
          :required="field.required"
          :label-position="field.labelPosition"
          :label-width="field.labelWidth"
          :border-bottom="field.props?.borderBottom !== false"
          class="form-item"
        >
          <!-- Input 输入框 -->
          <template v-if="field.type === 'input' || field.type === 'password' || field.type === 'number'">
            <u-input
              v-model="formData[field.prop]"
              :type="getInputType(field.type)"
              :placeholder="field.placeholder || `请输入${field.label}`"
              :disabled="isFieldDisabled(field)"
              :readonly="isFieldReadonly(field)"
              :clearable="field.props?.clearable !== false"
              :maxlength="field.props?.maxlength"
              :prefix-icon="field.props?.prefixIcon"
              :suffix-icon="field.props?.suffixIcon"
              @blur="handleFieldBlur(field)"
              @change="handleFieldChange(field)"
            />
          </template>

          <!-- Textarea 多行文本 -->
          <template v-else-if="field.type === 'textarea'">
            <u-textarea
              v-model="formData[field.prop]"
              :placeholder="field.placeholder || `请输入${field.label}`"
              :disabled="isFieldDisabled(field)"
              :readonly="isFieldReadonly(field)"
              :height="field.props?.height || 120"
              :count="field.props?.count !== false"
              :maxlength="field.props?.maxlength || 200"
              :auto-height="field.props?.autoHeight"
              @blur="handleFieldBlur(field)"
              @change="handleFieldChange(field)"
            />
          </template>

          <!-- Select 下拉选择 -->
          <template v-else-if="field.type === 'select'">
            <u-picker
              :show="pickerState[field.prop]"
              :columns="[field.options?.map(opt => opt.label) || []]"
              :default-index="[getDefaultPickerIndex(field)]"
              @confirm="(e: any) => handlePickerConfirm(field, e)"
              @cancel="pickerState[field.prop] = false"
            />
            <u-input
              v-model="displayValues[field.prop]"
              :placeholder="field.placeholder || `请选择${field.label}`"
              :disabled="isFieldDisabled(field)"
              readonly
              suffix-icon="arrow-down"
              @click="openPicker(field)"
            />
          </template>

          <!-- Radio 单选框 -->
          <template v-else-if="field.type === 'radio'">
            <u-radio-group
              v-model="formData[field.prop]"
              :disabled="isFieldDisabled(field)"
              :placement="field.props?.placement || 'row'"
              @change="(val: any) => handleRadioChange(field, val)"
            >
              <u-radio
                v-for="option in field.options"
                :key="String(option.value)"
                :label="option.label"
                :name="option.value"
                :disabled="option.disabled"
              />
            </u-radio-group>
          </template>

          <!-- Checkbox 复选框 -->
          <template v-else-if="field.type === 'checkbox'">
            <u-checkbox-group
              v-model="formData[field.prop]"
              :disabled="isFieldDisabled(field)"
              :placement="field.props?.placement || 'row'"
              @change="(val: any) => handleCheckboxChange(field, val)"
            >
              <u-checkbox
                v-for="option in field.options"
                :key="String(option.value)"
                :label="option.label"
                :name="option.value"
                :disabled="option.disabled"
              />
            </u-checkbox-group>
          </template>

          <!-- Switch 开关 -->
          <template v-else-if="field.type === 'switch'">
            <u-switch
              v-model="formData[field.prop]"
              :disabled="isFieldDisabled(field)"
              :active-color="field.props?.activeColor || '#2979ff'"
              :inactive-color="field.props?.inactiveColor || '#ffffff'"
              :active-value="field.props?.activeValue ?? true"
              :inactive-value="field.props?.inactiveValue ?? false"
              @change="(val: any) => handleSwitchChange(field, val)"
            />
          </template>

          <!-- Date 日期选择 -->
          <template v-else-if="field.type === 'date' || field.type === 'datetime' || field.type === 'time'">
            <u-picker
              v-model="datePickerState[field.prop]"
              mode="time"
              :params="getDatePickerParams(field.type)"
              :default-time="formData[field.prop] || getDefaultTime(field.type)"
              :start-year="field.props?.startYear || 1950"
              :end-year="field.props?.endYear || 2050"
              :show-time-tag="true"
              @confirm="(e: any) => handleDateConfirm(field, e)"
              @cancel="datePickerState[field.prop] = false"
            />
            <u-input
              v-model="displayValues[field.prop]"
              :placeholder="field.placeholder || `请选择${field.label}`"
              :disabled="isFieldDisabled(field)"
              readonly
              suffix-icon="calendar"
              @click="openDatePicker(field)"
            />
          </template>

          <!-- Rate 评分 -->
          <template v-else-if="field.type === 'rate'">
            <u-rate
              v-model="formData[field.prop]"
              :disabled="isFieldDisabled(field)"
              :count="field.props?.count || 5"
              :active-color="field.props?.activeColor || '#f7ba2a'"
              :inactive-color="field.props?.inactiveColor || '#c6d1de'"
              :allow-half="field.props?.allowHalf"
              @change="(val: any) => handleRateChange(field, val)"
            />
          </template>

          <!-- Slider 滑块 -->
          <template v-else-if="field.type === 'slider'">
            <u-slider
              v-model="formData[field.prop]"
              :disabled="isFieldDisabled(field)"
              :min="field.props?.min ?? 0"
              :max="field.props?.max ?? 100"
              :step="field.props?.step ?? 1"
              :show-value="field.props?.showValue !== false"
              :active-color="field.props?.activeColor || '#2979ff'"
              :inactive-color="field.props?.inactiveColor || '#ebedf0'"
              @change="(val: any) => handleSliderChange(field, val)"
            />
          </template>

          <!-- Text 纯文本展示 -->
          <template v-else-if="field.type === 'text'">
            <text class="form-text-value">{{ formData[field.prop] || field.props?.defaultText || '-' }}</text>
          </template>

          <!-- 不支持的类型 -->
          <template v-else>
            <text class="unsupported-type">不支持的字段类型: {{ field.type }}</text>
          </template>
        </u-form-item>
      </template>
    </u-form>

    <!-- 操作按钮 -->
    <view v-if="showActions" class="form-actions">
      <template v-for="(action, index) in schema.actions" :key="index">
        <u-button
          v-if="action.show !== false"
          :type="action.buttonType || 'default'"
          :loading="action.loading"
          :disabled="action.disabled"
          :custom-style="getActionStyle(action, index)"
          @click="handleActionClick(action)"
        >
          {{ action.text }}
        </u-button>
      </template>
    </view>

    <!-- 默认提交按钮 -->
    <view v-else-if="!readonly" class="form-actions">
      <u-button type="primary" @click="handleSubmit">提交</u-button>
      <u-button v-if="showReset" @click="handleReset">重置</u-button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import type { FormSchema, FormField, FormAction, ValidationRule } from './types'

interface Props {
  schema: FormSchema
  modelValue?: Record<string, any>
  readonly?: boolean
  disabled?: boolean
  showReset?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => ({}),
  readonly: false,
  disabled: false,
  showReset: true
})

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, any>]
  'submit': [data: { values: Record<string, any>; valid: boolean; errors?: any[] }]
  'reset': []
  'change': [field: string, value: any]
  'action': [action: FormAction, values: Record<string, any>]
}>()

// 表单引用
const formRef = ref()

// 表单数据
const formData = reactive<Record<string, any>>({})

// 显示值（用于 picker 等需要显示文本的场景）
const displayValues = reactive<Record<string, string>>({})

// picker 显示状态
const pickerState = reactive<Record<string, boolean>>({})

// 日期 picker 显示状态
const datePickerState = reactive<Record<string, boolean>>({})

// 布局配置
const layoutConfig = computed(() => ({
  labelPosition: props.schema.layout?.labelPosition || 'left',
  labelWidth: props.schema.layout?.labelWidth || '90',
  borderBottom: props.schema.layout?.borderBottom !== false,
  errorType: props.schema.layout?.errorType || ['message', 'toast']
}))

// 是否显示操作按钮
const showActions = computed(() => {
  return props.schema.actions && props.schema.actions.length > 0
})

// 表单验证规则
const formRules = computed(() => {
  const rules: Record<string, any[]> = {}
  
  props.schema.fields.forEach(field => {
    const fieldRules: any[] = []
    
    // 处理字段级别的 rules
    if (field.rules && field.rules.length > 0) {
      field.rules.forEach(rule => {
        fieldRules.push({
          required: rule.required,
          message: rule.message,
          trigger: rule.trigger || ['blur', 'change'],
          min: rule.min,
          max: rule.max,
          len: rule.len,
          pattern: rule.pattern ? new RegExp(rule.pattern) : undefined,
          type: rule.type
        })
      })
    }
    
    // 如果标记了 required 但没有 rules，添加默认规则
    if (field.required && fieldRules.length === 0) {
      fieldRules.push({
        required: true,
        message: `${field.label}不能为空`,
        trigger: ['blur', 'change']
      })
    }
    
    if (fieldRules.length > 0) {
      rules[field.prop] = fieldRules
    }
  })
  
  // 合并全局 rules
  if (props.schema.rules) {
    Object.assign(rules, props.schema.rules)
  }
  
  return rules
})

// 初始化表单数据
const initFormData = () => {
  props.schema.fields.forEach(field => {
    // 设置默认值
    if (field.defaultValue !== undefined) {
      formData[field.prop] = field.defaultValue
    } else {
      // 根据类型设置初始值
      switch (field.type) {
        case 'checkbox':
          formData[field.prop] = []
          break
        case 'switch':
          formData[field.prop] = field.props?.inactiveValue ?? false
          break
        case 'number':
        case 'rate':
        case 'slider':
          formData[field.prop] = field.props?.min ?? 0
          break
        default:
          formData[field.prop] = ''
      }
    }
    
    // 如果有传入的 modelValue，覆盖默认值
    if (props.modelValue && props.modelValue[field.prop] !== undefined) {
      formData[field.prop] = props.modelValue[field.prop]
    }
    
    // 初始化显示值
    updateDisplayValue(field)
  })
}

// 更新显示值
const updateDisplayValue = (field: FormField) => {
  if (field.type === 'select' && field.options) {
    const value = formData[field.prop]
    const option = field.options.find(opt => opt.value === value)
    displayValues[field.prop] = option?.label || ''
  } else if (field.type === 'date' || field.type === 'datetime' || field.type === 'time') {
    // 日期时间直接显示存储的字符串值
    displayValues[field.prop] = formData[field.prop] || ''
  }
}



// 获取输入框类型
const getInputType = (type: string): string => {
  const typeMap: Record<string, string> = {
    input: 'text',
    password: 'password',
    number: 'number'
  }
  return typeMap[type] || 'text'
}

// 获取日期选择器参数配置
const getDatePickerParams = (type: string) => {
  const paramsMap: Record<string, any> = {
    date: {
      year: true,
      month: true,
      day: true,
      hour: false,
      minute: false,
      second: false
    },
    datetime: {
      year: true,
      month: true,
      day: true,
      hour: true,
      minute: true,
      second: false
    },
    time: {
      year: false,
      month: false,
      day: false,
      hour: true,
      minute: true,
      second: false
    }
  }
  return paramsMap[type] || paramsMap.date
}

// 获取默认时间字符串
const getDefaultTime = (type: string): string => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hour = String(now.getHours()).padStart(2, '0')
  const minute = String(now.getMinutes()).padStart(2, '0')
  
  if (type === 'date') {
    return `${year}-${month}-${day}`
  } else if (type === 'datetime') {
    return `${year}-${month}-${day} ${hour}:${minute}`
  } else if (type === 'time') {
    return `${hour}:${minute}`
  }
  return `${year}-${month}-${day}`
}

// 获取默认 picker 索引
const getDefaultPickerIndex = (field: FormField): number => {
  if (!field.options || field.options.length === 0) return 0
  const value = formData[field.prop]
  const index = field.options.findIndex(opt => opt.value === value)
  return index >= 0 ? index : 0
}

// 判断字段是否禁用
const isFieldDisabled = (field: FormField): boolean => {
  return props.disabled || field.disabled || false
}

// 判断字段是否只读
const isFieldReadonly = (field: FormField): boolean => {
  return props.readonly || field.readonly || false
}

// 打开 picker
const openPicker = (field: FormField) => {
  if (isFieldDisabled(field) || isFieldReadonly(field)) return
  pickerState[field.prop] = true
}

// 处理 picker 确认
const handlePickerConfirm = (field: FormField, e: any) => {
  pickerState[field.prop] = false
  const selectedIndex = e.indexs?.[0] || 0
  const option = field.options?.[selectedIndex]
  if (option) {
    formData[field.prop] = option.value
    displayValues[field.prop] = option.label
    emit('change', field.prop, option.value)
    emit('update:modelValue', { ...formData })
  }
}

// 打开日期选择器
const openDatePicker = (field: FormField) => {
  if (isFieldDisabled(field) || isFieldReadonly(field)) return
  datePickerState[field.prop] = true
}

// 处理日期确认
const handleDateConfirm = (field: FormField, e: any) => {
  datePickerState[field.prop] = false
  
  // u-picker 返回的对象包含 year, month, day, hour, minute, second 等字段
  let value = ''
  if (field.type === 'date') {
    value = `${e.year}-${e.month}-${e.day}`
  } else if (field.type === 'datetime') {
    value = `${e.year}-${e.month}-${e.day} ${e.hour}:${e.minute}`
  } else if (field.type === 'time') {
    value = `${e.hour}:${e.minute}`
  }
  
  formData[field.prop] = value
  displayValues[field.prop] = value
  emit('change', field.prop, value)
  emit('update:modelValue', { ...formData })
}

// 处理字段失焦
const handleFieldBlur = (field: FormField) => {
  emit('change', field.prop, formData[field.prop])
  emit('update:modelValue', { ...formData })
}

// 处理字段变化
const handleFieldChange = (field: FormField) => {
  emit('change', field.prop, formData[field.prop])
  emit('update:modelValue', { ...formData })
}

// 处理 radio 变化
const handleRadioChange = (field: FormField, val: any) => {
  emit('change', field.prop, val)
  emit('update:modelValue', { ...formData })
}

// 处理 checkbox 变化
const handleCheckboxChange = (field: FormField, val: any) => {
  emit('change', field.prop, val)
  emit('update:modelValue', { ...formData })
}

// 处理 switch 变化
const handleSwitchChange = (field: FormField, val: any) => {
  emit('change', field.prop, val)
  emit('update:modelValue', { ...formData })
}

// 处理 rate 变化
const handleRateChange = (field: FormField, val: any) => {
  emit('change', field.prop, val)
  emit('update:modelValue', { ...formData })
}

// 处理 slider 变化
const handleSliderChange = (field: FormField, val: any) => {
  emit('change', field.prop, val)
  emit('update:modelValue', { ...formData })
}

// 获取按钮样式
const getActionStyle = (action: FormAction, index: number) => {
  return {
    marginTop: index > 0 ? '20rpx' : '0'
  }
}

// 处理操作按钮点击
const handleActionClick = (action: FormAction) => {
  if (action.type === 'submit') {
    handleSubmit()
  } else if (action.type === 'reset') {
    handleReset()
  } else {
    emit('action', action, { ...formData })
  }
}

// 提交表单
const handleSubmit = () => {
  formRef.value?.validate((valid: boolean, errors: any[]) => {
    emit('submit', {
      values: { ...formData },
      valid,
      errors
    })
  })
}

// 重置表单
const handleReset = () => {
  formRef.value?.resetFields()
  initFormData()
  emit('reset')
}

// 暴露方法
defineExpose({
  validate: () => formRef.value?.validate(),
  resetFields: () => formRef.value?.resetFields(),
  clearValidate: (props?: string | string[]) => formRef.value?.clearValidate(props),
  getValues: () => ({ ...formData }),
  setValues: (values: Record<string, any>) => {
    Object.assign(formData, values)
    emit('update:modelValue', { ...formData })
  }
})

// 监听 modelValue 变化
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    Object.assign(formData, newVal)
    props.schema.fields.forEach(field => updateDisplayValue(field))
  }
}, { deep: true })

// 监听 schema 变化
watch(() => props.schema, () => {
  initFormData()
}, { deep: true })

// 初始化
onMounted(() => {
  initFormData()
})
</script>

<style scoped>
.form-renderer {
  padding: 20rpx;
}

.form-title {
  text-align: center;
  padding: 30rpx 0;
}

.title-text {
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
}

.form-description {
  padding: 0 20rpx 30rpx;
}

.description-text {
  font-size: 28rpx;
  color: #666;
  line-height: 1.6;
}

.form-content {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 20rpx;
}

.form-item {
  margin-bottom: 10rpx;
}

.form-text-value {
  font-size: 30rpx;
  color: #333;
  line-height: 1.6;
}

.unsupported-type {
  font-size: 28rpx;
  color: #ff6b6b;
}

.form-actions {
  margin-top: 40rpx;
  padding: 0 20rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}
</style>
