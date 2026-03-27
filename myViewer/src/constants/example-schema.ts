import type { FormSchema } from '@/components/form-renderer/types'

/**
 * 示例表单 Schema - 用户注册表单
 * 展示了各种表单字段类型的使用
 */
export const exampleSchema: FormSchema = {
  title: '用户注册',
  description: '请填写以下信息完成注册',
  model: 'userForm',
  layout: {
    labelPosition: 'left',
    labelWidth: '160',  // 全局设置所有字段左侧文本宽度（单位 rpx）
    borderBottom: true,
    errorType: ['message', 'toast']
  },
  fields: [
    {
      type: 'input',
      prop: 'username',
      label: '用户名',
      placeholder: '请输入用户名',
      required: true,
      props: {
        clearable: true,
        prefixIcon: 'account'
      },
      rules: [
        {
          required: true,
          message: '用户名不能为空',
          trigger: 'blur'
        },
        {
          min: 3,
          max: 20,
          message: '用户名长度在 3-20 个字符之间',
          trigger: 'blur'
        }
      ]
    },
    {
      type: 'password',
      prop: 'password',
      label: '密码',
      placeholder: '请输入密码',
      required: true,
      props: {
        clearable: true,
        prefixIcon: 'lock'
      },
      rules: [
        {
          required: true,
          message: '密码不能为空',
          trigger: 'blur'
        },
        {
          min: 6,
          message: '密码长度不能少于 6 位',
          trigger: 'blur'
        }
      ]
    },
    {
      type: 'input',
      prop: 'email',
      label: '邮箱',
      placeholder: '请输入邮箱地址',
      required: true,
      props: {
        clearable: true,
        prefixIcon: 'email'
      },
      rules: [
        {
          required: true,
          message: '邮箱不能为空',
          trigger: 'blur'
        },
        {
          type: 'email',
          message: '请输入正确的邮箱格式',
          trigger: 'blur'
        }
      ]
    },
    {
      type: 'input',
      prop: 'phone',
      label: '手机号',
      placeholder: '请输入手机号',
      required: true,
      props: {
        clearable: true,
        maxlength: 11,
        prefixIcon: 'phone'
      },
      rules: [
        {
          required: true,
          message: '手机号不能为空',
          trigger: 'blur'
        },
        {
          pattern: '^1[3-9]\\d{9}$',
          message: '请输入正确的手机号格式',
          trigger: 'blur'
        }
      ]
    },
    {
      type: 'select',
      prop: 'gender',
      label: '性别',
      placeholder: '请选择性别',
      options: [
        { label: '男', value: 'male' },
        { label: '女', value: 'female' },
        { label: '保密', value: 'secret' }
      ],
      defaultValue: 'secret'
    },
    {
      type: 'radio',
      prop: 'role',
      label: '角色',
      required: true,
      options: [
        { label: '普通用户', value: 'user' },
        { label: '开发者', value: 'developer' },
        { label: '管理员', value: 'admin' }
      ],
      defaultValue: 'user',
      props: {
        placement: 'row'
      }
    },
    {
      type: 'checkbox',
      prop: 'interests',
      label: '兴趣爱好',
      options: [
        { label: '阅读', value: 'reading' },
        { label: '音乐', value: 'music' },
        { label: '运动', value: 'sports' },
        { label: '旅游', value: 'travel' },
        { label: '编程', value: 'coding' }
      ],
      defaultValue: [],
      props: {
        placement: 'row'
      }
    },
    {
      type: 'date',
      prop: 'birthday',
      label: '生日',
      placeholder: '请选择生日'
    },
    {
      type: 'rate',
      prop: 'experience',
      label: '编程经验',
      defaultValue: 3,
      props: {
        count: 5,
        allowHalf: true
      }
    },
    {
      type: 'switch',
      prop: 'newsletter',
      label: '订阅通知',
      defaultValue: true,
      props: {
        activeValue: true,
        inactiveValue: false
      }
    },
    {
      type: 'textarea',
      prop: 'intro',
      label: '个人简介',
      placeholder: '请简单介绍一下自己',
      props: {
        height: 150,
        maxlength: 200,
        count: true
      },
      rules: [
        {
          max: 200,
          message: '个人简介不能超过 200 字',
          trigger: 'change'
        }
      ]
    }
  ],
  actions: [
    {
      type: 'submit',
      text: '提交注册',
      buttonType: 'primary'
    },
    {
      type: 'reset',
      text: '重置表单',
      buttonType: 'default'
    },
    {
      type: 'button',
      text: '自定义操作',
      buttonType: 'success',
      event: 'custom-save'
    }
  ]
}

/**
 * 示例表单 Schema - 问卷调查表单
 */
export const surveySchema: FormSchema = {
  title: '产品满意度调查',
  description: '感谢您参与本次调查，您的意见对我们非常重要',
  model: 'surveyForm',
  layout: {
    labelPosition: 'top',  // 标签在上方时，labelWidth 不生效
    borderBottom: false,
    errorType: ['message']
  },
  fields: [
    {
      type: 'input',
      prop: 'name',
      label: '您的姓名',
      required: true
    },
    {
      type: 'slider',
      prop: 'satisfaction',
      label: '满意度评分',
      defaultValue: 80,
      props: {
        min: 0,
        max: 100,
        step: 5,
        showValue: true
      }
    },
    {
      type: 'radio',
      prop: 'recommend',
      label: '您是否愿意推荐给朋友？',
      required: true,
      options: [
        { label: '非常愿意', value: 5 },
        { label: '愿意', value: 4 },
        { label: '一般', value: 3 },
        { label: '不太愿意', value: 2 },
        { label: '不愿意', value: 1 }
      ]
    },
    {
      type: 'checkbox',
      prop: 'features',
      label: '您喜欢哪些功能？（多选）',
      options: [
        { label: '界面设计', value: 'ui' },
        { label: '性能表现', value: 'performance' },
        { label: '功能丰富', value: 'features' },
        { label: '客户服务', value: 'service' },
        { label: '价格合理', value: 'price' }
      ]
    },
    {
      type: 'textarea',
      prop: 'suggestion',
      label: '改进建议',
      placeholder: '请输入您的宝贵建议...',
      props: {
        height: 200,
        maxlength: 500,
        count: true
      }
    }
  ],
  actions: [
    {
      type: 'submit',
      text: '提交问卷',
      buttonType: 'primary'
    },
    {
      type: 'reset',
      text: '重新填写',
      buttonType: 'default'
    }
  ]
}

/**
 * 示例表单 Schema - 简单登录表单
 */
export const loginSchema: FormSchema = {
  title: '用户登录',
  model: 'loginForm',
  layout: {
    labelPosition: 'top',  // 顶部对齐，labelWidth 不生效
    borderBottom: true
  },
  fields: [
    {
      type: 'input',
      prop: 'account',
      label: '账号',
      placeholder: '请输入账号或邮箱',
      required: true,
      props: {
        prefixIcon: 'account',
        clearable: true
      }
    },
    {
      type: 'password',
      prop: 'password',
      label: '密码',
      placeholder: '请输入密码',
      required: true,
      props: {
        prefixIcon: 'lock',
        clearable: true
      }
    },
    {
      type: 'switch',
      prop: 'remember',
      label: '记住密码',
      defaultValue: false
    }
  ],
  actions: [
    {
      type: 'submit',
      text: '登录',
      buttonType: 'primary'
    }
  ]
}

/**
 * 示例表单 Schema - 窄标签表单（展示 labelWidth 效果）
 */
export const narrowLabelSchema: FormSchema = {
  title: '窄标签表单示例',
  description: '展示 labelPosition=left 时，labelWidth 设置较窄的效果',
  model: 'narrowForm',
  layout: {
    labelPosition: 'left',
    labelWidth: '70',  // 较窄的标签宽度
    borderBottom: true
  },
  fields: [
    {
      type: 'input',
      prop: 'name',
      label: '姓名',
      placeholder: '请输入姓名',
      required: true
    },
    {
      type: 'input',
      prop: 'phone',
      label: '手机',
      placeholder: '请输入手机号',
      required: true
    },
    {
      type: 'select',
      prop: 'gender',
      label: '性别',
      placeholder: '请选择',
      options: [
        { label: '男', value: 'male' },
        { label: '女', value: 'female' }
      ]
    },
    {
      type: 'switch',
      prop: 'agree',
      label: '同意协议'
    }
  ],
  actions: [
    {
      type: 'submit',
      text: '提交',
      buttonType: 'primary'
    }
  ]
}

/**
 * 所有示例配置
 */
export const allExamples = {
  user: exampleSchema,
  survey: surveySchema,
  login: loginSchema,
  narrowLabel: narrowLabelSchema
}
