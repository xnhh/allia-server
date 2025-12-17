#!/usr/bin/env node
/**
 * 初始化数据库脚本
 * 使用 Prisma 创建表结构，然后添加触发器
 */

const { execSync } = require("child_process")
const fs = require("fs")
const path = require("path")

console.log("🚀 初始化 Starknet 数据库...")

// 检查 .env 文件
const envPath = path.join(__dirname, "..", ".env")
if (!fs.existsSync(envPath)) {
  console.error("❌ 错误: .env 文件不存在")
  console.error("请创建 .env 文件并设置 DATABASE_URL")
  process.exit(1)
}

try {
  // 检查数据库连接并创建表
  console.log("📡 检查数据库连接并创建表结构...")
  execSync("npx prisma db push --skip-generate", {
    stdio: "inherit",
    cwd: path.join(__dirname, ".."),
  })

  // 添加触发器（Prisma 不支持触发器）
  console.log("🔧 添加数据库触发器...")
  const triggerFile = path.join(__dirname, "..", "prisma", "migrations", "init_triggers.sql")

  if (fs.existsSync(triggerFile)) {
    try {
      execSync(`npx prisma db execute --file ${triggerFile} --schema prisma/schema.prisma`, {
        stdio: "inherit",
        cwd: path.join(__dirname, ".."),
      })
      console.log("✅ 数据库初始化完成！")
    } catch (error) {
      console.log("⚠️  警告: 触发器创建失败（可能已存在），继续...")
    }
  }

  // 生成 Prisma Client
  console.log("📦 生成 Prisma Client...")
  execSync("npx prisma generate", {
    stdio: "inherit",
    cwd: path.join(__dirname, ".."),
  })

  console.log("✨ 完成！")
} catch (error) {
  console.error("❌ 初始化失败:", error.message)
  process.exit(1)
}
