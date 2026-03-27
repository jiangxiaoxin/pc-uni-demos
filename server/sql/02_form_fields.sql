-- =====================================================
-- 表单字段定义表 (form_fields)
-- 存储每个表单包含的字段信息
-- =====================================================

CREATE TABLE IF NOT EXISTS form_fields (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '字段ID，主键',
  form_id BIGINT UNSIGNED NOT NULL COMMENT '所属表单ID（关联 forms.id）',
  
  -- 字段基本信息
  field_key VARCHAR(50) NOT NULL COMMENT '字段唯一标识（英文，如：username）',
  field_name VARCHAR(100) NOT NULL COMMENT '字段显示名称（中文，如：用户名）',
  field_type VARCHAR(20) NOT NULL COMMENT '数据类型：string|number|date|boolean|array|object',
  component_type VARCHAR(30) DEFAULT NULL COMMENT '组件类型：input|select|radio|checkbox|date-picker|textarea|switch|slider|rate',
  
  -- 组件配置（JSON格式）
  config JSON DEFAULT NULL COMMENT '组件配置：placeholder, maxlength, min/max, options, format, rows, clearable, disabled, readonly等',
  
  -- 验证规则（JSON格式）
  validation_rules JSON DEFAULT NULL COMMENT '验证规则数组：required, email, pattern, min, max等',
  
  sort_order INT UNSIGNED DEFAULT 0 COMMENT '字段排序顺序（从小到大）',
  is_required TINYINT UNSIGNED DEFAULT 0 COMMENT '是否必填：0-否，1-是',
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  
  PRIMARY KEY (id),
  UNIQUE KEY uk_form_field_key (form_id, field_key),
  KEY idx_form_id (form_id),
  KEY idx_sort_order (sort_order)
  
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='表单字段定义表';

-- 示例数据：用户注册表单字段
INSERT INTO form_fields (form_id, field_key, field_name, field_type, component_type, config, validation_rules, is_required, sort_order) VALUES
(1, 'username', '用户名', 'string', 'input', 
 '{"placeholder": "请输入用户名", "maxlength": 20, "clearable": true}', 
 '[{"type": "required", "message": "用户名不能为空"}, {"type": "min", "value": 3, "message": "至少3个字符"}]', 
 1, 1),

(1, 'email', '邮箱', 'string', 'input', 
 '{"placeholder": "请输入邮箱", "clearable": true}', 
 '[{"type": "required", "message": "邮箱不能为空"}, {"type": "email", "message": "邮箱格式不正确"}]', 
 1, 2),

(1, 'phone', '手机号', 'string', 'input', 
 '{"placeholder": "请输入手机号", "maxlength": 11}', 
 '[{"type": "pattern", "pattern": "^1[3-9]\\d{9}$", "message": "手机号格式错误"}]', 
 0, 3),

(1, 'gender', '性别', 'string', 'select', 
 '{"options": [{"label": "男", "value": "male"}, {"label": "女", "value": "female"}, {"label": "保密", "value": "secret"}], "placeholder": "请选择性别"}', 
 NULL, 
 0, 4),

(1, 'birthday', '生日', 'date', 'date-picker', 
 '{"format": "YYYY-MM-DD", "placeholder": "选择生日"}', 
 NULL, 
 0, 5),

(1, 'hobbies', '兴趣爱好', 'array', 'checkbox', 
 '{"options": [{"label": "阅读", "value": "reading"}, {"label": "运动", "value": "sports"}, {"label": "音乐", "value": "music"}, {"label": "旅游", "value": "travel"}]}', 
 NULL, 
 0, 6)

ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

-- 示例数据：请假申请表字段
INSERT INTO form_fields (form_id, field_key, field_name, field_type, component_type, config, validation_rules, is_required, sort_order) VALUES
(2, 'start_date', '开始日期', 'date', 'date-picker', '{"placeholder": "选择开始日期"}', '[{"type": "required", "message": "请选择开始日期"}]', 1, 1),
(2, 'end_date', '结束日期', 'date', 'date-picker', '{"placeholder": "选择结束日期"}', '[{"type": "required", "message": "请选择结束日期"}]', 1, 2),
(2, 'leave_type', '请假类型', 'string', 'radio', '{"options": [{"label": "事假", "value": "personal"}, {"label": "病假", "value": "sick"}, {"label": "年假", "value": "annual"}]}', '[{"type": "required", "message": "请选择请假类型"}]', 1, 3),
(2, 'reason', '请假原因', 'string', 'textarea', '{"rows": 4, "maxlength": 500, "placeholder": "请输入请假原因"}', '[{"type": "required", "message": "请填写请假原因"}]', 1, 4)
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;
