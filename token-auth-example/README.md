# 双 Token 认证示例

本项目演示了 **Access Token + Refresh Token** 的双 Token 认证机制，实现了 Token 自动刷新和请求队列管理。

## 核心特性

✅ **Access Token 过期自动刷新** - 使用 Refresh Token 获取新 Token  
✅ **请求队列管理** - 刷新期间的其他请求会排队等待，刷新成功后自动重试  
✅ **防止重复刷新** - 多个并发请求只触发一次刷新  
✅ **刷新失败处理** - 队列中的所有请求都被拒绝，并提示用户重新登录  
✅ **无感刷新** - 对用户透明，自动完成 Token 更新  

## 项目结构

```
token-auth-example/
├── server.js          # 后端服务（Express + JWT）
├── request.js         # 前端请求封装（Axios 拦截器）
├── test.html          # 测试页面
├── package.json       # 依赖配置
└── README.md          # 本文档
```

## 快速开始

### 1. 安装依赖

```bash
cd token-auth-example
npm install
```

### 2. 启动后端服务

```bash
npm run server
```

服务将运行在 http://localhost:3001

### 3. 打开测试页面

使用浏览器直接打开 `test.html` 文件（建议使用 Live Server 插件）。

## 测试场景

### 场景 1：正常流程

1. 点击"登录"按钮（默认用户名/密码：admin/123456）
2. 观察 Access Token 的过期时间（15秒）
3. 在过期前点击"获取用户信息"，应该成功

### 场景 2：Token 过期自动刷新

1. 登录后等待 15 秒（或看 Token 显示已过期）
2. 点击"获取用户信息"
3. 观察日志：
   - 首先提示 Token 过期
   - 然后触发刷新
   - 刷新成功后自动重试原请求
   - 最终获取成功

### 场景 3：并发请求测试（重点）

1. 登录后等待 Token 过期（15秒）
2. 点击"发送 5 个并发请求"
3. 观察日志：
   - 5 个请求几乎同时发出
   - **只触发一次刷新请求**（关键！）
   - 其他 4 个请求排队等待
   - 刷新成功后，所有 5 个请求自动重试并成功

### 场景 4：Refresh Token 过期

1. 修改 `server.js` 中的 `REFRESH_TOKEN_EXPIRY` 为 `'1s'`（方便测试）
2. 重启服务器
3. 登录后等待超过 1 秒
4. 触发请求，此时 Refresh Token 也过期了
5. 观察：
   - 刷新失败
   - 所有队列中的请求都被拒绝
   - 弹出提示"登录已过期，请重新登录"
   - Token 被清除

## 核心代码解析

### 后端（server.js）

```javascript
// Access Token 有效期 15 秒（实际项目中通常是 15 分钟）
const ACCESS_TOKEN_EXPIRY = '15s';

// Refresh Token 有效期 7 天
const REFRESH_TOKEN_EXPIRY = '7d';

// 刷新接口 - 验证 Refresh Token，返回新的 Token 对
app.post('/api/refresh', (req, res) => {
  // 验证 refreshToken...
  // 生成新的 accessToken 和 refreshToken
  // 删除旧的 refreshToken，添加新的（Token 轮换）
});
```

### 前端（request.js）

#### 关键状态管理

```javascript
let isRefreshing = false;        // 是否正在刷新
let refreshSubscribers = [];     // 等待刷新完成的请求队列
```

#### 请求拦截器

```javascript
request.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;
    
    // 判断是否是 Token 过期
    const isTokenExpired = error.response?.status === 401 && 
                           error.response?.data?.code === 401001;
    
    if (!isTokenExpired) {
      return Promise.reject(error);
    }
    
    // 情况 1：正在刷新中，加入队列等待
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        addRefreshSubscriber((newToken, error) => {
          if (error) reject(error);  // 刷新失败
          else {
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
            resolve(request(originalRequest));  // 刷新成功，重试
          }
        });
      });
    }
    
    // 情况 2：开始刷新
    isRefreshing = true;
    
    try {
      const newToken = await doRefreshToken();
      notifySubscribers(newToken);  // 通知队列中所有请求
      isRefreshing = false;
      
      // 重试当前请求
      originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
      return request(originalRequest);
    } catch (refreshError) {
      rejectSubscribers(refreshError);  // 通知所有请求刷新失败
      isRefreshing = false;
      return Promise.reject(refreshError);
    }
  }
);
```

## 流程图

```
请求 1 ─┐
请求 2 ─┼──┬──> Token 过期？──> 是 ──> 正在刷新？
请求 3 ─┘  │                          ├──> 是 ──> 加入队列等待
           │                          └──> 否 ──> 开始刷新
           │                                        │
           │                              刷新成功/失败
           │                                    │
           │                              通知队列中所有请求
           │                                    │
           └────────────────────────────────────┘
           重试原请求 / 返回错误
```

## 生产环境建议

1. **Token 有效期**
   - Access Token：15-30 分钟
   - Refresh Token：7-30 天

2. **安全性**
   - 使用 HTTPS
   - Refresh Token 使用 httpOnly Cookie 存储
   - 实现 Token 黑名单机制（退出登录时使 Refresh Token 失效）

3. **用户体验**
   - 在 Access Token 即将过期前主动刷新
   - 提供"记住我"功能（延长 Refresh Token 有效期）

## 许可证

MIT
