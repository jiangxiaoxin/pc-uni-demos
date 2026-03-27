# PC-UNI-H5 项目

这是一个 pnpm 管理的 monorepo 项目，包含两个前端应用：

## 项目结构

```
pc-uni-h5/
├── pnpm-workspace.yaml    # pnpm 工作区配置
├── package.json           # 根目录配置
├── message-server.js      # 消息中转服务器
├── myEditor/             # Vue3 + Vite + TS + Vue-router 编辑器
│   ├── src/
│   │   └── views/
│   │       └── EditorView.vue    # JSON 编辑器页面
│   ├── package.json
│   └── vite.config.ts            # 端口 5173
└── myViewer/             # Uni-app 查看器
    ├── src/
    │   └── pages/
    │       └── index/
    │           ├── index.vue              # 主页
    │           └── components/
    │               └── JsonNode.vue       # JSON 树形组件
    ├── package.json
    └── pages.json
```

## 技术栈

- **myEditor**: Vue 3 + Vite + TypeScript + Vue Router
- **myViewer**: Uni-app + Vue 3 + TypeScript
- **通信方式**: HTTP 长轮询（通过 message-server.js）
- **包管理**: pnpm workspaces

## 通信原理

由于浏览器同源策略限制（`localhost:5173` 和 `localhost:5174` 被视为不同源），BroadcastChannel 和 localStorage 无法跨端口通信。

**解决方案**: 使用独立的 HTTP 消息服务器作为中转：

```
myEditor (5173) ──HTTP POST──> message-server (3000) <──HTTP GET── myViewer (5174)
                                     │
                              存储最新消息
                              支持长轮询
```

## 启动项目

### 同时启动所有服务（推荐）

```bash
pnpm run dev
```

这会同时启动：
- 消息服务器: http://localhost:3000
- myEditor: http://localhost:5173
- myViewer: http://localhost:5174

### 单独启动

```bash
# 只启动消息服务器
pnpm run server

# 只启动 myEditor
pnpm run dev:editor

# 只启动 myViewer
pnpm run dev:viewer
```

## 使用说明

1. 打开 http://localhost:5173（myEditor）
2. 打开 http://localhost:5174（myViewer）
3. 在 myEditor 的 textarea 中输入 JSON 数据，例如：
   ```json
   {
     "name": "张三",
     "age": 25,
     "hobbies": ["读书", "编程", "旅游"],
     "address": {
       "city": "北京",
       "zip": "100000"
     }
   }
   ```
4. 点击"确定"按钮
5. myViewer 会实时显示接收到的 JSON 数据

## 注意事项

- 消息服务器必须在运行状态，否则无法通信
- myViewer 使用长轮询（Long Polling）机制实时接收消息
- 消息服务器只保存最新的消息，刷新页面后会从最新消息开始接收
