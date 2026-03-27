// 数据库初始化脚本 - 使用 Node.js 创建数据库和表
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const DB_CONFIG = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'helloca',
};

const DB_NAME = 'formeditor';

async function initDatabase() {
  let connection;
  
  try {
    console.log('🔄 正在连接 MySQL...');
    
    // 先连接 MySQL（不指定数据库）
    connection = await mysql.createConnection(DB_CONFIG);
    console.log('✅ MySQL 连接成功');
    
    // 创建数据库
    console.log(`🔄 创建数据库: ${DB_NAME}...`);
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS ${DB_NAME} 
       DEFAULT CHARACTER SET utf8mb4 
       DEFAULT COLLATE utf8mb4_unicode_ci`
    );
    console.log(`✅ 数据库 ${DB_NAME} 创建成功`);
    
    // 使用数据库
    await connection.query(`USE ${DB_NAME}`);
    console.log(`🔄 正在创建数据表...`);
    
    // 创建用户表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '用户ID',
        username VARCHAR(50) NOT NULL COMMENT '用户名',
        email VARCHAR(100) NOT NULL COMMENT '邮箱',
        phone VARCHAR(20) DEFAULT NULL COMMENT '手机号',
        avatar VARCHAR(255) DEFAULT NULL COMMENT '头像URL',
        password VARCHAR(255) NOT NULL COMMENT '密码',
        status TINYINT UNSIGNED DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY uk_username (username),
        UNIQUE KEY uk_email (email),
        KEY idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表'
    `);
    console.log('✅ users 表创建成功');
    
    // 插入测试数据
    await connection.query(`
      INSERT INTO users (username, email, phone, password, status) VALUES
        ('admin', 'admin@example.com', '13800138000', 'admin123', 1),
        ('test', 'test@example.com', '13800138001', 'test123', 1)
      ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP
    `);
    console.log('✅ 测试数据插入成功');
    
    // 创建表单定义表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS forms (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL COMMENT '表单名称',
        description TEXT DEFAULT NULL COMMENT '表单描述',
        config JSON DEFAULT NULL COMMENT '表单配置',
        status TINYINT UNSIGNED DEFAULT 1,
        created_by BIGINT UNSIGNED DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='表单定义表'
    `);
    console.log('✅ forms 表创建成功');
    
    // 创建表单字段表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS form_fields (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        form_id BIGINT UNSIGNED NOT NULL COMMENT '所属表单ID',
        field_key VARCHAR(50) NOT NULL COMMENT '字段标识',
        field_name VARCHAR(100) NOT NULL COMMENT '字段名称',
        field_type VARCHAR(20) NOT NULL COMMENT '字段类型',
        component_type VARCHAR(30) DEFAULT NULL COMMENT '组件类型',
        config JSON DEFAULT NULL COMMENT '字段配置',
        validation_rules JSON DEFAULT NULL COMMENT '验证规则',
        sort_order INT UNSIGNED DEFAULT 0,
        is_required TINYINT UNSIGNED DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY uk_form_field_key (form_id, field_key),
        KEY idx_form_id (form_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='表单字段定义表'
    `);
    console.log('✅ form_fields 表创建成功');
    
    // 创建表单数据表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS form_data (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        form_id BIGINT UNSIGNED NOT NULL COMMENT '表单ID',
        data_id VARCHAR(32) NOT NULL COMMENT '业务数据ID',
        data JSON NOT NULL COMMENT '表单数据',
        creator_id BIGINT UNSIGNED DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY uk_form_data_id (form_id, data_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='表单数据表'
    `);
    console.log('✅ form_data 表创建成功');
    
    console.log('');
    console.log('========================================');
    console.log('✅ 数据库初始化完成！');
    console.log('========================================');
    console.log(`数据库: ${DB_NAME}`);
    console.log(`用户名: ${DB_CONFIG.user}`);
    console.log('');
    console.log('您可以启动服务器了:');
    console.log('  pnpm run dev');
    console.log('========================================');
    
  } catch (err) {
    console.error('');
    console.error('❌ 数据库初始化失败！');
    console.error('');
    console.error('可能的原因:');
    console.error('  1. MySQL 服务未启动');
    console.error('  2. 用户名或密码错误');
    console.error('  3. MySQL 端口不是 3306');
    console.error('');
    console.error('错误详情:', err.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

initDatabase();
