import { WebSocket, WebSocketServer as WSServer } from "ws"
import { RpcService } from "../services/rpc"
import { RpcRequest, RpcResponse } from "../types"
import { log } from "../utils/logger"

export class WebSocketServer {
  private wss: WSServer
  private rpcService: RpcService
  private clients: Set<WebSocket> = new Set()

  constructor(port: number, rpcService: RpcService) {
    this.rpcService = rpcService
    this.wss = new WSServer({ port })

    this.wss.on("connection", (ws: WebSocket) => {
      this.handleConnection(ws)
    })

    this.wss.on("error", (error) => {
      log.error("WebSocket server error:", error)
    })
  }

  private handleConnection(ws: WebSocket) {
    const clientId = this.generateClientId()
    log.success(`Client connected: ${clientId}`)
    this.clients.add(ws)

    // Send welcome message
    this.send(ws, {
      id: "welcome",
      result: {
        message: "Connected to Allia Server",
        clientId,
      },
    })

    ws.on("message", async (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString()) as RpcRequest

        if (!message.id || !message.method) {
          this.sendError(ws, "invalid-request", -32600, "Invalid Request")
          return
        }

        log.debug(`[${clientId}] Request: ${message.method}`)

        const response = await this.rpcService.handleRequest(message)
        this.send(ws, response)
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        log.error(`Error handling message: ${errorMessage}`)
        this.sendError(ws, "unknown", -32700, "Parse error", error.message)
      }
    })

    ws.on("close", () => {
      log.info(`Client disconnected: ${clientId}`)
      this.clients.delete(ws)
    })

    ws.on("error", (error) => {
      log.error(`Client error [${clientId}]:`, error)
      this.clients.delete(ws)
    })
  }

  private send(ws: WebSocket, response: RpcResponse) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(response))
    }
  }

  private sendError(ws: WebSocket, id: string, code: number, message: string, data?: any) {
    this.send(ws, {
      id,
      error: {
        code,
        message,
        data,
      },
    })
  }

  private generateClientId(): string {
    return `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  close() {
    log.info("Closing WebSocket server...")
    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.close()
      }
    })
    this.wss.close()
  }
}
