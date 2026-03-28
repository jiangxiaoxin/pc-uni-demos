# PC-UNI-H5 项目说明

## 项目概述

PC-UNI-H5 是一个基于 pnpm workspaces 管理的 monorepo 项目，包含以下主要应用和服务：

1. **myEditor**: Vue 3 + Vite + TypeScript 编辑器，包含 JSON 编辑器和拖拽式组件编辑器
2. **myViewer**: Uni-app 跨平台应用，用于接收表单配置并渲染动态表单
3. **message-server**: Node.js HTTP 消息服务器，实现两个应用间的跨域通信
4. **server**: Express + MySQL 后台服务，提供 RESTful API
5. **flow**: 基于 LogicFlow 的流程图编辑器

## 技术栈

### myEditor (编辑器)
- **框架**: Vue 3 (Composition API + `<script setup>`)
- **构建工具**: Vite 8.x
- **语言**: TypeScript 5.9.x (严格模式)
- **路由**: Vue Router 4.x
- **开发端口**: 5173
- **依赖**: `@pc-uni-h5/utils` (workspace), Element Plus, @element-plus/icons-vue

### myViewer (查看器)
- **框架**: Uni-app 3.x + Vue 3
- **构建工具**: Vite 5.2.x + @dcloudio/vite-plugin-uni
- **语言**: TypeScript 4.9.x
- **UI 库**: uView Pro (组件库)
- **开发端口**: 5174
- **依赖**: `@pc-uni-h5/utils` (workspace), vue-draggable-plus
- **支持平台**: H5、微信小程序、支付宝小程序、百度小程序、抖音小程序、QQ小程序、快手小程序、飞书小程序、京东小程序、快应用等

### 消息服务器
- **运行环境**: Node.js (原生 http 模块)
- **端口**: 3000
- **通信机制**: HTTP 长轮询 (Long Polling)，30秒超时

### 共享工具库
- **包名**: `@pc-uni-h5/utils`
- **位置**: `packages/utils/`
- **功能**: 类型检查、日期处理、JSON 工具、消息通信类型定义

### Server (后台服务)
- **框架**: Express 4.x
- **数据库**: MySQL (mysql2)
- **语言**: TypeScript 5.9.x
- **开发端口**: 3001
- **依赖**: cors, dotenv, express-validator, helmet, morgan, mysql2

### Flow (流程图编辑器)
- **框架**: Vue 3 + TypeScript
- **流程图引擎**: LogicFlow 2.x (@logicflow/core, @logicflow/extension)
- **节点注册**: @logicflow/vue-node-registry
- **UI 组件库**: Ant Design Vue 4.x
- **构建工具**: Vite 8.x
- **开发端口**: 5175

## 项目结构

```
pc-uni-h5/
├── package.json              # 根目录配置，定义 workspace 脚本
├── pnpm-workspace.yaml       # pnpm 工作区配置
├── pnpm-lock.yaml            # pnpm 锁定文件
├── message-server.js         # 消息中转服务器
├── packages/                 # 共享包目录
│   └── utils/                # 工具函数库 (@pc-uni-h5/utils)
│       ├── package.json      # 包配置
│       ├── tsconfig.json     # TypeScript 配置
│       ├── src/
│       │   └── index.ts      # 工具函数入口
│       └── dist/             # 编译输出
├── myEditor/                 # Vue3 编辑器应用
│   ├── package.json
│   ├── vite.config.ts        # Vite 配置 (端口 5173，启用 CORS)
│   ├── tsconfig.json         # TypeScript 项目引用配置
│   ├── tsconfig.app.json     # 应用 TS 配置 (严格模式)
│   ├── tsconfig.node.json    # Node 环境 TS 配置
│   ├── index.html
│   └── src/
│       ├── main.ts           # 应用入口
│       ├── App.vue
│       ├── style.css
│       ├── router/index.ts   # 路由配置 (5个路由)
│       ├── views/
│       │   ├── EditorView.vue    # JSON 编辑器主页面
│       │   ├── MyFrame.vue       # iframe 手机模拟器
│       │   ├── Preview.vue       # 响应式预览工具
│       │   ├── Render.vue        # 渲染测试页面
│       │   └── DragEditor.vue    # 拖拽式组件编辑器
│       ├── components/HelloWorld.vue
│       └── assets/
└── myViewer/                 # Uni-app 查看器应用
    ├── package.json
    ├── vite.config.ts        # Vite + uni 插件配置
    ├── tsconfig.json         # TypeScript 配置
    ├── index.html
    └── src/
        ├── main.ts           # SSR 应用入口
        ├── App.vue
        ├── manifest.json     # Uni-app 应用配置
        ├── pages.json        # 页面路由配置 (3个页面)
        ├── uni.scss          # 全局样式变量
        ├── env.d.ts          # 环境类型声明
        ├── shime-uni.d.ts    # Uni-app 类型补充
        ├── components/
        │   └── form-renderer/
        │       ├── FormRenderer.vue    # 动态表单渲染器
        │       └── types.ts            # 表单类型定义
        ├── constants/
        │   └── example-schema.ts       # 示例表单配置
        └── pages/
            ├── index/
            │   ├── index.vue         # 主页面（表单展示）
            │   └── components/
            │       └── JsonNode.vue  # JSON 树形组件
            ├── drag/drag.vue         # 拖拽页面
            └── uni-editor/           # 可视化编辑器
                ├── uni-editor.vue
                └── components/
                    └── ComponentPreview.vue
├── server/                   # Express 后台服务
│   ├── package.json
│   ├── tsconfig.json
│   ├── src/
│   │   ├── app.ts            # 应用入口
│   │   ├── routes/           # 路由定义
│   │   ├── controllers/      # 控制器
│   │   └── ...
│   └── .env                  # 环境变量配置
└── flow/                     # LogicFlow 流程图编辑器
    ├── package.json
    ├── vite.config.ts
    ├── src/
    │   ├── main.ts
    │   ├── App.vue
    │   ├── components/
    │   │   ├── LogicFlowPanel.vue    # LogicFlow 画布组件
    │   │   ├── nodes/                # 自定义节点
    │   │   │   ├── MyLogicNode.vue
    │   │   │   ├── StartNode/
    │   │   │   ├── EndNode/
    │   │   │   └── index.ts
    │   │   └── edges/
    │   │       └── InteractiveEdge.ts
    │   └── views/
    │       └── FlowEditor.vue
    └── vite.config.ts
```

## 通信原理

由于浏览器同源策略限制 (`localhost:5173` 和 `localhost:5174` 被视为不同源)，BroadcastChannel 和 localStorage 无法跨端口通信。

**解决方案**: 使用独立的 HTTP 消息服务器作为中转：

```
myEditor (5173) ──HTTP POST──> message-server (3000) <──HTTP GET── myViewer (5174)
                                     │
                              存储最新消息
                              支持长轮询 (30秒超时)
```

### 消息服务器 API

- `POST /send` - 发送消息
  - 请求体: JSON 对象 `{ type: 'form-schema', data: {...}, timestamp: ... }`
  - 响应: `{ success: true }`

- `GET /receive?timestamp={number}` - 接收消息（长轮询）
  - 有新消息时立即返回: `{ hasNewMessage: true, data: {...}, timestamp: ... }`
  - 30秒超时无消息: `{ hasNewMessage: false }`

- `GET /health` - 健康检查
  - 响应: `{ status: 'ok' }`

## 拖拽式组件编辑器

位于 `myEditor/src/views/DragEditor.vue`

**功能特性**:
- **左中右三栏布局**: 左侧组件库、中间舞台、右侧属性面板
- **拖拽添加组件**: 从左侧拖拽 input/button/select 组件到舞台，默认使用 100% 宽度
- **组件宽度设置**: 支持 1/4、1/3、1/2、100% 四种宽度，使用 Flex 布局自动排列
- **选中删除**: 点击组件选中（显示蓝色边框和背景），显示红色删除按钮；点击舞台空白区域取消选中
- **拖拽排序**: 舞台上的组件可以互相拖拽交换位置，目标组件显示绿色虚线边框
- **智能背景**: 组件默认无背景色，只在悬停或选中时显示背景
- **按钮自适应**: 按钮组件宽度自动撑满外层容器

**组件类型**:

| 类型 | 组件 | 说明 |
|------|------|------|
| `input` | ElInput | 文本输入框 |
| `button` | ElButton | 按钮（宽度 100%）|
| `select` | ElSelect | 下拉选择器 |

**核心实现**:

```typescript
// 组件数据结构
interface ComponentItem {
  id: string
  type: 'input' | 'button' | 'select'
  label: string
  width: string // 25%, 33.33%, 50%, 100%
  value?: string
}

// 拖拽添加组件（默认 100% 宽度）
function handleDrop(e: DragEvent) {
  const newComponent: ComponentItem = {
    id: Date.now().toString(),
    type: dragType.value,
    label: getLabelByType(dragType.value),
    width: '100%', // 默认 100% 宽度
  }
  stageComponents.push(newComponent)
}

// 组件拖拽排序
function handleComponentDrop(index: number, e: DragEvent) {
  const sourceIndex = dragSourceIndex.value
  const targetIndex = index
  if (sourceIndex !== targetIndex) {
    const temp = stageComponents[sourceIndex]
    stageComponents.splice(sourceIndex, 1)
    stageComponents.splice(targetIndex, 0, temp)
  }
}

// 点击舞台空白取消选中
function handleStageClick(e: MouseEvent) {
  if (e.target === e.currentTarget) {
    selectedComponent.value = null
  }
}
```

**样式要点**:

```css
/* 默认无背景，hover/selected 时显示 */
.component-wrapper {
  background-color: transparent;
}
.component-wrapper:hover {
  background-color: #f5f7fa;
}
.component-wrapper.selected {
  background-color: #ecf5ff;
}

/* 按钮宽度 100% */
:deep(.component-content .el-button) {
  width: 100%;
}
```

**访问地址**: http://localhost:5173/drag

### DragEditor2 (vue-draggable-plus 版本)

位于 `myEditor/src/views/DragEditor2.vue`

与 DragEditor 功能相同，但使用 **vue-draggable-plus** 库实现舞台内的拖拽排序。

**主要区别**:

| 特性 | DragEditor (原生) | DragEditor2 (vue-draggable-plus) |
|------|------------------|----------------------------------|
| 拖拽库 | 原生 HTML5 Drag API | vue-draggable-plus (SortableJS) |
| 排序方式 | 交换位置 | 平滑拖拽排序 |
| 动画效果 | 无 | 有过渡动画 |
| 实现复杂度 | 较复杂 | 简洁 |

**vue-draggable-plus 用法**:

```vue
<template>
  <VueDraggable
    v-model="stageComponents"
    :animation="200"
    ghost-class="dragging-ghost"
    chosen-class="dragging-chosen"
    drag-class="dragging-item"
    @end="onSortEnd"
  >
    <div v-for="item in stageComponents" :key="item.id">
      <!-- 组件内容 -->
    </div>
  </VueDraggable>
</template>

<script setup>
import { VueDraggable } from 'vue-draggable-plus'
</script>
```

**访问地址**: http://localhost:5173/drag2

---

## 低代码表单渲染器

myViewer 包含一个功能完整的动态表单渲染器，支持以下字段类型：

| 类型 | 说明 | 配置选项 |
|------|------|----------|
| `input` | 文本输入 | placeholder, clearable, prefixIcon, suffixIcon, maxlength |
| `textarea` | 多行文本 | height, count, maxlength, autoHeight |
| `password` | 密码输入 | 同 input |
| `number` | 数字输入 | 同 input |
| `select` | 下拉选择 | options (label, value, disabled) |
| `radio` | 单选框 | options, placement (row/column) |
| `checkbox` | 复选框 | options, placement |
| `switch` | 开关 | activeColor, inactiveColor, activeValue, inactiveValue |
| `date` | 日期选择 | startYear, endYear |
| `datetime` | 日期时间选择 | 同 date |
| `time` | 时间选择 | 同 date |
| `rate` | 评分 | count, activeColor, inactiveColor, allowHalf |
| `slider` | 滑块 | min, max, step, showValue, activeColor, inactiveColor |
| `text` | 纯文本展示 | defaultText |

### 表单 Schema 结构

```typescript
interface FormSchema {
  title?: string;           // 表单标题
  description?: string;     // 表单描述
  model?: string;           // 数据模型名
  fields: FormField[];      // 字段配置数组
  actions?: FormAction[];   // 操作按钮配置
  layout?: FormLayout;      // 布局配置
  rules?: Record<string, ValidationRule[]>;  // 全局验证规则
}

interface FormField {
  type: FieldType;          // 字段类型
  prop: string;             // 字段属性名
  label: string;            // 字段标签
  placeholder?: string;     // 占位提示
  required?: boolean;       // 是否必填
  defaultValue?: any;       // 默认值
  options?: Option[];       // 选项（用于 select/radio/checkbox）
  rules?: ValidationRule[]; // 验证规则
  props?: Record<string, any>;  // 额外属性
  disabled?: boolean;       // 是否禁用
  readonly?: boolean;       // 是否只读
  labelPosition?: 'left' | 'top';  // 标签位置
  labelWidth?: string | number;    // 标签宽度（rpx）
}

interface FormLayout {
  labelPosition?: 'left' | 'top';  // 标签位置
  labelWidth?: string | number;    // 标签宽度（rpx）
  borderBottom?: boolean;          // 是否显示边框
  errorType?: ('message' | 'toast' | 'border-bottom' | 'none')[];
}
```

## 常用命令

### 同时启动所有服务（推荐）
```bash
pnpm run dev
```
这会同时启动：
- 消息服务器: http://localhost:3000
- myEditor: http://localhost:5173
- myViewer: http://localhost:5174

### 单独启动服务

```bash
# 只启动消息服务器
pnpm run server

# 只启动 myEditor
pnpm run dev:editor

# 只启动 myViewer (H5 模式)
pnpm run dev:viewer

# 只启动 Flow 流程编辑器
pnpm run dev:flow

# 只启动 Express 后台服务 (server)
pnpm run dev:server

# 启动 utils 开发模式（自动监听）
pnpm run dev:utils

# 构建 utils（带 sourcemap）
pnpm run build:utils

# 构建 utils（不带 sourcemap）
pnpm run build:utils:no-sourcemap

# 构建 editor 生产版本
pnpm run build:editor

# 构建 viewer H5 生产版本
pnpm run build:viewer

# 构建 viewer 微信小程序
pnpm run build:viewer:mp-weixin
```

### myEditor 命令
```bash
cd myEditor

# 开发模式
pnpm run dev

# 构建生产版本
pnpm run build

# 预览生产版本
pnpm run preview
```

### myViewer 命令
```bash
cd myViewer

# H5 开发模式
pnpm run dev:h5

# 微信小程序开发模式
pnpm run dev:mp-weixin

# H5 生产构建
pnpm run build:h5

# 微信小程序生产构建
pnpm run build:mp-weixin

# 类型检查
pnpm run type-check
```

## 开发工作流程

### 本地开发步骤

1. 安装依赖（在根目录执行）
   ```bash
   pnpm install
   ```

2. 启动所有服务
   ```bash
   pnpm run dev
   ```

3. 打开浏览器访问：
   - 编辑器: http://localhost:5173
   - 查看器: http://localhost:5174

4. 在 myEditor 中输入 JSON Schema 配置，点击"确定"按钮发送

5. 在 myViewer 中查看实时渲染的表单

### 使用示例配置

myViewer 提供了内置的示例表单配置，可在等待数据时加载：
- **标准表单** (labelWidth: 100rpx): 用户注册表单，包含各种字段类型
- **窄标签表单** (labelWidth: 70rpx): 展示窄标签布局效果

### 调试技巧

- 两个应用都显示了调试信息区域，可以查看连接状态
- 消息服务器控制台会输出接收到的消息
- 浏览器开发者工具 Network 面板可查看 HTTP 长轮询请求
- myViewer 支持三种视图切换：表单视图、JSON 视图、Schema 配置视图

## 代码规范

### TypeScript 配置

**myEditor** 使用严格模式：
- `strict: true`
- `noUnusedLocals: true`
- `noUnusedParameters: true`
- `noFallthroughCasesInSwitch: true`
- `erasableSyntaxOnly: true`
- `noUncheckedSideEffectImports: true`

**myViewer** 配置：
- 使用 `@vue/tsconfig/tsconfig.json` 作为基础配置
- 路径别名: `@/*` 映射到 `./src/*`
- 包含 `@dcloudio/types` 和 `uview-pro/types` 类型支持

### Vue 组件风格

1. 使用 Composition API 和 `<script setup>` 语法
2. 组件名使用 PascalCase
3. 布尔类型的 prop 不要带 `is` 前缀
4. 样式使用 scoped，Uni-app 使用 rpx 单位

### 样式规范

**myEditor**:
- 使用常规 CSS 单位 (px, rem)
- 使用 CSS 变量或 SCSS 进行主题管理

**myViewer**:
- 使用 rpx 响应式单位 (1rpx = 0.5px)
- 在 `uni.scss` 中定义全局样式变量
- 遵循 Uni-app 跨平台样式规范

## 平台特定说明

### Uni-app 平台支持

myViewer 支持编译到以下平台：
- H5 (默认)
- 微信小程序 (mp-weixin)
- 支付宝小程序 (mp-alipay)
- 百度小程序 (mp-baidu)
- 抖音小程序 (mp-toutiao)
- QQ小程序 (mp-qq)
- 快手小程序 (mp-kuaishou)
- 飞书小程序 (mp-lark)
- 京东小程序 (mp-jd)
- 鸿蒙 (mp-harmony)
- 快应用 (quickapp-webview)

### 条件编译

如需针对不同平台编写特定代码，使用 Uni-app 条件编译语法：

```vue
<!-- #ifdef H5 -->
<H5 特定代码>
<!-- #endif -->

<!-- #ifdef MP-WEIXIN -->
<微信小程序特定代码>
<!-- #endif -->
```

## 依赖管理

本项目使用 pnpm 作为包管理器：
- 根目录 `package.json` 定义共享脚本
- `pnpm-workspace.yaml` 定义工作区包
- 子包独立管理自己的依赖
- 使用 `pnpm --filter <name>` 在特定包执行命令

### 共享工具库 (@pc-uni-h5/utils)

位于 `packages/utils` 的共享工具库，可被 `myEditor` 和 `myViewer` 共同使用。

**使用方法：**

```typescript
// 在 myEditor 或 myViewer 中导入
import { 
  isPlainObject, 
  isValidJson, 
  formatDate,
  safeJsonParse,
  createMessage,
  // ... 其他工具函数
} from '@pc-uni-h5/utils';
```

**包含的工具函数：**

| 类别 | 函数 | 说明 |
|------|------|------|
| 类型检查 | `isPlainObject` | 检查是否为纯对象 |
| | `isValidJson` | 检查是否为有效 JSON 字符串 |
| | `isValidMessage` | 验证消息数据结构 |
| 日期处理 | `formatDate` | 格式化日期为本地字符串 |
| 字符串 | `truncate` | 截断字符串并添加省略号 |
| | `camelToKebab` | 驼峰转短横线 |
| JSON | `safeJsonParse` | 安全解析 JSON |
| | `prettyPrintJson` | 美化打印 JSON |
| | `deepClone` | 深拷贝对象 |
| 数组 | `unique` | 数组去重 |
| | `groupBy` | 按 key 分组 |
| 消息通信 | `createMessage` | 创建消息数据 |
| | `MessageData` | 消息数据类型定义 |

**开发 workflow：**

```bash
# 修改 utils 后重新编译（带 sourcemap）
pnpm --filter @pc-uni-h5/utils run build

# 生产构建（不带 sourcemap）
pnpm --filter @pc-uni-h5/utils run build:no-sourcemap

# 或开启监听模式
pnpm --filter @pc-uni-h5/utils run dev
```

## 安全考虑

1. **CORS**: 消息服务器允许所有跨域请求 (`*`)，仅用于本地开发
2. **输入验证**: myEditor 会对 JSON 输入进行格式验证
3. **XSS**: myViewer 使用 Vue 模板渲染，自动转义 HTML
4. **内存存储**: 消息服务器只保存最新一条消息，重启后丢失
5. **生产环境**: 当前架构仅适用于本地开发，生产环境需要额外的安全措施

## 注意事项

1. **消息服务器必须运行**: 否则两个应用无法通信
2. **端口占用**: 确保 3000、3001、5173、5174、5175 端口未被占用
   - 3000: message-server (消息服务器)
   - 3001: server (Express 后台服务)
   - 5173: myEditor (编辑器)
   - 5174: myViewer (查看器)
   - 5175: flow (流程图编辑器)
3. **CORS 配置**: myEditor 的 Vite 配置已启用 CORS
4. **长轮询机制**: myViewer 使用 30 秒超时的长轮询，错误时会 5 秒后重试
5. **iframe 通信**: myEditor 的 Preview 和 MyFrame 视图支持通过 iframe 嵌套 myViewer，可用于 postMessage 通信测试

---

# Flow 项目说明

## 项目概述

Flow 是一个基于 **LogicFlow** 的流程图编辑器，用于可视化编辑流程图，支持自定义节点和边。

**运行端口**: 5175

**访问地址**: http://localhost:5175

## 技术栈

- **框架**: Vue 3 + TypeScript
- **流程图引擎**: LogicFlow 2.x (@logicflow/core, @logicflow/extension)
- **节点注册**: @logicflow/vue-node-registry
- **UI 组件库**: Ant Design Vue 4.x
- **构建工具**: Vite 8.x

## 项目结构

```
flow/
├── src/
│   ├── components/
│   │   ├── LogicFlowPanel.vue      # LogicFlow 画布组件
│   │   ├── nodes/                  # 自定义节点
│   │   │   ├── MyLogicNode.vue     # 通用逻辑节点
│   │   │   ├── StartNode/          # 开始节点
│   │   │   ├── EndNode/            # 结束节点
│   │   │   └── index.ts            # 节点导出
│   │   └── edges/                  # 自定义边
│   │       └── InteractiveEdge.ts  # 交互式边（带红色圆圈）
│   ├── views/
│   │   └── FlowEditor.vue          # 流程编辑器主页面
│   └── main.ts
├── package.json
└── vite.config.ts
```

## 自定义边实现

### InteractiveEdge - 交互式边

位于 `flow/src/components/edges/InteractiveEdge.ts`

**功能特点**:
- 继承 `PolylineEdge` / `PolylineEdgeModel`
- 隐藏默认文本 (`textMode = 'none'`)
- 选中时显示红色圆圈按钮
- 点击圆圈触发 `edge:circle-click` 事件

**核心实现**:

```typescript
// Model 类 - 隐藏文本
export class InteractiveEdgeModel extends PolylineEdgeModel {
  initEdgeData(data: any): void {
    super.initEdgeData(data);
    this.textMode = 'none';
  }
}

// View 类 - 选中时显示红色圆圈
export class InteractiveEdgeView extends PolylineEdge {
  /**
   * 重写 getAppendWidth - LogicFlow 推荐的方式
   * 用于自定义边的选区和交互元素
   */
  getAppendWidth(): any {
    const { model, graphModel } = this.props;
    // 获取父类的选区（透明点击区域）
    const baseAppend = super.getAppendWidth();
    
    if (!model.isSelected) return baseAppend;
    
    
    const points = model.pointsList || [];
    if (points.length < 2) return baseAppend;
    
    const center = this.getCenter(points);
    const r = 10;
    
    // 红色圆圈（交互按钮）
    const redCircle = h('g', {
      class: 'interactive-edge-button',
    }, [
      // 透明点击区
      h('circle', {
        cx: center.x, cy: center.y, r: r + 5,
        fill: 'transparent', cursor: 'pointer',

        onClick: (e: Event) => {
          e.stopPropagation();
          graphModel.eventCenter.emit('edge:circle-click', { 
            data: model.getData() 
          });
        },
      }),
      // 可见红圈
      h('circle', {
        cx: center.x, cy: center.y, r,
        fill: '#ff4d4f', stroke: '#fff', 'stroke-width': 2,
        style: { pointerEvents: 'none' },
      }),
    ]);
    
    // 合并原有选区和红圈
    // 注意：红圈放在后面，确保在 DOM 中位于上层
    if (baseAppend) {
      return h('g', {}, [baseAppend, redCircle]);
    }
    return redCircle;
  }
}
```

**关键技术点**:

1. **getAppendWidth() 方法**: LogicFlow 推荐的重写方法，用于自定义边的选区和交互元素

2. **pointerEvents 处理**:
   - 透明点击区: 直接接收点击事件
   - 可见红圈: `pointerEvents: 'none'` 让事件穿透到下层

3. **事件通信**: 通过 `graphModel.eventCenter.emit()` 触发事件，在 `LogicFlowPanel.vue` 中监听

4. **合并渲染**: 先调用 `super.getAppendWidth()` 保留原有选区功能，再添加红圈

## 使用方式

```typescript
// 注册自定义边
lf.register(InteractiveEdge);
lf.setDefaultEdgeType('interactive-edge');

// 监听圆圈点击事件
lf.on('edge:circle-click', ({ data }) => {
  console.log('圆圈被点击', data.id);
});
```

## 常用命令

```bash
# 启动 Flow 项目
cd flow
pnpm run dev

# 类型检查
cd flow
npx vue-tsc --noEmit
```
