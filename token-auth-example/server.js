/**
 * 双 Token 认证后端示例
 * 使用 Express + jsonwebtoken
 */

import express from 'express';
import jwt from 'jsonwebtoken';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors());

// 提供静态文件服务（让 test.html 可以直接访问）
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.static(__dirname));

// 根路径重定向到 test.html
app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'test.html'));
});

// 密钥
const ACCESS_TOKEN_SECRET = 'access-secret-key-change-in-production';
const REFRESH_TOKEN_SECRET = 'refresh-secret-key-change-in-production';

// Token 有效期
const ACCESS_TOKEN_EXPIRY = '15s'; // 15秒，方便测试
const REFRESH_TOKEN_EXPIRY = '7d'; // 7天

// 模拟数据库：存储用户信息
const users = [
  { id: 1, username: 'admin', password: '123456' }
];

// 模拟数据库：存储有效的 refreshToken
let validRefreshTokens = new Set();

/**
 * 生成 Access Token
 */
function generateAccessToken(user) {
  return jwt.sign(
    { userId: user.id, username: user.username, type: 'access' },
    ACCESS_TOKEN_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
}

/**
 * 生成 Refresh Token
 */
function generateRefreshToken(user) {
  return jwt.sign(
    { userId: user.id, username: user.username, type: 'refresh' },
    REFRESH_TOKEN_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );
}

/**
 * 验证 Access Token 中间件
 */
function authenticateAccessToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ code: 401, message: '未提供 Access Token' });
  }

  jwt.verify(token, ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          code: 401001, // 特殊错误码表示 token 过期
          message: 'Access Token 已过期' 
        });
      }
      return res.status(403).json({ code: 403, message: '无效的 Access Token' });
    }
    req.user = decoded;
    next();
  });
}

// ========== 路由 ==========

/**
 * 登录接口
 * POST /api/login
 */
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  const user = users.find(u => u.username === username && u.password === password);
  
  if (!user) {
    return res.status(401).json({ code: 401, message: '用户名或密码错误' });
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  
  // 存储 refreshToken
  validRefreshTokens.add(refreshToken);

  res.json({
    code: 200,
    message: '登录成功',
    data: {
      accessToken,
      refreshToken,
      accessTokenExpiry: 15, // 15秒
      user: { id: user.id, username: user.username }
    }
  });
});

/**
 * 刷新 Token 接口
 * POST /api/refresh
 */
app.post('/api/refresh', (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ code: 401, message: '未提供 Refresh Token' });
  }

  // 检查 refreshToken 是否有效
  if (!validRefreshTokens.has(refreshToken)) {
    return res.status(403).json({ 
      code: 403, 
      message: 'Refresh Token 已失效，请重新登录' 
    });
  }

  jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      // 删除无效的 refreshToken
      validRefreshTokens.delete(refreshToken);
      
      if (err.name === 'TokenExpiredError') {
        return res.status(403).json({ 
          code: 403001, 
          message: 'Refresh Token 已过期，请重新登录' 
        });
      }
      return res.status(403).json({ 
        code: 403, 
        message: '无效的 Refresh Token' 
      });
    }

    // 生成新的 token 对
    const user = { id: decoded.userId, username: decoded.username };
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    // 删除旧的 refreshToken，添加新的
    validRefreshTokens.delete(refreshToken);
    validRefreshTokens.add(newRefreshToken);

    res.json({
      code: 200,
      message: '刷新成功',
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        accessTokenExpiry: 15
      }
    });
  });
});

/**
 * 退出登录
 * POST /api/logout
 */
app.post('/api/logout', authenticateAccessToken, (req, res) => {
  const { refreshToken } = req.body;
  if (refreshToken) {
    validRefreshTokens.delete(refreshToken);
  }
  res.json({ code: 200, message: '退出成功' });
});

/**
 * 受保护的接口：获取用户信息
 * GET /api/user/info
 */
app.get('/api/user/info', authenticateAccessToken, (req, res) => {
  res.json({
    code: 200,
    message: '获取成功',
    data: {
      userId: req.user.userId,
      username: req.user.username
    }
  });
});

/**
 * 受保护的接口：获取指定用户信息（用于测试并发请求）
 * GET /api/user/:id
 */
app.get('/api/user/:id', authenticateAccessToken, (req, res) => {
  const userId = req.params.id;
  res.json({
    code: 200,
    message: '获取成功',
    data: {
      userId: userId,
      username: `user_${userId}`,
      email: `user${userId}@example.com`,
      timestamp: new Date().toISOString()
    }
  });
});

/**
 * 受保护的接口：获取列表数据
 * GET /api/data/list
 */
app.get('/api/data/list', authenticateAccessToken, (req, res) => {
  res.json({
    code: 200,
    message: '获取成功',
    data: [
      { id: 1, name: 'Item 1', timestamp: new Date().toISOString() },
      { id: 2, name: 'Item 2', timestamp: new Date().toISOString() },
      { id: 3, name: 'Item 3', timestamp: new Date().toISOString() }
    ]
  });
});

/**
 * 受保护的接口：提交数据
 * POST /api/data/submit
 */
app.post('/api/data/submit', authenticateAccessToken, (req, res) => {
  const { content } = req.body;
  res.json({
    code: 200,
    message: '提交成功',
    data: {
      id: Date.now(),
      content,
      timestamp: new Date().toISOString()
    }
  });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 双 Token 认证服务器运行在 http://localhost:${PORT}`);
  console.log('');
  console.log('可用接口：');
  console.log('  POST /api/login      - 登录');
  console.log('  POST /api/refresh    - 刷新 Token');
  console.log('  POST /api/logout     - 退出登录');
  console.log('  GET  /api/user/info  - 获取用户信息（需要认证）');
  console.log('  GET  /api/data/list  - 获取列表（需要认证）');
  console.log('  POST /api/data/submit- 提交数据（需要认证）');
});
