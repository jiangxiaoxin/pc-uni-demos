-- =====================================================
-- 表单数据表 (form_data)
-- 存储用户提交的动态表单数据
-- =====================================================

CREATE TABLE IF NOT EXISTS form_data (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '数据ID，主键',
  form_id BIGINT UNSIGNED NOT NULL COMMENT '所属表单ID（关联 forms.id）',
  data_id VARCHAR(32) NOT NULL COMMENT '业务数据ID（如：FD202403270001）',
  
  -- 表单数据（JSON格式存储）
  data JSON NOT NULL COMMENT '表单提交的JSON数据',
  
  creator_id BIGINT UNSIGNED DEFAULT NULL COMMENT '创建者用户ID',
  
  -- 数据状态
  status TINYINT UNSIGNED DEFAULT 1 COMMENT '数据状态：0-已删除，1-正常，2-草稿',
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  
  PRIMARY KEY (id),
  UNIQUE KEY uk_form_data_id (form_id, data_id),
  KEY idx_creator_id (creator_id),
  KEY idx_created_at (created_at),
  KEY idx_status (status)
  
  -- 如果需要外键约束，取消下面的注释：
  -- CONSTRAINT fk_form_data_form_id FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE
  
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='表单数据表';

-- 示例数据：用户注册数据
INSERT INTO form_data (form_id, data_id, data, creator_id, status) VALUES
(1, 'FD202403270001', 
 '{"username": "张三", "email": "zhangsan@example.com", "phone": "13800138000", "gender": "male", "hobbies": ["reading", "sports"]}', 
 1, 1),

(1, 'FD202403270002', 
 '{"username": "李四", "email": "lisi@example.com", "phone": "13900139000", "gender": "female", "birthday": "1990-05-20"}', 
 1, 1),

(1, 'FD202403270003', 
 '{"username": "王五", "email": "wangwu@example.com", "gender": "secret", "hobbies": ["music", "travel"]}', 
 2, 1)

ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

-- 示例数据：请假申请数据
INSERT INTO form_data (form_id, data_id, data, creator_id, status) VALUES
(2, 'LA202403270001', 
 '{"start_date": "2024-03-28", "end_date": "2024-03-29", "leave_type": "personal", "reason": "家中有事需要处理"}', 
 1, 1),

(2, 'LA202403270002', 
 '{"start_date": "2024-04-01", "end_date": "2024-04-03", "leave_type": "annual", "reason": "计划出去旅游"}', 
 2, 1)

ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;
