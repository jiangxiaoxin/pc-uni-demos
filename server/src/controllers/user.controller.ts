import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import UserModel from '../models/user.model.js';
import { success, error, paginated, PaginatedData } from '../utils/response.js';
import { AppError } from '../middleware/errorHandler.js';

// 获取用户列表
export async function getUsers(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;

    const { list, total } = await UserModel.findAll(page, pageSize);

    const data: PaginatedData<typeof list[0]> = {
      list,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };

    paginated(res, data, '获取用户列表成功');
  } catch (err) {
    next(err);
  }
}

// 获取单个用户
export async function getUserById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = parseInt(req.params.id, 10);
    
    if (isNaN(id)) {
      throw new AppError('无效的用户ID', 400, 400);
    }

    const user = await UserModel.findById(id);

    if (!user) {
      throw new AppError('用户不存在', 404, 404);
    }

    success(res, user, '获取用户成功');
  } catch (err) {
    next(err);
  }
}

// 创建用户
export async function createUser(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // 验证请求参数
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(errors.array()[0].msg, 400, 400);
    }

    const { username, email, phone, password, status } = req.body;

    // 检查用户名是否已存在
    const existingUser = await UserModel.findByUsername(username);
    if (existingUser) {
      throw new AppError('用户名已存在', 400, 400);
    }

    // 检查邮箱是否已存在
    const existingEmail = await UserModel.findByEmail(email);
    if (existingEmail) {
      throw new AppError('邮箱已被使用', 400, 400);
    }

    // 创建用户（实际项目中需要对密码进行加密）
    const userId = await UserModel.create({
      username,
      email,
      phone,
      password, // TODO: 使用 bcrypt 加密
      status: status || 1,
    });

    const newUser = await UserModel.findById(userId);
    success(res, newUser, '创建用户成功', 201);
  } catch (err) {
    next(err);
  }
}

// 更新用户
export async function updateUser(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = parseInt(req.params.id, 10);
    
    if (isNaN(id)) {
      throw new AppError('无效的用户ID', 400, 400);
    }

    const user = await UserModel.findById(id);
    if (!user) {
      throw new AppError('用户不存在', 404, 404);
    }

    const { username, email, phone, avatar, status } = req.body;

    // 如果修改了用户名，检查是否已存在
    if (username && username !== user.username) {
      const existingUser = await UserModel.findByUsername(username);
      if (existingUser) {
        throw new AppError('用户名已存在', 400, 400);
      }
    }

    // 如果修改了邮箱，检查是否已存在
    if (email && email !== user.email) {
      const existingEmail = await UserModel.findByEmail(email);
      if (existingEmail) {
        throw new AppError('邮箱已被使用', 400, 400);
      }
    }

    const updated = await UserModel.update(id, {
      username,
      email,
      phone,
      avatar,
      status,
    });

    if (!updated) {
      throw new AppError('更新用户失败', 500, 500);
    }

    const updatedUser = await UserModel.findById(id);
    success(res, updatedUser, '更新用户成功');
  } catch (err) {
    next(err);
  }
}

// 删除用户
export async function deleteUser(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = parseInt(req.params.id, 10);
    
    if (isNaN(id)) {
      throw new AppError('无效的用户ID', 400, 400);
    }

    const user = await UserModel.findById(id);
    if (!user) {
      throw new AppError('用户不存在', 404, 404);
    }

    const deleted = await UserModel.delete(id);
    
    if (!deleted) {
      throw new AppError('删除用户失败', 500, 500);
    }

    success(res, null, '删除用户成功');
  } catch (err) {
    next(err);
  }
}

// 更新用户状态
export async function updateUserStatus(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = parseInt(req.params.id, 10);
    const { status } = req.body;
    
    if (isNaN(id)) {
      throw new AppError('无效的用户ID', 400, 400);
    }

    if (status !== 0 && status !== 1) {
      throw new AppError('状态值无效', 400, 400);
    }

    const user = await UserModel.findById(id);
    if (!user) {
      throw new AppError('用户不存在', 404, 404);
    }

    const updated = await UserModel.updateStatus(id, status);
    
    if (!updated) {
      throw new AppError('更新状态失败', 500, 500);
    }

    success(res, { id, status }, '更新状态成功');
  } catch (err) {
    next(err);
  }
}

export default {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateUserStatus,
};
