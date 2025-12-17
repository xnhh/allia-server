// Prisma Client 会在运行 npm run prisma:generate 后生成
// 如果还没有生成，请先运行: npm run prisma:generate
// @ts-expect-error - Prisma Client 是动态生成的
import { PrismaClient } from "@prisma/client"

// Prisma Client 单例
let prisma: PrismaClient

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined
}

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient({
    log: ["error", "warn"],
  })
} else {
  // 开发环境下使用全局变量，避免热重载时创建多个实例
  if (!global.__prisma) {
    global.__prisma = new PrismaClient({
      log: ["query", "error", "warn"],
    })
  }
  prisma = global.__prisma
}

// 优雅关闭
process.on("beforeExit", async () => {
  await prisma.$disconnect()
})

export { prisma }
