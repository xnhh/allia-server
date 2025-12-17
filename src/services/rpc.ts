import { RpcRequest, RpcResponse } from "../types"
import { chainManager } from "../chains/manager"
import { RpcRouter } from "./rpc.router"
import { log } from "../utils/logger"

export class RpcService {
  private router: RpcRouter

  constructor() {
    log.tagged("RPC", "Service initialized")
    const chains = chainManager.getAllChains()
    const chainsList = chains.map((c) => `${c.name} (${c.chainId})`).join(", ")
    log.info(`Registered chains: ${chainsList}`)
    this.router = new RpcRouter()
  }

  async handleRequest(request: RpcRequest): Promise<RpcResponse> {
    return this.router.handleRequest(request)
  }
}
