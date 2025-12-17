#!/bin/bash
# 初始化数据库脚本
# 使用 Prisma 创建表结构，然后添加触发器

echo "🚀 初始化 Starknet 数据库..."

# 检查 .env 文件
if [ ! -f .env ]; then
    echo "❌ 错误: .env 文件不存在"
    echo "请创建 .env 文件并设置 DATABASE_URL"
    exit 1
fi

# 检查数据库连接
echo "📡 检查数据库连接..."
npx prisma db push --skip-generate

if [ $? -ne 0 ]; then
    echo "❌ 数据库连接失败，请检查 DATABASE_URL 配置"
    exit 1
fi

# 添加触发器（Prisma 不支持触发器）
echo "🔧 添加数据库触发器..."
npx prisma db execute --file prisma/migrations/init_triggers.sql --schema prisma/schema.prisma

if [ $? -eq 0 ]; then
    echo "✅ 数据库初始化完成！"
else
    echo "⚠️  警告: 触发器创建失败（可能已存在），继续..."
fi

# 生成 Prisma Client
echo "📦 生成 Prisma Client..."
npx prisma generate

echo "✨ 完成！"

