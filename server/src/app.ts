import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import config from './config/index.js';
import { testConnection } from './db/index.js';
import routes from './routes/index.js';
import { notFoundHandler, globalErrorHandler } from './middleware/errorHandler.js';

// 创建 Express 应用
const app = express();

// 中间件配置
app.use(helmet()); // 安全头
app.use(cors({ origin: config.corsOrigin })); // 跨域
app.use(morgan(config.nodeEnv === 'development' ? 'dev' : 'combined')); // 日志
app.use(express.json({ limit: '10mb' })); // JSON 解析
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // URL 编码解析

// API 路由
app.use('/api', routes);

// 根路由
app.get('/', (req, res) => {
  res.json({
    name: '@pc-uni-h5/server',
    version: '1.0.0',
    description: 'Express + MySQL 后台服务',
    documentation: '/api/health',
  });
});

// 404 处理
app.use(notFoundHandler);

// 全局错误处理
app.use(globalErrorHandler);

// 启动服务器
async function startServer(): Promise<void> {
  try {
    // 测试数据库连接
    await testConnection();

    // 启动 HTTP 服务
    app.listen(config.port, () => {
      console.log(`🚀 服务器启动成功`);
      console.log(`📍 本地访问: http://localhost:${config.port}`);
      console.log(`📍 API 地址: http://localhost:${config.port}/api`);
      console.log(`📍 健康检查: http://localhost:${config.port}/api/health`);
      console.log(`📝 环境: ${config.nodeEnv}`);
    });
  } catch (error) {
    console.error('❌ 服务器启动失败:', error);
    process.exit(1);
  }
}

// 处理未捕获的异常
process.on('uncaughtException', (err) => {
  console.error('未捕获的异常:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的 Promise 拒绝:', promise, '原因:', reason);
  process.exit(1);
});

// 启动服务
startServer();

export default app;
