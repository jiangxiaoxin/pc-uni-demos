import { Router } from 'express';
import { body } from 'express-validator';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateUserStatus,
} from '../controllers/user.controller.js';

const router = Router();

// 用户验证规则
const createUserValidation = [
  body('username')
    .notEmpty()
    .withMessage('用户名不能为空')
    .isLength({ min: 3, max: 20 })
    .withMessage('用户名长度应在3-20个字符之间'),
  body('email')
    .notEmpty()
    .withMessage('邮箱不能为空')
    .isEmail()
    .withMessage('邮箱格式不正确'),
  body('password')
    .notEmpty()
    .withMessage('密码不能为空')
    .isLength({ min: 6 })
    .withMessage('密码长度至少为6个字符'),
  body('phone').optional().isMobilePhone('zh-CN').withMessage('手机号格式不正确'),
];

const updateUserValidation = [
  body('username')
    .optional()
    .isLength({ min: 3, max: 20 })
    .withMessage('用户名长度应在3-20个字符之间'),
  body('email').optional().isEmail().withMessage('邮箱格式不正确'),
  body('phone').optional().isMobilePhone('zh-CN').withMessage('手机号格式不正确'),
  body('status').optional().isIn([0, 1]).withMessage('状态值只能是0或1'),
];

// 路由定义
router.get('/', getUsers);                          // 获取用户列表
router.get('/:id', getUserById);                    // 获取单个用户
router.post('/', createUserValidation, createUser); // 创建用户
router.put('/:id', updateUserValidation, updateUser); // 更新用户
router.delete('/:id', deleteUser);                  // 删除用户
router.patch('/:id/status', updateUserStatus);      // 更新用户状态

export default router;
