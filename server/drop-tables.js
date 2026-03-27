// 删除 forms 相关表
const mysql = require('mysql2/promise');

const DB_CONFIG = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'helloca',
  database: 'formeditor'
};

async function dropTables() {
  let connection;
  
  try {
    console.log('🔄 正在连接数据库...');
    connection = await mysql.createConnection(DB_CONFIG);
    console.log('✅ 数据库连接成功');
    console.log('');
    
    // 删除表（注意外键依赖顺序，先删除依赖表）
    const tables = ['form_data', 'form_fields', 'forms'];
    
    for (const table of tables) {
      try {
        await connection.query(`DROP TABLE IF EXISTS ${table}`);
        console.log(`✅ 表 ${table} 已删除`);
      } catch (err) {
        console.error(`❌ 删除表 ${table} 失败:`, err.message);
      }
    }
    
    console.log('');
    console.log('========================================');
    console.log('✅ 所有表删除完成！');
    console.log('========================================');
    
  } catch (err) {
    console.error('❌ 操作失败:', err.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

dropTables();
