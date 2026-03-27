-- ============================================================
-- 体检套餐管理系统 - 数据库设计
-- 作者: Kimi Code
-- 日期: 2026-03-20
-- 数据库: MySQL 8.0+
-- 字符集: utf8mb4
-- ============================================================

-- 创建数据库
CREATE DATABASE IF NOT EXISTS health_exam_system 
    CHARACTER SET utf8mb4 
    COLLATE utf8mb4_unicode_ci;

USE health_exam_system;

-- ============================================================
-- 1. 基础字典表（无依赖，先创建）
-- ============================================================

-- 1.1 性别表
CREATE TABLE gender (
    gender_id       TINYINT UNSIGNED        PRIMARY KEY AUTO_INCREMENT COMMENT '性别ID',
    gender_name     VARCHAR(10)             NOT NULL COMMENT '性别名称（男/女/未知）',
    created_at      DATETIME                DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    
    UNIQUE KEY uk_gender_name (gender_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='性别字典表';

-- 1.2 物品单位表
CREATE TABLE unit (
    unit_id         SMALLINT UNSIGNED       PRIMARY KEY AUTO_INCREMENT COMMENT '单位ID',
    unit_name       VARCHAR(20)             NOT NULL COMMENT '单位名称（支/瓶/次/项等）',
    created_at      DATETIME                DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    
    UNIQUE KEY uk_unit_name (unit_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='物品单位字典表';

-- 1.3 订单状态表
CREATE TABLE order_status (
    status_id       TINYINT UNSIGNED        PRIMARY KEY AUTO_INCREMENT COMMENT '状态ID',
    status_name     VARCHAR(20)             NOT NULL COMMENT '状态名称',
    status_code     VARCHAR(20)             NOT NULL COMMENT '状态编码（用于程序判断）',
    sort_order      TINYINT UNSIGNED        DEFAULT 0 COMMENT '排序顺序',
    is_final        BOOLEAN                 DEFAULT FALSE COMMENT '是否为终态（不可再变更）',
    created_at      DATETIME                DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    
    UNIQUE KEY uk_status_code (status_code),
    KEY idx_sort_order (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单状态字典表';

-- ============================================================
-- 2. 业务主表（依赖基础字典表）
-- ============================================================

-- 2.1 顾客表
CREATE TABLE customer (
    customer_id     INT UNSIGNED            PRIMARY KEY AUTO_INCREMENT COMMENT '顾客ID',
    name            VARCHAR(50)             NOT NULL COMMENT '姓名',
    gender_id       TINYINT UNSIGNED        NOT NULL COMMENT '性别ID',
    age             TINYINT UNSIGNED        COMMENT '年龄',
    phone           VARCHAR(20)             COMMENT '联系方式',
    id_card         VARCHAR(18)             COMMENT '身份证号',
    address         VARCHAR(200)            COMMENT '住址',
    created_at      DATETIME                DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at      DATETIME                DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    is_deleted      BOOLEAN                 DEFAULT FALSE COMMENT '是否删除（软删除）',
    deleted_at      DATETIME                COMMENT '删除时间',
    
    -- 外键约束
    CONSTRAINT fk_customer_gender 
        FOREIGN KEY (gender_id) REFERENCES gender(gender_id) 
        ON DELETE RESTRICT ON UPDATE CASCADE,
    
    -- 索引
    KEY idx_customer_name (name),
    KEY idx_customer_phone (phone),
    KEY idx_customer_id_card (id_card),
    KEY idx_customer_created (created_at),
    UNIQUE KEY uk_customer_id_card (id_card) WHERE id_card IS NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='顾客信息表';

-- 2.2 物品表
CREATE TABLE item (
    item_id         INT UNSIGNED            PRIMARY KEY AUTO_INCREMENT COMMENT '物品ID',
    item_code       VARCHAR(30)             NOT NULL COMMENT '物品编码（唯一标识）',
    item_name       VARCHAR(100)            NOT NULL COMMENT '物品名称',
    unit_id         SMALLINT UNSIGNED       NOT NULL COMMENT '单位ID',
    price           DECIMAL(10, 2)          NOT NULL DEFAULT 0.00 COMMENT '价格（元）',
    created_at      DATETIME                DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at      DATETIME                DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    is_deleted      BOOLEAN                 DEFAULT FALSE COMMENT '是否删除（软删除）',
    
    -- 外键约束
    CONSTRAINT fk_item_unit 
        FOREIGN KEY (unit_id) REFERENCES unit(unit_id) 
        ON DELETE RESTRICT ON UPDATE CASCADE,
    
    -- 索引
    UNIQUE KEY uk_item_code (item_code),
    KEY idx_item_name (item_name),
    KEY idx_item_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='物品表';

-- 2.3 体检项目表
CREATE TABLE exam_item (
    exam_item_id    INT UNSIGNED            PRIMARY KEY AUTO_INCREMENT COMMENT '体检项目ID',
    exam_item_name  VARCHAR(100)            NOT NULL COMMENT '体检项目名称',
    description     VARCHAR(500)            COMMENT '项目描述',
    created_at      DATETIME                DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at      DATETIME                DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    is_deleted      BOOLEAN                 DEFAULT FALSE COMMENT '是否删除（软删除）',
    
    -- 索引
    KEY idx_exam_item_name (exam_item_name),
    KEY idx_exam_item_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='体检项目表';

-- 2.4 体检套餐表
CREATE TABLE exam_package (
    package_id      INT UNSIGNED            PRIMARY KEY AUTO_INCREMENT COMMENT '体检套餐ID',
    package_name    VARCHAR(100)            NOT NULL COMMENT '体检套餐名称',
    package_code    VARCHAR(30)             COMMENT '套餐编码',
    description     VARCHAR(500)            COMMENT '套餐描述',
    original_price  DECIMAL(10, 2)          COMMENT '原价（元）',
    sale_price      DECIMAL(10, 2)          COMMENT '售价（元）',
    created_at      DATETIME                DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at      DATETIME                DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    is_deleted      BOOLEAN                 DEFAULT FALSE COMMENT '是否删除（软删除）',
    is_on_sale      BOOLEAN                 DEFAULT TRUE COMMENT '是否上架',
    
    -- 索引
    UNIQUE KEY uk_package_code (package_code) WHERE package_code IS NOT NULL,
    KEY idx_package_name (package_name),
    KEY idx_package_created (created_at),
    KEY idx_package_on_sale (is_on_sale, is_deleted)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='体检套餐表';

-- ============================================================
-- 3. 多对多关系中间表
-- ============================================================

-- 3.1 体检项目与物品关联表（多对多）
-- 说明：一个体检项目需要消耗多个物品，一个物品可用于多个体检项目
CREATE TABLE exam_item_item (
    id              INT UNSIGNED            PRIMARY KEY AUTO_INCREMENT COMMENT '关联ID',
    exam_item_id    INT UNSIGNED            NOT NULL COMMENT '体检项目ID',
    item_id         INT UNSIGNED            NOT NULL COMMENT '物品ID',
    quantity        DECIMAL(10, 3)          NOT NULL DEFAULT 1.000 COMMENT '消耗数量',
    created_at      DATETIME                DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    
    -- 外键约束
    CONSTRAINT fk_eii_exam_item 
        FOREIGN KEY (exam_item_id) REFERENCES exam_item(exam_item_id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_eii_item 
        FOREIGN KEY (item_id) REFERENCES item(item_id) 
        ON DELETE RESTRICT ON UPDATE CASCADE,
    
    -- 联合唯一索引：防止重复关联
    UNIQUE KEY uk_exam_item_item (exam_item_id, item_id),
    
    -- 索引
    KEY idx_eii_item (item_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='体检项目-物品关联表';

-- 3.2 体检套餐与体检项目关联表（多对多）
-- 说明：一个套餐包含多个体检项目，一个体检项目可属于多个套餐
CREATE TABLE package_exam_item (
    id              INT UNSIGNED            PRIMARY KEY AUTO_INCREMENT COMMENT '关联ID',
    package_id      INT UNSIGNED            NOT NULL COMMENT '体检套餐ID',
    exam_item_id    INT UNSIGNED            NOT NULL COMMENT '体检项目ID',
    sort_order      SMALLINT UNSIGNED       DEFAULT 0 COMMENT '排序顺序（套餐内项目的显示顺序）',
    created_at      DATETIME                DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    
    -- 外键约束
    CONSTRAINT fk_pei_package 
        FOREIGN KEY (package_id) REFERENCES exam_package(package_id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_pei_exam_item 
        FOREIGN KEY (exam_item_id) REFERENCES exam_item(exam_item_id) 
        ON DELETE RESTRICT ON UPDATE CASCADE,
    
    -- 联合唯一索引：防止重复关联
    UNIQUE KEY uk_package_exam_item (package_id, exam_item_id),
    
    -- 索引
    KEY idx_pei_exam_item (exam_item_id),
    KEY idx_pei_sort (package_id, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='套餐-体检项目关联表';

-- ============================================================
-- 4. 订单相关表
-- ============================================================

-- 4.1 订单表
CREATE TABLE `order` (
    order_id        INT UNSIGNED            PRIMARY KEY AUTO_INCREMENT COMMENT '订单ID',
    order_no        VARCHAR(30)             NOT NULL COMMENT '订单编号（业务唯一标识）',
    customer_id     INT UNSIGNED            NOT NULL COMMENT '顾客ID',
    package_id      INT UNSIGNED            NOT NULL COMMENT '体检套餐ID',
    status_id       TINYINT UNSIGNED        NOT NULL COMMENT '订单状态ID',
    total_amount    DECIMAL(10, 2)          NOT NULL COMMENT '订单总金额（元）',
    remark          VARCHAR(500)            COMMENT '订单备注',
    created_at      DATETIME                DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at      DATETIME                DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    paid_at         DATETIME                COMMENT '支付时间',
    completed_at    DATETIME                COMMENT '完成时间',
    
    -- 外键约束
    CONSTRAINT fk_order_customer 
        FOREIGN KEY (customer_id) REFERENCES customer(customer_id) 
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_order_package 
        FOREIGN KEY (package_id) REFERENCES exam_package(package_id) 
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_order_status 
        FOREIGN KEY (status_id) REFERENCES order_status(status_id) 
        ON DELETE RESTRICT ON UPDATE CASCADE,
    
    -- 索引
    UNIQUE KEY uk_order_no (order_no),
    KEY idx_order_customer (customer_id),
    KEY idx_order_package (package_id),
    KEY idx_order_status (status_id),
    KEY idx_order_created (created_at),
    KEY idx_order_status_created (status_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单表';

-- 4.2 订单状态变更日志表（可选，用于审计）
CREATE TABLE order_status_log (
    log_id          INT UNSIGNED            PRIMARY KEY AUTO_INCREMENT COMMENT '日志ID',
    order_id        INT UNSIGNED            NOT NULL COMMENT '订单ID',
    from_status_id  TINYINT UNSIGNED        COMMENT '原状态ID',
    to_status_id    TINYINT UNSIGNED        NOT NULL COMMENT '新状态ID',
    operator        VARCHAR(50)             COMMENT '操作人',
    remark          VARCHAR(200)            COMMENT '备注',
    created_at      DATETIME                DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    
    -- 外键约束
    CONSTRAINT fk_osl_order 
        FOREIGN KEY (order_id) REFERENCES `order`(order_id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_osl_from_status 
        FOREIGN KEY (from_status_id) REFERENCES order_status(status_id) 
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_osl_to_status 
        FOREIGN KEY (to_status_id) REFERENCES order_status(status_id) 
        ON DELETE RESTRICT ON UPDATE CASCADE,
    
    -- 索引
    KEY idx_osl_order (order_id),
    KEY idx_osl_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单状态变更日志表';

-- ============================================================
-- 5. 初始化数据
-- ============================================================

-- 初始化性别数据
INSERT INTO gender (gender_id, gender_name) VALUES 
    (1, '男'),
    (2, '女'),
    (3, '未知');

-- 初始化订单状态数据（常见业务流程）
-- 流程：待支付 -> 已支付 -> 待体检 -> 体检中 -> 已完成
--       待支付 -> 已取消
--       已支付 -> 已退款
INSERT INTO order_status (status_id, status_name, status_code, sort_order, is_final) VALUES 
    (1, '待支付', 'PENDING_PAYMENT', 1, FALSE),
    (2, '已支付', 'PAID', 2, FALSE),
    (3, '待体检', 'PENDING_EXAM', 3, FALSE),
    (4, '体检中', 'EXAMINING', 4, FALSE),
    (5, '已完成', 'COMPLETED', 5, TRUE),
    (6, '已取消', 'CANCELLED', 6, TRUE),
    (7, '已退款', 'REFUNDED', 7, TRUE);

-- 初始化常用物品单位
INSERT INTO unit (unit_id, unit_name) VALUES 
    (1, '支'),
    (2, '瓶'),
    (3, '次'),
    (4, '项'),
    (5, '个'),
    (6, '套'),
    (7, 'ml'),
    (8, 'mg'),
    (9, '片'),
    (10, '盒');

-- ============================================================
-- 6. 常用查询视图（可选）
-- ============================================================

-- 订单详情视图（联表查询）
CREATE VIEW v_order_detail AS
SELECT 
    o.order_id,
    o.order_no,
    o.total_amount,
    o.remark,
    o.created_at AS order_created_at,
    o.paid_at,
    o.completed_at,
    c.customer_id,
    c.name AS customer_name,
    c.phone AS customer_phone,
    c.age AS customer_age,
    g.gender_name AS customer_gender,
    c.id_card AS customer_id_card,
    p.package_id,
    p.package_name,
    p.package_code,
    p.sale_price AS package_price,
    s.status_id,
    s.status_name AS order_status,
    s.status_code AS order_status_code
FROM `order` o
INNER JOIN customer c ON o.customer_id = c.customer_id
INNER JOIN gender g ON c.gender_id = g.gender_id
INNER JOIN exam_package p ON o.package_id = p.package_id
INNER JOIN order_status s ON o.status_id = s.status_id
WHERE c.is_deleted = FALSE AND p.is_deleted = FALSE;

-- 套餐明细视图（包含所有体检项目）
CREATE VIEW v_package_detail AS
SELECT 
    p.package_id,
    p.package_name,
    p.package_code,
    p.description,
    p.original_price,
    p.sale_price,
    p.is_on_sale,
    ei.exam_item_id,
    ei.exam_item_name,
    pei.sort_order AS item_sort_order
FROM exam_package p
LEFT JOIN package_exam_item pei ON p.package_id = pei.package_id
LEFT JOIN exam_item ei ON pei.exam_item_id = ei.exam_item_id
WHERE p.is_deleted = FALSE AND ei.is_deleted = FALSE
ORDER BY p.package_id, pei.sort_order;

-- ============================================================
-- 7. 存储过程示例（可选）
-- ============================================================

DELIMITER //

-- 生成订单编号存储过程
-- 格式：EX + 年月日 + 6位流水号，如：EX20260320000001
CREATE PROCEDURE sp_generate_order_no(OUT order_no VARCHAR(30))
BEGIN
    DECLARE today VARCHAR(8);
    DECLARE seq INT;
    DECLARE last_order_no VARCHAR(30);
    
    SET today = DATE_FORMAT(CURDATE(), '%Y%m%d');
    
    -- 获取当天最后一个订单号
    SELECT order_no INTO last_order_no 
    FROM `order` 
    WHERE order_no LIKE CONCAT('EX', today, '%')
    ORDER BY order_no DESC 
    LIMIT 1 FOR UPDATE;
    
    IF last_order_no IS NULL THEN
        SET seq = 1;
    ELSE
        SET seq = CAST(SUBSTRING(last_order_no, 11) AS UNSIGNED) + 1;
    END IF;
    
    SET order_no = CONCAT('EX', today, LPAD(seq, 6, '0'));
END //

-- 创建订单存储过程
CREATE PROCEDURE sp_create_order(
    IN p_customer_id INT UNSIGNED,
    IN p_package_id INT UNSIGNED,
    IN p_remark VARCHAR(500),
    IN p_operator VARCHAR(50),
    OUT p_order_id INT UNSIGNED,
    OUT p_order_no VARCHAR(30)
)
BEGIN
    DECLARE v_package_price DECIMAL(10, 2);
    DECLARE v_status_pending TINYINT UNSIGNED DEFAULT 1; -- 待支付状态
    
    START TRANSACTION;
    
    -- 获取套餐价格
    SELECT sale_price INTO v_package_price 
    FROM exam_package 
    WHERE package_id = p_package_id AND is_deleted = FALSE AND is_on_sale = TRUE;
    
    IF v_package_price IS NULL THEN
        ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = '套餐不存在或已下架';
    END IF;
    
    -- 生成订单号
    CALL sp_generate_order_no(p_order_no);
    
    -- 插入订单
    INSERT INTO `order` (
        order_no, customer_id, package_id, status_id, 
        total_amount, remark
    ) VALUES (
        p_order_no, p_customer_id, p_package_id, v_status_pending,
        v_package_price, p_remark
    );
    
    SET p_order_id = LAST_INSERT_ID();
    
    -- 记录状态变更日志
    INSERT INTO order_status_log (order_id, from_status_id, to_status_id, operator, remark)
    VALUES (p_order_id, NULL, v_status_pending, p_operator, '创建订单');
    
    COMMIT;
END //

DELIMITER ;

-- ============================================================
-- 设计说明
-- ============================================================
/*
【设计要点说明】

1. 数据类型选择：
   - ID字段：根据数据量选择 TINYINT(少量)/SMALLINT(中等)/INT(大量)
   - 金额：DECIMAL(10,2) 精确存储，避免浮点误差
   - 时间：DATETIME 存储，带 updated_at 自动更新
   - 状态标记：BOOLEAN 实际存储为 TINYINT(1)

2. 外键约束策略：
   - ON DELETE RESTRICT：防止误删被引用的基础数据
   - ON DELETE CASCADE：中间表随主表删除自动清理
   - ON UPDATE CASCADE：关联ID变更时自动同步

3. 软删除设计：
   - is_deleted + deleted_at 字段
   - 保留历史数据，支持数据恢复
   - 查询时需主动过滤 is_deleted = FALSE

4. 索引设计：
   - 主键、外键自动创建索引
   - 业务唯一字段加唯一索引（如订单号、身份证号）
   - 常用查询字段加普通索引（如创建时间、状态）
   - 联合索引注意字段顺序（最左前缀原则）

5. 订单号生成：
   - 前缀 + 日期 + 流水号，保证可读性和唯一性
   - 使用存储过程保证并发安全

6. 多对多关系：
   - 使用中间表实现，包含额外字段（如排序、数量）
   - 联合唯一索引防止重复关联

7. 状态管理：
   - 状态值表独立维护，支持扩展
   - 状态日志表记录完整流转历史
   - is_final 标记终态，防止错误操作

8. 字符集：
   - utf8mb4 支持完整 Unicode（包括 emoji）
   - 排序规则使用 unicode_ci，支持多语言排序
*/
