import { RpcProvider, constants } from "starknet"
import { BaseChain } from "./base"

export interface StarknetConfig {
  mainnetRpcUrl?: string
  sepoliaRpcUrl?: string
}

export class StarknetChain extends BaseChain {
  readonly chainId = "starknet"
  readonly name = "Starknet"
  readonly supportedNetworks = ["mainnet", "sepolia"]

  // ETH token contract address (same for mainnet and sepolia)
  private static readonly ETH_TOKEN_ADDRESS = "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7"

  private mainnetProvider: RpcProvider
  private sepoliaProvider: RpcProvider

  constructor(config?: StarknetConfig) {
    super()

    const mainnetRpcUrl =
      config?.mainnetRpcUrl ||
      process.env.STARKNET_MAINNET_RPC_URL

    const sepoliaRpcUrl =
      config?.sepoliaRpcUrl ||
      process.env.STARKNET_SEPOLIA_RPC_URL

    this.mainnetProvider = new RpcProvider({
      nodeUrl: mainnetRpcUrl,
      chainId: constants.StarknetChainId.SN_MAIN,
    })

    this.sepoliaProvider = new RpcProvider({
      nodeUrl: sepoliaRpcUrl,
      chainId: constants.StarknetChainId.SN_SEPOLIA,
    })

    console.log(`[StarknetChain] Initialized`)
    console.log(`[StarknetChain] Mainnet RPC: ${mainnetRpcUrl}`)
    console.log(`[StarknetChain] Sepolia RPC: ${sepoliaRpcUrl}`)
  }

  private getProvider(network?: string): RpcProvider {
    const targetNetwork = network || this.getDefaultNetwork()
    this.validateNetwork(targetNetwork)

    if (targetNetwork === "mainnet") {
      return this.mainnetProvider
    }
    return this.sepoliaProvider
  }

  async callContract(params: {
    contractAddress: string
    entrypoint: string
    calldata: string[]
    network?: string
  }): Promise<any> {
    const provider = this.getProvider(params.network)

    const result = await provider.callContract({
      contractAddress: params.contractAddress,
      entrypoint: params.entrypoint,
      calldata: params.calldata,
    })

    return result
  }

  async getBalance(params: {
    address: string
    contractAddress?: string
    network?: string
  }): Promise<{
    value: string
    formatted: string
  }> {
    // Use provided contractAddress or default to ETH token contract
    // In Starknet, account balances are stored in token contracts
    const tokenContractAddress = params.contractAddress || StarknetChain.ETH_TOKEN_ADDRESS
    
    const result = await this.callContract({
      contractAddress: tokenContractAddress,
      entrypoint: "balanceOf",
      calldata: [params.address],
      network: params.network,
    })

    console.log("result", result)

    // balanceOf returns a u256, which is represented as [low, high]
    const resultArray = Array.isArray(result) ? result : (result as any).result || []
    const [low, high] = resultArray as [string, string]

    // Convert hex to decimal
    const lowBigInt = BigInt(low || "0x0")
    const highBigInt = BigInt(high || "0x0")
    const totalBalance = highBigInt * BigInt(2 ** 128) + lowBigInt

    return {
      value: totalBalance.toString(),
      formatted: this.formatBalance(totalBalance),
    }
  }

  async getBlock(params: {
    blockNumber?: number | string
    blockHash?: string
    network?: string
  }): Promise<any> {
    const provider = this.getProvider(params.network)

    if (params.blockNumber) {
      return await provider.getBlock(params.blockNumber)
    } else if (params.blockHash) {
      return await provider.getBlock(params.blockHash)
    } else {
      return await provider.getBlock("latest")
    }
  }

  async getTransaction(params: {
    transactionHash: string
    network?: string
  }): Promise<any> {
    const provider = this.getProvider(params.network)

    return await provider.getTransaction(params.transactionHash)
  }

  /**
   * Starknet-specific: Get Starknet ID name
   */
  async getStarkName(params: {
    address: string
    network?: string
  }): Promise<string | null> {
    // TODO: Implement using Starknet ID contracts
    return null
  }

  /**
   * Starknet-specific: Get Starknet profile
   */
  async getStarkProfile(params: {
    address: string
    network?: string
  }): Promise<any | null> {
    // TODO: Implement using Starknet ID contracts
    return null
  }

  private formatBalance(balance: bigint): string {
    const ethValue = Number(balance) / 1e18
    return ethValue.toFixed(6)
  }
}

