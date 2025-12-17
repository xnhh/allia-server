import { RpcRequest, RpcResponse } from "../types"
import { ChainRouter } from "./routers/chain.router"
import { StarknetRouter } from "./routers/starknet.router"

/**
 * 主 RPC 路由处理器
 * 负责将请求分发到对应的子路由器
 */
export class RpcRouter {
  private starknetRouter: StarknetRouter
  private chainRouter: ChainRouter

  constructor() {
    this.starknetRouter = new StarknetRouter()
    this.chainRouter = new ChainRouter()
  }

  /**
   * 处理 RPC 请求
   */
  async handleRequest(request: RpcRequest): Promise<RpcResponse> {
    try {
      // 1. 优先检查 Starknet 合约管理方法
      if (this.starknetRouter.canHandle(request.method)) {
        return await this.starknetRouter.handleRequest(request)
      }

      // 2. 检查链相关方法
      if (this.chainRouter.canHandle(request.method)) {
        return await this.chainRouter.handleRequest(request)
      }

      // 3. 方法未找到
      throw new Error(
        `Unknown method: ${request.method}. Available methods: contracts.*, callContract, getBalance, getBlock, getTransaction, listChains, getChainInfo`
      )
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Internal error"
      const errorStack = error instanceof Error ? error.stack : undefined

      return {
        id: request.id,
        error: {
          code: -32000,
          message: errorMessage,
          data: errorStack,
        },
      }
    }
  }
}
