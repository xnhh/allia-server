import { RpcRequest, RpcResponse } from "../../types"
import {
  handleContractsList,
  handleContractsGet,
  handleContractsCreate,
  handleContractsUpdate,
  handleContractsDelete,
  handleInstancesCreate,
  handleInstancesUpdateStatus,
  handleInstancesDelete,
} from "../handlers/starknet.handler"

/**
 * Starknet 合约管理路由
 * 处理所有合约相关的 RPC 方法
 */
export class StarknetRouter {
  // 合约管理方法路由
  private handlers: Record<string, (request: RpcRequest) => Promise<RpcResponse>> = {
    "contracts.list": handleContractsList,
    "contracts.get": handleContractsGet,
    "contracts.create": handleContractsCreate,
    "contracts.update": handleContractsUpdate,
    "contracts.delete": handleContractsDelete,
    "contracts.instances.create": handleInstancesCreate,
    "contracts.instances.updateStatus": handleInstancesUpdateStatus,
    "contracts.instances.delete": handleInstancesDelete,
  }

  /**
   * 检查是否支持该方法
   */
  canHandle(method: string): boolean {
    return method in this.handlers
  }

  /**
   * 处理请求
   */
  async handleRequest(request: RpcRequest): Promise<RpcResponse> {
    const handler = this.handlers[request.method]
    if (!handler) {
      throw new Error(`Unknown starknet method: ${request.method}`)
    }
    return handler(request)
  }
}
