import { query, execute } from '../db/index.js';
import { ResultSetHeader } from 'mysql2';

// 用户接口定义
export interface User {
  id: number;
  username: string;
  email: string;
  phone?: string;
  avatar?: string;
  status: number; // 0: 禁用, 1: 启用
  created_at: Date;
  updated_at: Date;
}

// 创建用户参数
export interface CreateUserParams {
  username: string;
  email: string;
  phone?: string;
  avatar?: string;
  password: string;
  status?: number;
}

// 更新用户参数
export interface UpdateUserParams {
  username?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  password?: string;
  status?: number;
}

// 用户模型类
export class UserModel {
  // 根据 ID 查找用户
  static async findById(id: number): Promise<User | null> {
    const users = await query<User>('SELECT * FROM users WHERE id = ?', [id]);
    return users[0] || null;
  }

  // 根据用户名查找用户
  static async findByUsername(username: string): Promise<User | null> {
    const users = await query<User>('SELECT * FROM users WHERE username = ?', [username]);
    return users[0] || null;
  }

  // 根据邮箱查找用户
  static async findByEmail(email: string): Promise<User | null> {
    const users = await query<User>('SELECT * FROM users WHERE email = ?', [email]);
    return users[0] || null;
  }

  // 获取所有用户（支持分页）
  static async findAll(page = 1, pageSize = 10): Promise<{ list: User[]; total: number }> {
    const offset = (page - 1) * pageSize;
    
    const [list, totalResult] = await Promise.all([
      query<User>('SELECT * FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?', [
        pageSize,
        offset,
      ]),
      query<{ total: number }>('SELECT COUNT(*) as total FROM users'),
    ]);

    return {
      list,
      total: totalResult[0]?.total || 0,
    };
  }

  // 创建用户
  static async create(params: CreateUserParams): Promise<number> {
    const { username, email, phone, avatar, password, status = 1 } = params;
    
    const result = await execute(
      `INSERT INTO users (username, email, phone, avatar, password, status, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [username, email, phone || null, avatar || null, password, status]
    );

    return result.insertId;
  }

  // 更新用户
  static async update(id: number, params: UpdateUserParams): Promise<boolean> {
    const fields: string[] = [];
    const values: any[] = [];

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (fields.length === 0) return false;

    fields.push('updated_at = NOW()');
    values.push(id);

    const result = await execute(
      `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return result.affectedRows > 0;
  }

  // 删除用户
  static async delete(id: number): Promise<boolean> {
    const result = await execute('DELETE FROM users WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  // 更新用户状态
  static async updateStatus(id: number, status: number): Promise<boolean> {
    const result = await execute(
      'UPDATE users SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, id]
    );
    return result.affectedRows > 0;
  }
}

export default UserModel;
