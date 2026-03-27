import { Router, Request, Response } from 'express';
import userRoutes from './user.routes.js';
import { success } from '../utils/response.js';

const router = Router();

// API 健康检查
router.get('/health', (req: Request, res: Response) => {
  success(res, {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  }, '服务正常运行');
});

// 用户相关路由
router.use('/users', userRoutes);

// 你可以在这里添加更多路由
// router.use('/posts', postRoutes);
// router.use('/comments', commentRoutes);

export default router;
