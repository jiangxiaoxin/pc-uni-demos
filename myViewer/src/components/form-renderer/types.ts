/**
 * 低代码表单渲染器类型定义
 */

/** 表单字段类型 */
export type FieldType = 
  | 'input'           // 文本输入
  | 'textarea'        // 多行文本
  | 'password'        // 密码输入
  | 'number'          // 数字输入
  | 'select'          // 下拉选择
  | 'radio'           // 单选框
  | 'checkbox'        // 复选框
  | 'switch'          // 开关
  | 'date'            // 日期选择
  | 'datetime'        // 日期时间选择
  | 'time'            // 时间选择
  | 'range'           // 范围选择
  | 'rate'            // 评分
  | 'slider'          // 滑块
  | 'upload'          // 文件上传
  | 'text';           // 纯文本展示

/** 选项配置 */
export interface Option {
  label: string;
  value: string | number | boolean;
  disabled?: boolean;
}

/** 验证规则 */
export interface ValidationRule {
  required?: boolean;
  message?: string;
  trigger?: 'blur' | 'change' | ('blur' | 'change')[];
  min?: number;
  max?: number;
  len?: number;
  pattern?: string;
  type?: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'email' | 'url' | 'integer' | 'float';
  validator?: string; // 自定义验证函数名（预留）
}

/** 表单字段配置 */
export interface FormField {
  /** 字段类型 */
  type: FieldType;
  /** 字段属性名 */
  prop: string;
  /** 字段标签 */
  label: string;
  /** 占位提示文本 */
  placeholder?: string;
  /** 是否必填 */
  required?: boolean;
  /** 默认值 */
  defaultValue?: any;
  /** 选项（用于 select/radio/checkbox） */
  options?: Option[];
  /** 验证规则 */
  rules?: ValidationRule[];
  /** 字段属性配置 */
  props?: Record<string, any>;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否只读 */
  readonly?: boolean;
  /** 字段宽度（栅格布局） */
  span?: number;
  /** 标签位置 */
  labelPosition?: 'left' | 'top';
  /** 标签宽度 */
  labelWidth?: string | number;
}

/** 按钮配置 */
export interface FormAction {
  /** 按钮类型 */
  type: 'submit' | 'reset' | 'cancel' | 'button';
  /** 按钮文本 */
  text: string;
  /** 按钮样式类型 */
  buttonType?: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'default';
  /** 是否显示 */
  show?: boolean;
  /** 自定义事件名 */
  event?: string;
  /** 是否 loading */
  loading?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
}

/** 表单布局配置 */
export interface FormLayout {
  /** 标签位置 */
  labelPosition?: 'left' | 'top';
  /** 标签宽度 */
  labelWidth?: string | number;
  /** 是否显示边框 */
  borderBottom?: boolean;
  /** 错误提示方式 */
  errorType?: ('message' | 'toast' | 'border-bottom' | 'none')[];
}

/** 表单 Schema */
export interface FormSchema {
  /** 表单标题 */
  title?: string;
  /** 表单描述 */
  description?: string;
  /** 数据模型名 */
  model?: string;
  /** 字段配置数组 */
  fields: FormField[];
  /** 操作按钮配置 */
  actions?: FormAction[];
  /** 布局配置 */
  layout?: FormLayout;
  /** 全局验证规则 */
  rules?: Record<string, ValidationRule[]>;
}

/** 表单渲染器 Props */
export interface FormRendererProps {
  /** 表单 Schema */
  schema: FormSchema;
  /** 表单数据 */
  modelValue?: Record<string, any>;
  /** 是否只读 */
  readonly?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
}

/** 表单提交数据 */
export interface FormSubmitData {
  /** 表单数据 */
  values: Record<string, any>;
  /** 表单验证结果 */
  valid: boolean;
  /** 错误信息 */
  errors?: any[];
}

/** 组件映射类型 */
export type ComponentRenderer = (field: FormField, model: Record<string, any>) => any;
