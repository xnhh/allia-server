import dotenv from "dotenv"
import { WebSocketServer } from "./server/websocket"
import { RpcService } from "./services/rpc"
import { prisma } from "./db/prisma"
import { log } from "./utils/logger"

dotenv.config()

const WS_PORT = parseInt(process.env.WS_PORT || "8501", 10)

async function main() {
  // 显示启动横幅
  log.banner("🚀 Allia Server", [
    "WebSocket RPC Server for Starknet",
    `Version: ${process.env.npm_package_version || "1.0.0"}`,
  ])

  // Test database connection
  try {
    await prisma.$connect()
    log.success("Connected to PostgreSQL via Prisma")
  } catch (error) {
    log.warn("Database connection failed. Contract management features will not work.")
    log.error(String(error))
  }

  // Initialize RPC service
  const rpcService = new RpcService()

  // Initialize WebSocket server
  const wsServer = new WebSocketServer(WS_PORT, rpcService)

  log.separator()
  log.success(`WebSocket server listening on ws://localhost:${WS_PORT}`)
  log.info("Allia Server is ready!")
  log.separator()

  // Graceful shutdown
  process.on("SIGINT", async () => {
    log.info("\nShutting down gracefully...")
    wsServer.close()
    await prisma.$disconnect()
    log.success("Server stopped")
    process.exit(0)
  })

  process.on("SIGTERM", async () => {
    log.info("\nShutting down gracefully...")
    wsServer.close()
    await prisma.$disconnect()
    log.success("Server stopped")
    process.exit(0)
  })
}

main().catch((error) => {
  log.error("Failed to start server:", error)
  process.exit(1)
})
