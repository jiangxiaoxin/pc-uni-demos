import mysql from 'mysql2/promise';
import config from '../config/index.js';

// 创建数据库连接池
const pool = mysql.createPool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  waitForConnections: config.db.waitForConnections,
  connectionLimit: config.db.connectionLimit,
  queueLimit: config.db.queueLimit,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

// 测试数据库连接
export async function testConnection(): Promise<void> {
  try {
    const connection = await pool.getConnection();
    console.log('✅ 数据库连接成功');
    connection.release();
  } catch (error) {
    console.error('❌ 数据库连接失败:', error);
    throw error;
  }
}

// 执行 SQL 查询
export async function query<T = any>(sql: string, values?: any[]): Promise<T[]> {
  const [rows] = await pool.execute(sql, values);
  return rows as T[];
}

// 执行 SQL 插入/更新/删除
export async function execute(sql: string, values?: any[]): Promise<mysql.ResultSetHeader> {
  const [result] = await pool.execute(sql, values);
  return result as mysql.ResultSetHeader;
}

// 获取事务连接
export async function getConnection(): Promise<mysql.PoolConnection> {
  return await pool.getConnection();
}

// 导出连接池
export { pool };

export default pool;
