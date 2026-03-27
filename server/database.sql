-- FormEditor 数据库初始化脚本
-- 执行此脚本创建必要的数据库和表

-- 创建数据库
CREATE DATABASE IF NOT EXISTS formeditor 
  DEFAULT CHARACTER SET utf8mb4 
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE formeditor;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  username VARCHAR(50) NOT NULL COMMENT '用户名',
  email VARCHAR(100) NOT NULL COMMENT '邮箱',
  phone VARCHAR(20) DEFAULT NULL COMMENT '手机号',
  avatar VARCHAR(255) DEFAULT NULL COMMENT '头像URL',
  password VARCHAR(255) NOT NULL COMMENT '密码（加密存储）',
  status TINYINT UNSIGNED DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (id),
  UNIQUE KEY uk_username (username),
  UNIQUE KEY uk_email (email),
  KEY idx_status (status),
  KEY idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 插入测试数据
INSERT INTO users (username, email, phone, password, status) VALUES
  ('admin', 'admin@example.com', '13800138000', 'admin123', 1),
  ('test', 'test@example.com', '13800138001', 'test123', 1),
  ('user001', 'user001@example.com', NULL, 'password123', 1),
  ('user002', 'user002@example.com', '13900139000', 'password123', 0)
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

-- ============================================
-- 表单相关表（用于低代码表单功能）
-- ============================================

-- 表单定义表
CREATE TABLE IF NOT EXISTS forms (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '表单ID',
  name VARCHAR(100) NOT NULL COMMENT '表单名称',
  description TEXT DEFAULT NULL COMMENT '表单描述',
  config JSON DEFAULT NULL COMMENT '表单配置（JSON格式）',
  status TINYINT UNSIGNED DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
  created_by BIGINT UNSIGNED DEFAULT NULL COMMENT '创建者ID',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (id),
  KEY idx_status (status),
  KEY idx_created_by (created_by),
  KEY idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='表单定义表';

-- 表单字段定义表
CREATE TABLE IF NOT EXISTS form_fields (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '字段ID',
  form_id BIGINT UNSIGNED NOT NULL COMMENT '所属表单ID',
  field_key VARCHAR(50) NOT NULL COMMENT '字段标识（英文）',
  field_name VARCHAR(100) NOT NULL COMMENT '字段名称（中文）',
  field_type VARCHAR(20) NOT NULL COMMENT '字段类型：input/select/date等',
  component_type VARCHAR(30) DEFAULT NULL COMMENT '组件类型',
  config JSON DEFAULT NULL COMMENT '字段配置（JSON格式）',
  validation_rules JSON DEFAULT NULL COMMENT '验证规则（JSON格式）',
  sort_order INT UNSIGNED DEFAULT 0 COMMENT '排序顺序',
  is_required TINYINT UNSIGNED DEFAULT 0 COMMENT '是否必填：0-否，1-是',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (id),
  UNIQUE KEY uk_form_field_key (form_id, field_key),
  KEY idx_form_id (form_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='表单字段定义表';

-- 表单数据表（动态表单数据存储）
CREATE TABLE IF NOT EXISTS form_data (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '数据ID',
  form_id BIGINT UNSIGNED NOT NULL COMMENT '表单ID',
  data_id VARCHAR(32) NOT NULL COMMENT '业务数据ID',
  data JSON NOT NULL COMMENT '表单数据（JSON格式）',
  creator_id BIGINT UNSIGNED DEFAULT NULL COMMENT '创建者ID',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (id),
  UNIQUE KEY uk_form_data_id (form_id, data_id),
  KEY idx_creator_id (creator_id),
  KEY idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='表单数据表';

-- 插入示例表单数据
INSERT INTO forms (id, name, description, config, status, created_by) VALUES
  (1, '用户注册表单', '新用户注册使用的表单', '{"layout": "vertical", "labelWidth": 100}', 1, 1),
  (2, '请假申请表', '员工请假申请', '{"layout": "horizontal", "labelWidth": 80}', 1, 1)
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

-- 插入示例表单字段
INSERT INTO form_fields (form_id, field_key, field_name, field_type, component_type, config, is_required, sort_order) VALUES
  (1, 'username', '用户名', 'text', 'input', '{"placeholder": "请输入用户名", "maxlength": 20}', 1, 1),
  (1, 'email', '邮箱', 'email', 'input', '{"placeholder": "请输入邮箱"}', 1, 2),
  (1, 'phone', '手机号', 'text', 'input', '{"placeholder": "请输入手机号"}', 0, 3),
  (1, 'gender', '性别', 'select', 'select', '{"options": [{"label": "男", "value": "male"}, {"label": "女", "value": "female"}]}', 0, 4),
  (2, 'start_date', '开始日期', 'date', 'date-picker', '{}', 1, 1),
  (2, 'end_date', '结束日期', 'date', 'date-picker', '{}', 1, 2),
  (2, 'reason', '请假原因', 'textarea', 'textarea', '{"rows": 4}', 1, 3)
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;
