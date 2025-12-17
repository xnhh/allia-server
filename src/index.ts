import dotenv from "dotenv"
import { WebSocketServer } from "./server/websocket"
import { RpcService } from "./services/rpc"
import { prisma } from "./db/prisma"

dotenv.config()

const WS_PORT = parseInt(process.env.WS_PORT || "8501", 10)

async function main() {
  console.log("Starting Allia Server...")

  // Test database connection
  try {
    await prisma.$connect()
    console.log("[DB] Connected to PostgreSQL via Prisma")
  } catch (error) {
    console.warn(
      "[Warning] Database connection failed. Contract management features will not work."
    )
    console.error(error)
  }

  // Initialize RPC service
  const rpcService = new RpcService()

  // Initialize WebSocket server
  const wsServer = new WebSocketServer(WS_PORT, rpcService)

  console.log(`WebSocket server listening on ws://localhost:${WS_PORT}`)
  console.log("Allia Server is ready!")

  // Graceful shutdown
  process.on("SIGINT", async () => {
    console.log("\nShutting down gracefully...")
    wsServer.close()
    await prisma.$disconnect()
    process.exit(0)
  })

  process.on("SIGTERM", async () => {
    console.log("\nShutting down gracefully...")
    wsServer.close()
    await prisma.$disconnect()
    process.exit(0)
  })
}

main().catch((error) => {
  console.error("Failed to start server:", error)
  process.exit(1)
})
