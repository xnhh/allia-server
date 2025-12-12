import { WebSocket, WebSocketServer as WSServer } from "ws"
import { RpcService } from "../services/rpc"
import { RpcRequest, RpcResponse } from "../types"

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
      console.error("WebSocket server error:", error)
    })
  }

  private handleConnection(ws: WebSocket) {
    const clientId = this.generateClientId()
    console.log(`Client connected: ${clientId}`)
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

        console.log(`[${clientId}] Request: ${message.method}`)

        const response = await this.rpcService.handleRequest(message)
        this.send(ws, response)
      } catch (error: any) {
        console.error("Error handling message:", error)
        this.sendError(
          ws,
          "unknown",
          -32700,
          "Parse error",
          error.message
        )
      }
    })

    ws.on("close", () => {
      console.log(`Client disconnected: ${clientId}`)
      this.clients.delete(ws)
    })

    ws.on("error", (error) => {
      console.error(`Client error [${clientId}]:`, error)
      this.clients.delete(ws)
    })
  }

  private send(ws: WebSocket, response: RpcResponse) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(response))
    }
  }

  private sendError(
    ws: WebSocket,
    id: string,
    code: number,
    message: string,
    data?: any
  ) {
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
    console.log("Closing WebSocket server...")
    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.close()
      }
    })
    this.wss.close()
  }
}

