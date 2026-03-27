import { Request, Response, NextFunction } from 'express';
import { error } from '../utils/response.js';

// 自定义错误类
export class AppError extends Error {
  public statusCode: number;
  public code: number;

  constructor(message: string, statusCode = 500, code = 500) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

// 404 错误处理
export function notFoundHandler(req: Request, res: Response, next: NextFunction): void {
  error(res, `路由不存在: ${req.originalUrl}`, 404, 404);
}

// 全局错误处理
export function globalErrorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error('Error:', err);

  if (err instanceof AppError) {
    error(res, err.message, err.code, err.statusCode);
    return;
  }

  // MySQL 错误处理
  if (err.name === 'Error' && err.message.includes('ER_')) {
    error(res, '数据库操作失败', 500, 500);
    return;
  }

  // 默认错误响应
  error(res, err.message || '服务器内部错误', 500, 500);
}

export default {
  notFoundHandler,
  globalErrorHandler,
  AppError,
};
