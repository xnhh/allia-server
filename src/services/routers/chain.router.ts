import { RpcRequest, RpcResponse } from "../../types"
import { chainManager } from "../../chains/manager"
import { IChain } from "../../chains/base"
import {
  handleCallContract,
  handleGetBalance,
  handleGetBlock,
  handleGetTransaction,
  handleGetStarkName,
  handleGetStarkProfile,
  handleListChains,
  handleGetChainInfo,
  handleChainMethod,
} from "../handlers/chain.handler"

/**
 * 链相关操作路由
 * 处理所有链相关的 RPC 方法
 */
export class ChainRouter {
  // 链相关方法路由（需要 chain 参数的方法）
  private chainHandlers: Record<
    string,
    (request: RpcRequest, chain: IChain, chainId?: string) => Promise<RpcResponse>
  > = {
    callContract: handleCallContract,
    getBalance: handleGetBalance,
    getBlock: handleGetBlock,
    getTransaction: handleGetTransaction,
    getStarkName: handleGetStarkName,
    getStarkProfile: handleGetStarkProfile,
    getChainInfo: handleGetChainInfo,
  }

  // 不需要 chain 参数的方法
  private noChainHandlers: Record<string, (request: RpcRequest) => Promise<RpcResponse>> = {
    listChains: handleListChains,
  }

  /**
   * 检查是否支持该方法
   */
  canHandle(method: string): boolean {
    return (
      method in this.chainHandlers ||
      method in this.noChainHandlers ||
      this.isChainSpecificMethod(method)
    )
  }

  /**
   * 检查是否是链特定方法（动态方法）
   */
  private isChainSpecificMethod(method: string): boolean {
    // 排除合约管理方法
    if (method.startsWith("contracts.")) {
      return false
    }
    // 其他方法可能是链特定方法
    return true
  }

  /**
   * 处理请求
   */
  async handleRequest(request: RpcRequest): Promise<RpcResponse> {
    // 1. 检查不需要 chain 的方法
    if (this.noChainHandlers[request.method]) {
      const handler = this.noChainHandlers[request.method]
      return await handler(request)
    }

    // 2. 获取链实例（用于需要 chain 的方法）
    const chainId = request.chainId || chainManager.getDefaultChainId()
    const chain = chainManager.getChain(chainId)

    // 3. 检查需要 chain 的处理器
    if (this.chainHandlers[request.method]) {
      const handler = this.chainHandlers[request.method]
      // 特殊处理需要 chainId 的方法
      if (request.method === "getStarkName" || request.method === "getStarkProfile") {
        return await handler(request, chain, chainId)
      }
      return await handler(request, chain)
    }

    // 4. 尝试作为链特定方法调用
    return await handleChainMethod(request, chain)
  }
}
