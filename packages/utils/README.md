# @pc-uni-h5/utils

PC-UNI-H5 项目的共享工具库，供 myEditor 和 myViewer 共同使用。

## 安装

已在根目录通过 pnpm workspace 配置，无需单独安装。

## 可用命令

### 从根目录运行（推荐）

```bash
# 开发模式（带 sourcemap，自动监听文件变化）
pnpm run dev:utils

# 生产构建（带 sourcemap）
pnpm run build:utils

# 生产构建（不带 sourcemap）
pnpm run build:utils:no-sourcemap
```

### 在 utils 目录内运行

```bash
# 进入 utils 目录
cd packages/utils

# 开发模式（带 sourcemap，自动监听）
pnpm run dev

# 生产构建（带 sourcemap）
pnpm run build

# 生产构建（不带 sourcemap）
pnpm run build:no-sourcemap
```

## 命令说明

| 命令 | sourcemap | 用途 |
|------|-----------|------|
| `dev` / `dev:utils` | ✅ 有 | 开发调试，支持文件监听自动编译 |
| `build` / `build:utils` | ✅ 有 | 生产构建，保留 sourcemap 便于调试 |
| `build:no-sourcemap` / `build:utils:no-sourcemap` | ❌ 无 | 生产构建，移除 sourcemap 减小体积 |

## 使用示例

```typescript
// 在 myEditor 或 myViewer 中导入使用
import { 
  isPlainObject,
  isValidJson,
  formatDate,
  safeJsonParse,
  prettyPrintJson,
  deepClone,
  unique,
  groupBy,
  createMessage,
  isValidMessage,
  type MessageData
} from '@pc-uni-h5/utils';

// 类型检查
isPlainObject({}); // true
isValidJson('{"a":1}'); // true

// JSON 处理
const obj = safeJsonParse('{"a":1}', {});
const pretty = prettyPrintJson({a: 1, b: 2});
const cloned = deepClone({nested: {value: 1}});

// 日期格式化
formatDate(new Date(), 'short');  // "03/18 11:30:45"
formatDate(new Date(), 'long');   // "2026年03月18日 星期二 11:30:45"

// 数组工具
unique([1, 2, 2, 3]); // [1, 2, 3]
groupBy([{type: 'a', val: 1}, {type: 'b', val: 2}], item => item.type);

// 消息通信
const message = createMessage('json-data', {key: 'value'});
isValidMessage(message); // true
```

## 工具函数列表

### 类型检查
- `isPlainObject(value)` - 检查是否为纯对象
- `isValidJson(value)` - 检查是否为有效 JSON 字符串
- `isValidMessage(data)` - 验证消息数据结构

### 日期处理
- `formatDate(date, format)` - 格式化日期为本地字符串

### 字符串工具
- `truncate(str, maxLength)` - 截断字符串并添加省略号
- `camelToKebab(str)` - 驼峰命名转短横线命名

### JSON 工具
- `safeJsonParse<T>(json, fallback)` - 安全解析 JSON，失败返回 fallback
- `prettyPrintJson(obj, indent)` - 美化打印 JSON
- `deepClone<T>(obj)` - 深拷贝对象（使用 JSON 序列化）

### 数组工具
- `unique<T>(arr)` - 数组去重
- `groupBy<T>(arr, keyFn)` - 按 key 函数分组

### 消息通信
- `createMessage(type, data)` - 创建标准消息对象
- `MessageData` - 消息数据类型接口

## 注意事项

1. `deepClone` 使用 JSON 序列化实现，不支持函数、undefined、循环引用
2. 修改源码后需要重新编译才能在 myEditor/myViewer 中生效
3. 开发时建议使用 `pnpm run dev:utils` 开启监听模式
