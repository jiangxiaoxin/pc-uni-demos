-- =====================================================
-- 表单定义表 (forms)
-- 存储用户创建的表单基本信息
-- =====================================================

CREATE TABLE IF NOT EXISTS forms (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '表单ID，主键',
  name VARCHAR(100) NOT NULL COMMENT '表单名称',
  description TEXT DEFAULT NULL COMMENT '表单描述',
  
  -- 表单配置（JSON格式存储布局、样式等）
  config JSON DEFAULT NULL COMMENT '表单配置：layout, labelWidth, labelPosition, size, submitButton等',
  
  status TINYINT UNSIGNED DEFAULT 1 COMMENT '状态：0-禁用，1-启用，2-草稿',
  created_by BIGINT UNSIGNED DEFAULT NULL COMMENT '创建者用户ID',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  
  PRIMARY KEY (id),
  KEY idx_status (status),
  KEY idx_created_by (created_by),
  KEY idx_created_at (created_at)
  
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='表单定义表';

-- 示例数据
INSERT INTO forms (id, name, description, config, status, created_by) VALUES
(1, '用户注册表单', '新用户注册使用的表单', '{"layout": "vertical", "labelWidth": 100}', 1, 1),
(2, '请假申请表', '员工请假申请', '{"layout": "horizontal", "labelWidth": 80}', 1, 1),
(3, '问卷调查', '产品满意度调查', '{"layout": "vertical", "labelWidth": 120}', 1, 1)
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;
