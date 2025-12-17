import { RpcRequest, RpcResponse } from "../../types"
import { chainManager } from "../../chains/manager"
import { IChain } from "../../chains/base"

export async function handleCallContract(request: RpcRequest, chain: IChain): Promise<RpcResponse> {
  const result = await chain.callContract({
    contractAddress: request.params?.contractAddress,
    entrypoint: request.params?.entrypoint,
    calldata: request.params?.calldata || [],
    network: request.params?.network,
  })
  return { id: request.id, result }
}

export async function handleGetBalance(request: RpcRequest, chain: IChain): Promise<RpcResponse> {
  const result = await chain.getBalance({
    address: request.params?.address,
    contractAddress: request.params?.contractAddress,
    network: request.params?.network,
  })
  return { id: request.id, result }
}

export async function handleGetBlock(request: RpcRequest, chain: IChain): Promise<RpcResponse> {
  const result = await chain.getBlock({
    blockNumber: request.params?.blockNumber,
    blockHash: request.params?.blockHash,
    network: request.params?.network,
  })
  return { id: request.id, result }
}

export async function handleGetTransaction(
  request: RpcRequest,
  chain: IChain
): Promise<RpcResponse> {
  const result = await chain.getTransaction({
    transactionHash: request.params?.transactionHash,
    network: request.params?.network,
  })
  return { id: request.id, result }
}

export async function handleGetStarkName(
  request: RpcRequest,
  chain: IChain,
  chainId?: string
): Promise<RpcResponse> {
  if (chainId && chainId === "starknet" && typeof chain.getStarkName === "function") {
    const result = await chain.getStarkName({
      address: request.params?.address,
      network: request.params?.network,
    })
    return { id: request.id, result }
  } else {
    throw new Error(`Method "getStarkName" is not supported for chain "${chainId}"`)
  }
}

export async function handleGetStarkProfile(
  request: RpcRequest,
  chain: IChain,
  chainId?: string
): Promise<RpcResponse> {
  if (chainId && chainId === "starknet" && typeof chain.getStarkProfile === "function") {
    const result = await chain.getStarkProfile({
      address: request.params?.address,
      network: request.params?.network,
    })
    return { id: request.id, result }
  } else {
    throw new Error(`Method "getStarkProfile" is not supported for chain "${chainId}"`)
  }
}

export async function handleListChains(request: RpcRequest): Promise<RpcResponse> {
  const result = chainManager.getAllChains().map((c) => ({
    chainId: c.chainId,
    name: c.name,
    supportedNetworks: c.supportedNetworks,
  }))
  return { id: request.id, result }
}

export async function handleGetChainInfo(request: RpcRequest, chain: IChain): Promise<RpcResponse> {
  const result = {
    chainId: chain.chainId,
    name: chain.name,
    supportedNetworks: chain.supportedNetworks,
    defaultChainId: chainManager.getDefaultChainId(),
  }
  return { id: request.id, result }
}

export async function handleChainMethod(request: RpcRequest, chain: IChain): Promise<RpcResponse> {
  // Try to call as chain-specific method
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chainAny = chain as any
  if (typeof chainAny[request.method] === "function") {
    const result = await chainAny[request.method](request.params || {})
    return { id: request.id, result }
  } else {
    throw new Error(
      `Unknown method: ${request.method}. Available methods: callContract, getBalance, getBlock, getTransaction, listChains, getChainInfo`
    )
  }
}
