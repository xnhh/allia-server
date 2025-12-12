/**
 * Base interface for blockchain chain implementations
 */
export interface IChain {
  /**
   * Chain identifier (e.g., "starknet", "ethereum", "polygon")
   */
  readonly chainId: string

  /**
   * Chain name for display
   */
  readonly name: string

  /**
   * Network names supported by this chain (e.g., "mainnet", "sepolia")
   */
  readonly supportedNetworks: string[]

  /**
   * Call a contract method
   */
  callContract(params: {
    contractAddress: string
    entrypoint: string
    calldata: string[]
    network?: string
  }): Promise<any>

  /**
   * Get account balance
   */
  getBalance(params: {
    address: string
    contractAddress?: string
    network?: string
  }): Promise<{
    value: string
    formatted: string
  }>

  /**
   * Get block information
   */
  getBlock(params: {
    blockNumber?: number | string
    blockHash?: string
    network?: string
  }): Promise<any>

  /**
   * Get transaction information
   */
  getTransaction(params: {
    transactionHash: string
    network?: string
  }): Promise<any>

  /**
   * Chain-specific methods (optional)
   * Each chain can implement its own specific methods
   */
  [method: string]: any
}

/**
 * Base class for chain implementations
 */
export abstract class BaseChain implements IChain {
  abstract readonly chainId: string
  abstract readonly name: string
  abstract readonly supportedNetworks: string[]

  abstract callContract(params: {
    contractAddress: string
    entrypoint: string
    calldata: string[]
    network?: string
  }): Promise<any>

  abstract getBalance(params: {
    address: string
    contractAddress?: string
    network?: string
  }): Promise<{
    value: string
    formatted: string
  }>

  abstract getBlock(params: {
    blockNumber?: number | string
    blockHash?: string
    network?: string
  }): Promise<any>

  abstract getTransaction(params: {
    transactionHash: string
    network?: string
  }): Promise<any>

  /**
   * Validate network is supported
   */
  protected validateNetwork(network?: string): void {
    if (network && !this.supportedNetworks.includes(network)) {
      throw new Error(
        `Network "${network}" is not supported. Supported networks: ${this.supportedNetworks.join(", ")}`
      )
    }
  }

  /**
   * Get default network
   */
  protected getDefaultNetwork(): string {
    return this.supportedNetworks[0] || "mainnet"
  }
}

