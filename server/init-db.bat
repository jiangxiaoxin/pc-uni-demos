@echo off
chcp 65001 >nul
echo ==========================================
echo  FormEditor 数据库初始化脚本
echo ==========================================
echo.

set MYSQL_USER=root
set MYSQL_PWD=helloca
set DB_NAME=formeditor

echo 正在连接 MySQL 并创建数据库...
mysql -u%MYSQL_USER% -p%MYSQL_PWD% < database.sql

if %ERRORLEVEL% == 0 (
    echo.
    echo ✅ 数据库初始化成功！
    echo    数据库: %DB_NAME%
    echo    用户名: %MYSQL_USER%
    echo.
    echo 您现在可以启动服务器了:
    echo    pnpm run dev
) else (
    echo.
    echo ❌ 数据库初始化失败！
    echo    请检查 MySQL 服务是否运行
    echo    以及用户名密码是否正确
)

echo.
pause
