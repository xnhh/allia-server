import dotenv from "dotenv"
import { WebSocketServer } from "./server/websocket"
import { RpcService } from "./services/rpc"

dotenv.config()

const WS_PORT = parseInt(process.env.WS_PORT || "8501", 10)

async function main() {
  console.log("Starting Allia Server...")

  // Initialize RPC service
  const rpcService = new RpcService()

  // Initialize WebSocket server
  const wsServer = new WebSocketServer(WS_PORT, rpcService)

  console.log(`WebSocket server listening on ws://localhost:${WS_PORT}`)
  console.log("Allia Server is ready!")

  // Graceful shutdown
  process.on("SIGINT", () => {
    console.log("\nShutting down gracefully...")
    wsServer.close()
    process.exit(0)
  })

  process.on("SIGTERM", () => {
    console.log("\nShutting down gracefully...")
    wsServer.close()
    process.exit(0)
  })
}

main().catch((error) => {
  console.error("Failed to start server:", error)
  process.exit(1)
})

