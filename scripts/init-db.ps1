# PowerShell 脚本：初始化数据库
# 使用 Prisma 创建表结构，然后添加触发器

Write-Host "🚀 初始化 Starknet 数据库..." -ForegroundColor Cyan

# 检查 .env 文件
if (-not (Test-Path .env)) {
    Write-Host "❌ 错误: .env 文件不存在" -ForegroundColor Red
    Write-Host "请创建 .env 文件并设置 DATABASE_URL" -ForegroundColor Yellow
    exit 1
}

# 检查数据库连接并创建表
Write-Host "📡 检查数据库连接并创建表结构..." -ForegroundColor Cyan
npx prisma db push --skip-generate

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 数据库连接失败，请检查 DATABASE_URL 配置" -ForegroundColor Red
    exit 1
}

# 添加触发器（Prisma 不支持触发器）
Write-Host "🔧 添加数据库触发器..." -ForegroundColor Cyan
npx prisma db execute --file prisma/migrations/init_triggers.sql --schema prisma/schema.prisma

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ 数据库初始化完成！" -ForegroundColor Green
} else {
    Write-Host "⚠️  警告: 触发器创建失败（可能已存在），继续..." -ForegroundColor Yellow
}

# 生成 Prisma Client
Write-Host "📦 生成 Prisma Client..." -ForegroundColor Cyan
npx prisma generate

Write-Host "✨ 完成！" -ForegroundColor Green

