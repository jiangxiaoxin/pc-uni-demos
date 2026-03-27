# FormEditor 数据库初始化脚本
# 使用 PowerShell 执行

$MYSQL_USER = "root"
$MYSQL_PWD = "helloca"
$DB_NAME = "formeditor"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host " FormEditor 数据库初始化脚本" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "正在连接 MySQL 并创建数据库..." -ForegroundColor Yellow

try {
    # 执行 SQL 脚本
    $env:MYSQL_PWD = $MYSQL_PWD
    $output = mysql -u$MYSQL_USER -e "source database.sql" 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ 数据库初始化成功！" -ForegroundColor Green
        Write-Host "   数据库: $DB_NAME" -ForegroundColor Gray
        Write-Host "   用户名: $MYSQL_USER" -ForegroundColor Gray
        Write-Host ""
        Write-Host "您现在可以启动服务器了:" -ForegroundColor Cyan
        Write-Host "   pnpm run dev" -ForegroundColor White
    } else {
        throw "MySQL 执行失败"
    }
} catch {
    Write-Host ""
    Write-Host "❌ 数据库初始化失败！" -ForegroundColor Red
    Write-Host "   请检查:" -ForegroundColor Yellow
    Write-Host "   1. MySQL 服务是否运行" -ForegroundColor Yellow
    Write-Host "   2. 用户名密码是否正确" -ForegroundColor Yellow
    Write-Host "   3. MySQL 是否在环境变量 PATH 中" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "错误信息: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "按任意键继续..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
