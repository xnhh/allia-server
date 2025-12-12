import { RpcRequest, RpcResponse } from "../types"
import { chainManager } from "../chains/manager"

export class RpcService {
  constructor() {
    console.log("RPC Service initialized")
    const chains = chainManager.getAllChains()
    console.log(
      `Registered chains: ${chains.map((c) => `${c.name} (${c.chainId})`).join(", ")}`
    )
  }

  async handleRequest(request: RpcRequest): Promise<RpcResponse> {
    try {
      // Get chain instance (default to configured default chain)
      const chainId = request.chainId || chainManager.getDefaultChainId()
      const chain = chainManager.getChain(chainId)

      let result: any

      // Standard methods supported by all chains
      switch (request.method) {
        case "callContract":
          result = await chain.callContract({
            contractAddress: request.params?.contractAddress,
            entrypoint: request.params?.entrypoint,
            calldata: request.params?.calldata || [],
            network: request.params?.network,
          })
          break

        case "getBalance":
          result = await chain.getBalance({
            address: request.params?.address,
            contractAddress: request.params?.contractAddress,
            network: request.params?.network,
          })
          break

        case "getBlock":
          result = await chain.getBlock({
            blockNumber: request.params?.blockNumber,
            blockHash: request.params?.blockHash,
            network: request.params?.network,
          })
          break

        case "getTransaction":
          result = await chain.getTransaction({
            transactionHash: request.params?.transactionHash,
            network: request.params?.network,
          })
          break

        // Chain-specific methods
        case "getStarkName":
          if (chainId === "starknet" && typeof chain.getStarkName === "function") {
            result = await chain.getStarkName({
              address: request.params?.address,
              network: request.params?.network,
            })
          } else {
            throw new Error(`Method "getStarkName" is not supported for chain "${chainId}"`)
          }
          break

        case "getStarkProfile":
          if (chainId === "starknet" && typeof chain.getStarkProfile === "function") {
            result = await chain.getStarkProfile({
              address: request.params?.address,
              network: request.params?.network,
            })
          } else {
            throw new Error(`Method "getStarkProfile" is not supported for chain "${chainId}"`)
          }
          break

        // List available chains
        case "listChains":
          result = chainManager.getAllChains().map((c) => ({
            chainId: c.chainId,
            name: c.name,
            supportedNetworks: c.supportedNetworks,
          }))
          break

        // Get chain info
        case "getChainInfo":
          result = {
            chainId: chain.chainId,
            name: chain.name,
            supportedNetworks: chain.supportedNetworks,
            defaultChainId: chainManager.getDefaultChainId(),
          }
          break

        default:
          // Try to call as chain-specific method
          if (typeof chain[request.method] === "function") {
            result = await chain[request.method](request.params || {})
          } else {
            throw new Error(
              `Unknown method: ${request.method}. Available methods: callContract, getBalance, getBlock, getTransaction, listChains, getChainInfo`
            )
          }
      }

      return {
        id: request.id,
        result,
      }
    } catch (error: any) {
      return {
        id: request.id,
        error: {
          code: -32000,
          message: error.message || "Internal error",
          data: error.stack,
        },
      }
    }
  }
}

