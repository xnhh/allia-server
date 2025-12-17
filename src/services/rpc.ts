import { RpcRequest, RpcResponse } from "../types"
import { chainManager } from "../chains/manager"
import { RpcRouter } from "./rpc.router"

export class RpcService {
  private router: RpcRouter

  constructor() {
    console.log("RPC Service initialized")
    const chains = chainManager.getAllChains()
    console.log(`Registered chains: ${chains.map((c) => `${c.name} (${c.chainId})`).join(", ")}`)
    this.router = new RpcRouter()
  }

  async handleRequest(request: RpcRequest): Promise<RpcResponse> {
    return this.router.handleRequest(request)
  }
}
