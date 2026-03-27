<template>
  <div class="render-container">
    <h2>动态表单渲染</h2>
    
    <!-- JSON 配置编辑区 -->
    <div class="json-config-section">
      <div class="config-header">
        <h3>JSON 配置</h3>
        <el-button type="primary" size="small" @click="applyConfig">应用配置</el-button>
      </div>
      <el-input
        v-model="localJsonConfig"
        type="textarea"
        :rows="10"
        placeholder="请输入 JSON 配置"
        class="json-editor"
      />
      <div v-if="jsonError" class="json-error">{{ jsonError }}</div>
    </div>
    
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      class="dynamic-form"
    >


      <el-form-item
        v-for="field in config"
        :key="field.key"
        :label="field.label"
        :prop="field.key"
      >
        <!-- Input 输入框 -->
        <el-input
          v-if="field.type === 'input'"
          v-model="formData[field.key]"
          :placeholder="field.placeholder"
          clearable
        />
        
        <!-- Number 数字输入 -->
        <el-input-number
          v-else-if="field.type === 'number'"
          v-model="formData[field.key]"
          :placeholder="field.placeholder"
          controls-position="right"
          :min="0"
          style="width: 100%"
        />
        
        <!-- Textarea 多行文本 -->
        <el-input
          v-else-if="field.type === 'textarea'"
          v-model="formData[field.key]"
          type="textarea"
          :placeholder="field.placeholder"
          :rows="3"
        />
        
        <!-- Select 下拉选择 -->
        <el-select
          v-else-if="field.type === 'select'"
          v-model="formData[field.key]"
          :placeholder="field.placeholder"
          style="width: 100%"
          clearable
        >
          <el-option
            v-for="option in field.options"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
        
        <!-- Radio 单选框 -->
        <el-radio-group
          v-else-if="field.type === 'radio'"
          v-model="formData[field.key]"
        >
          <el-radio
            v-for="option in field.options"
            :key="option.value"
            :label="option.value"
          >
            {{ option.label }}
          </el-radio>
        </el-radio-group>
        
        <!-- Checkbox 复选框 -->
        <el-checkbox-group
          v-else-if="field.type === 'checkbox'"
          v-model="formData[field.key]"
        >
          <el-checkbox
            v-for="option in field.options"
            :key="option.value"
            :label="option.value"
          >
            {{ option.label }}
          </el-checkbox>
        </el-checkbox-group>
        
        <!-- Switch 开关 -->
        <el-switch
          v-else-if="field.type === 'switch'"
          v-model="formData[field.key]"
          active-text="是"
          inactive-text="否"
        />
        
        <!-- Date 日期选择 -->
        <el-date-picker
          v-else-if="field.type === 'date'"
          v-model="formData[field.key]"
          type="date"
          :placeholder="field.placeholder"
          style="width: 100%"
          value-format="YYYY-MM-DD"
        />
        
        <!-- DateTime 日期时间选择 -->
        <el-date-picker
          v-else-if="field.type === 'datetime'"
          v-model="formData[field.key]"
          type="datetime"
          :placeholder="field.placeholder"
          style="width: 100%"
          value-format="YYYY-MM-DD HH:mm:ss"
        />
        
        <!-- Time 时间选择 -->
        <el-time-picker
          v-else-if="field.type === 'time'"
          v-model="formData[field.key]"
          :placeholder="field.placeholder"
          style="width: 100%"
          value-format="HH:mm:ss"
        />
        
        <!-- Rate 评分 -->
        <el-rate
          v-else-if="field.type === 'rate'"
          v-model="formData[field.key]"
          show-score
        />
        
        <!-- Slider 滑块 -->
        <el-slider
          v-else-if="field.type === 'slider'"
          v-model="formData[field.key]"
          show-input
        />
        
        <!-- Password 密码输入 -->
        <el-input
          v-else-if="field.type === 'password'"
          v-model="formData[field.key]"
          type="password"
          :placeholder="field.placeholder"
          show-password
          clearable
        />

        <!-- Selector 选择器 -->
        <div v-else-if="field.type === 'selector'" class="selector-wrapper">
          <el-button
            type="primary"
            :icon="Search"
            @click="openSelector(field)"
          >
            {{ getSelectorButtonText(field) }}
          </el-button>
          <!-- 回显区域 -->
          <div v-if="selectorDisplay[field.key]" class="selector-display">
            <el-tag closable @close="clearSelector(field)">
              {{ selectorDisplay[field.key] }}
            </el-tag>
          </div>
        </div>
        
        <!-- 不支持的类型 -->
        <div v-else class="unsupported-type">
          不支持的字段类型: {{ field.type }}
        </div>
      </el-form-item>
      
      <!-- 操作按钮 -->
      <el-form-item>
        <el-button type="primary" @click="handleSubmit">提交</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>
    
    <!-- 提交结果展示 -->
    <div v-if="submitResult" class="submit-result" :class="submitResult.type">
      <h4>{{ submitResult.title }}</h4>
      <pre>{{ JSON.stringify(submitResult.data, null, 2) }}</pre>
    </div>
  </div>
  
  <!-- 选择器弹窗 -->
  <el-dialog
    v-model="selectorDialog.visible"
    title="选择数据"
    width="800px"
    destroy-on-close
  >
    <el-table
      v-loading="selectorDialog.loading"
      :data="selectorDialog.dataList"
      highlight-current-row
      @row-click="handleRowClick"
      border
    >
      <el-table-column type="index" width="50" />
      <el-table-column
        v-for="col in selectorDialog.columns"
        :key="col.prop"
        :prop="col.prop"
        :label="col.label"
        min-width="120"
      />
    </el-table>
    <template #footer>
      <el-button @click="selectorDialog.visible = false">取消</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { Search } from '@element-plus/icons-vue'

// 选择器数据源配置
interface SelectorConfig {
  apiUrl: string      // 数据源接口地址
  displayField: string // 显示字段名
  idField?: string    // ID字段名，默认'id'
  columns?: { label: string; prop: string }[] // 表格列配置
}

// 表单字段配置接口
interface FormFieldConfig {
  type: string
  label: string
  key: string
  placeholder?: string
  options?: { label: string; value: any }[]
  rules?: ValidationRule[]
  required?: boolean
  defaultValue?: any
  selectorConfig?: SelectorConfig // 选择器专用配置
}

// 校验规则接口
interface ValidationRule {
  required?: boolean
  message?: string
  trigger?: string | string[]
  min?: number
  max?: number
  type?: string
  pattern?: RegExp
  validator?: (rule: any, value: any, callback: any) => void
}

// 组件 Props
interface Props {
  config?: FormFieldConfig[]
  configJson?: string  // JSON 字符串形式的配置
}

const props = withDefaults(defineProps<Props>(), {
  config: () => [],
  configJson: ''
})

// 表单引用
const formRef = ref<FormInstance>()

// 表单数据
const formData = ref<Record<string, any>>({})

// 提交结果
const submitResult = ref<{ type: string; title: string; data: any } | null>(null)

// 选择器显示文本（存储key对应的显示文本）
const selectorDisplay = ref<Record<string, string>>({})

// 选择器弹窗状态
const selectorDialog = ref({
  visible: false,
  loading: false,
  dataList: [] as any[],
  columns: [] as { label: string; prop: string }[],
  currentField: null as FormFieldConfig | null
})

// 当前激活的选择器字段
const currentSelectorField = ref<FormFieldConfig | null>(null)

// 默认配置（当 props.config 为空时使用）
const defaultConfig: FormFieldConfig[] = [
  {
    type: 'input',
    label: '姓名',
    key: 'name',
    placeholder: '请输入姓名',
    rules: [
      { required: true, message: '姓名不能为空', trigger: 'blur' },
      { min: 2, max: 5, message: '姓名长度在 2 到 5 个字符', trigger: 'blur' }
    ]
  },
  {
    type: 'select',
    label: '性别',
    key: 'sex',
    placeholder: '请选择性别',
    options: [
      { label: '男', value: '1' },
      { label: '女', value: '2' }
    ],
    rules: [
      { required: true, message: '性别不能为空', trigger: 'blur' }
    ]
  },
  {
    type: 'date',
    label: '生日',
    key: 'birthday',
    placeholder: '请选择生日',
    rules: [
      { required: true, message: '生日不能为空', trigger: 'change' }
    ]
  },
  {
    type: 'number',
    label: '年龄',
    key: 'age',
    placeholder: '请输入年龄',
    rules: [
      { 
        required: true, 
        message: '年龄不能为空',
        trigger: ['blur', 'change'],
        type: 'number',
      },
    ]
  },
  {
    type: 'selector',
    label: '所属部门',
    key: 'deptId',
    placeholder: '选择部门',
    selectorConfig: {
      apiUrl: '/api/departments',
      displayField: 'name',
      idField: 'id',
      columns: [
        { label: '部门名称', prop: 'name' },
        { label: '部门编码', prop: 'code' },
        { label: '描述', prop: 'description' }
      ]
    },
    rules: [
      { 
        validator: (_rule: any, value: any, callback: any) => {
          if (value === null || value === undefined || value === '') {
            callback(new Error('请选择部门'))
          } else {
            callback()
          }
        },
        trigger: 'change'
      }
    ]
  }
]

// 解析 JSON 字符串配置
const parseConfigFromJson = (jsonStr: string): FormFieldConfig[] => {
  if (!jsonStr.trim()) return []
  
  try {
    const parsed = JSON.parse(jsonStr)
    
    // 处理解析后的配置，转换一些特殊字段
    const processConfig = (fields: any[]): FormFieldConfig[] => {
      return fields.map(field => {
        const processed: FormFieldConfig = {
          ...field,
          // 如果有 validator 字符串，需要特殊处理
          // JSON 中不能存储函数，所以使用预定义的验证器名称
          rules: field.rules?.map((rule: any) => {
            if (rule.validatorName) {
              // 根据名称获取对应的验证器函数，并传入自定义 message
              return {
                ...rule,
                validator: getValidatorByName(rule.validatorName, rule.message)
              }
            }
            return rule
          })
        }
        return processed
      })
    }
    
    if (Array.isArray(parsed)) {
      return processConfig(parsed)
    }
    
    console.warn('JSON 配置必须是数组形式')
    return []
  } catch (error) {
    console.error('解析 JSON 配置失败:', error)
    return []
  }
}

// 公共验证器定义（验证器工厂函数）
const validatorFactories: Record<string, (message?: string) => Function> = {
  // 年龄验证器
  ageValidator: (message?: string) => {
    return (_rule: any, value: any, callback: any) => {
      if (value === null || value === undefined || value === '') {
        callback(new Error(message || '年龄不能为空'))
      } else if (typeof value !== 'number' || isNaN(value)) {
        callback(new Error('年龄必须为数字'))
      } else {
        callback()
      }
    }
  },
  // 选择器验证器
  selectorValidator: (message?: string) => {
    return (_rule: any, value: any, callback: any) => {
      if (value === null || value === undefined || value === '') {
        callback(new Error(message || '请选择'))
      } else {
        callback()
      }
    }
  },
  // 通用必填验证器
  requiredValidator: (message?: string) => {
    return (_rule: any, value: any, callback: any) => {
      if (value === null || value === undefined || value === '' || 
          (Array.isArray(value) && value.length === 0)) {
        callback(new Error(message || '该字段不能为空'))
      } else {
        callback()
      }
    }
  },
  // 可以添加更多预定义验证器...
}

// 根据名称获取验证器函数
const getValidatorByName = (name: string, customMessage?: string): Function | undefined => {
  const factory = validatorFactories[name]
  return factory ? factory(customMessage) : undefined
}

// 本地测试用的 JSON 配置字符串
const localJsonConfig = ref<string>(JSON.stringify([
  {
    type: 'input',
    label: '姓名',
    key: 'name',
    placeholder: '请输入姓名',
    rules: [
      { validatorName: 'requiredValidator', message: '姓名不能为空', trigger: 'blur' },
      { min: 2, max: 10, message: '姓名长度在 2 到 10 个字符', trigger: 'blur' }
    ]
  },
  {
    type: 'number',
    label: '年龄',
    key: 'age',
    placeholder: '请输入年龄',
    rules: [
      { validatorName: 'ageValidator', message: '请输入您的年龄', trigger: 'change' }
    ]
  },
  {
    type: 'select',
    label: '性别',
    key: 'sex',
    placeholder: '请选择性别',
    options: [
      { label: '男', value: '1' },
      { label: '女', value: '2' }
    ],
    rules: [
      { validatorName: 'requiredValidator', message: '性别不能为空', trigger: 'change' }
    ]
  },
  {
    type: 'date',
    label: '生日',
    key: 'birthday',
    placeholder: '请选择生日',
    rules: [
      { validatorName: 'requiredValidator', message: '生日不能为空', trigger: 'change' }
    ]
  },
  {
    type: 'selector',
    label: '所属部门',
    key: 'deptId',
    placeholder: '选择部门',
    selectorConfig: {
      apiUrl: '/api/departments',
      displayField: 'name',
      idField: 'id',
      columns: [
        { label: '部门名称', prop: 'name' },
        { label: '部门编码', prop: 'code' },
        { label: '描述', prop: 'description' }
      ]
    },
    rules: [
      { validatorName: 'selectorValidator', message: '请选择所属部门', trigger: 'change' }
    ]
  },
  {
    type: 'textarea',
    label: '备注',
    key: 'remark',
    placeholder: '请输入备注信息'
  },
  {
    type: 'number',
    label: '数字age',
    key: 'ageNumber',
    placeholder: '请输入数字年龄',
    rules: [
      { validatorName: 'ageValidator', message: '哈哈哈哈', trigger: 'change' }
    ]
  },
], null, 2))

// JSON 错误提示
const jsonError = ref('')

// 应用配置
const applyConfig = () => {
  jsonError.value = ''
  
  try {
    // 尝试解析 JSON
    const parsed = JSON.parse(localJsonConfig.value)
    
    if (!Array.isArray(parsed)) {
      jsonError.value = '配置必须是数组形式'
      return
    }
    
    // 清空表单数据和选择器显示
    formData.value = {}
    selectorDisplay.value = {}
    
    // 重新初始化
    initFormData()
    
    // 清除所有校验状态
    nextTick(() => {
      formRef.value?.clearValidate()
    })
    
    console.log('配置已应用:', parsed)
  } catch (error: any) {
    jsonError.value = 'JSON 格式错误: ' + error.message
    console.error('应用配置失败:', error)
  }
}

// 使用本地 JSON 配置
const config = computed(() => {
  const jsonConfig = parseConfigFromJson(localJsonConfig.value)
  if (jsonConfig.length > 0) return jsonConfig
  return defaultConfig
})

// 生成表单校验规则
const formRules = computed<FormRules>(() => {
  const rules: FormRules = {}
  
  config.value.forEach((field: FormFieldConfig) => {
    const fieldRules: any[] = []
    
    // 处理字段级别的 rules
    if (field.rules && field.rules.length > 0) {
      field.rules.forEach((rule: ValidationRule) => {
        fieldRules.push({
          required: rule.required,
          message: rule.message,
          trigger: rule.trigger || ['blur', 'change'],
          min: rule.min,
          max: rule.max,
          type: rule.type,
          pattern: rule.pattern,
          validator: rule.validator
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
      rules[field.key] = fieldRules
    }
  })
  
  return rules
})

// 初始化表单数据
const initFormData = () => {
  config.value.forEach((field: FormFieldConfig) => {
    // 设置默认值
    if (field.defaultValue !== undefined) {
      formData.value[field.key] = field.defaultValue
    } else {
      // 根据类型设置初始值
      switch (field.type) {
        case 'checkbox':
          formData.value[field.key] = []
          break
        case 'switch':
          formData.value[field.key] = false
          break
        case 'number':
        case 'selector':
          formData.value[field.key] = null
          break
        case 'rate':
        case 'slider':
          formData.value[field.key] = 0
          break
        default:
          formData.value[field.key] = ''
      }
    }
  })
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  console.log('formdata', formData.value);
  
  
  await formRef.value.validate((valid: boolean, fields: any) => {
    if (valid) {
      // 校验通过
      submitResult.value = {
        type: 'success',
        title: '提交成功',
        data: {
          values: { ...formData.value },
          valid: true
        }
      }
      console.log('表单提交成功:', formData.value)
    } else {
      // 校验失败
      submitResult.value = {
        type: 'error',
        title: '提交失败，请检查表单',
        data: {
          errors: fields,
          valid: false
        }
      }
      console.log('表单校验失败:', fields)
    }
  })
}

// 重置表单
const handleReset = () => {
  if (!formRef.value) return
  formRef.value.resetFields()
  submitResult.value = null
}

// 暴露方法给父组件
defineExpose({
  validate: () => formRef.value?.validate(),
  resetFields: () => formRef.value?.resetFields(),
  clearValidate: (props?: string | string[]) => formRef.value?.clearValidate(props),
  getValues: () => ({ ...formData.value }),
  setValues: (values: Record<string, any>) => {
    Object.assign(formData.value, values)
  }
})

// 获取选择器按钮文本
const getSelectorButtonText = (field: FormFieldConfig): string => {
  return field.placeholder || `选择${field.label}`
}

// 打开选择器
const openSelector = async (field: FormFieldConfig) => {
  if (!field.selectorConfig) {
    console.error('选择器配置不存在:', field.key)
    return
  }
  
  currentSelectorField.value = field
  selectorDialog.value.currentField = field
  selectorDialog.value.visible = true
  selectorDialog.value.loading = true
  
  try {
    // 调用接口获取数据
    const response = await fetch(field.selectorConfig.apiUrl)
    const result = await response.json()
    
    // 假设接口返回 { data: [...] } 或直接使用 [...]
    const list = result.data || result || []
    selectorDialog.value.dataList = list
    
    // 生成表格列
    if (field.selectorConfig.columns && field.selectorConfig.columns.length > 0) {
      selectorDialog.value.columns = field.selectorConfig.columns
    } else if (list.length > 0) {
      // 自动从第一条数据生成列
      const firstItem = list[0]
      selectorDialog.value.columns = Object.keys(firstItem)
        .filter(key => key !== 'id' || key === (field.selectorConfig?.idField || 'id'))
        .map(key => ({
          label: key,
          prop: key
        }))
    }
  } catch (error) {
    console.error('获取选择器数据失败:', error)
    // 模拟数据（演示用）
    const mockData = [
      { id: 1, name: '选项一', code: 'OPT001', description: '这是选项一的描述' },
      { id: 2, name: '选项二', code: 'OPT002', description: '这是选项二的描述' },
      { id: 3, name: '选项三', code: 'OPT003', description: '这是选项三的描述' },
    ]
    selectorDialog.value.dataList = mockData
    selectorDialog.value.columns = [
      { label: '名称', prop: 'name' },
      { label: '编码', prop: 'code' },
      { label: '描述', prop: 'description' },
    ]
  } finally {
    selectorDialog.value.loading = false
  }
}

// 处理行点击（选择数据）
const handleRowClick = async (row: any) => {
  const field = currentSelectorField.value
  if (!field || !field.selectorConfig) return
  
  const idField = field.selectorConfig.idField || 'id'
  const displayField = field.selectorConfig.displayField
  
  // 关闭弹窗
  selectorDialog.value.visible = false
  
  // 保存ID到formData
  formData.value[field.key] = row[idField]
  
  // 保存显示文本
  selectorDisplay.value[field.key] = row[displayField]
  
  // 等待值更新后再校验
  await nextTick()
  
  // 先清除校验状态，再重新校验
  formRef.value?.clearValidate(field.key)
  
  await nextTick()
  
  // 手动触发表单字段校验
  formRef.value?.validateField(field.key, (isValid, invalidFields) => {
    console.log(`校验结果[${field.key}]:`, isValid ? '通过' : '失败', invalidFields)
  })
  
  console.log(`选择器[${field.key}]选中:`, {
    id: row[idField],
    display: row[displayField],
    formValue: formData.value[field.key]
  })
}

// 清除选择
const clearSelector = async (field: FormFieldConfig) => {
  formData.value[field.key] = null
  delete selectorDisplay.value[field.key]
  // 等待值更新后再清除校验状态
  await nextTick()
  // 清除该字段的校验状态
  formRef.value?.clearValidate(field.key)
}

// 示例 JSON 配置字符串
const exampleJsonConfig = JSON.stringify([
  {
    type: 'input',
    label: '姓名',
    key: 'name',
    placeholder: '请输入姓名',
    rules: [
      { validatorName: 'requiredValidator', message: '姓名不能为空', trigger: 'blur' },
      { min: 2, max: 10, message: '姓名长度在 2 到 10 个字符', trigger: 'blur' }
    ]
  },
  {
    type: 'number',
    label: '年龄',
    key: 'age',
    placeholder: '请输入年龄',
    rules: [
      { validatorName: 'ageValidator', message: '请输入您的年龄', trigger: 'change' }
    ]
  },
  {
    type: 'select',
    label: '性别',
    key: 'sex',
    placeholder: '请选择性别',
    options: [
      { label: '男', value: '1' },
      { label: '女', value: '2' }
    ],
    rules: [
      { validatorName: 'requiredValidator', message: '性别不能为空', trigger: 'change' }
    ]
  },
  {
    type: 'date',
    label: '生日',
    key: 'birthday',
    placeholder: '请选择生日',
    rules: [
      { validatorName: 'requiredValidator', message: '生日不能为空', trigger: 'change' }
    ]
  },
  {
    type: 'selector',
    label: '所属部门',
    key: 'deptId',
    placeholder: '选择部门',
    selectorConfig: {
      apiUrl: '/api/departments',
      displayField: 'name',
      idField: 'id',
      columns: [
        { label: '部门名称', prop: 'name' },
        { label: '部门编码', prop: 'code' },
        { label: '描述', prop: 'description' }
      ]
    },
    rules: [
      { validatorName: 'selectorValidator', message: '请选择所属部门', trigger: 'change' }
    ]
  }
], null, 2)

// 初始化
onMounted(() => {
  initFormData()

  // 输出示例 JSON 配置到控制台，方便参考
  console.log('========== 示例 JSON 配置 ==========')
  console.log(exampleJsonConfig)
  console.log('====================================')
  
  setTimeout(() => {
    console.log('formRules', formRules.value);
    
  }, 1000)
})
</script>

<style scoped>
.render-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

h2 {
  text-align: center;
  color: #333;
  margin-bottom: 30px;
}

.dynamic-form {
  background-color: #fff;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.unsupported-type {
  color: #f56c6c;
  font-size: 14px;
}

.submit-result {
  margin-top: 20px;
  padding: 20px;
  border-radius: 8px;
}

.submit-result.success {
  background-color: #f0f9eb;
  border: 1px solid #e1f3d8;
}

.submit-result.error {
  background-color: #fef0f0;
  border: 1px solid #fde2e2;
}

.submit-result h4 {
  margin: 0 0 10px 0;
  color: #333;
}

.submit-result pre {
  background-color: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 13px;
  line-height: 1.5;
  margin: 0;
}

.submit-result.success h4 {
  color: #67c23a;
}

.submit-result.error h4 {
  color: #f56c6c;
}

/* JSON 配置区域样式 */
.json-config-section {
  background-color: #f5f7fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.config-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.config-header h3 {
  margin: 0;
  color: #333;
  font-size: 16px;
}

.json-editor {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
}

.json-error {
  margin-top: 10px;
  padding: 10px;
  background-color: #fef0f0;
  border: 1px solid #fde2e2;
  border-radius: 4px;
  color: #f56c6c;
  font-size: 14px;
}

/* 选择器样式 */
.selector-wrapper {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.selector-display {
  margin-top: 8px;
}

.selector-display .el-tag {
  font-size: 14px;
}
</style>
