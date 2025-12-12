import dotenv from "dotenv"
import { IChain, BaseChain } from "./base"
import { StarknetChain } from "./starknet"

// Load environment variables before creating chain instances
dotenv.config()

/**
 * Chain Manager - manages multiple blockchain chain instances
 */
export class ChainManager {
  private chains: Map<string, IChain> = new Map()
  private defaultChainId: string = "starknet"

  constructor() {
    // Register default chains
    this.registerDefaultChains()
  }

  /**
   * Register default chains
   */
  private registerDefaultChains(): void {
    // Register Starknet
    const starknetChain = new StarknetChain()
    this.registerChain(starknetChain)
  }

  /**
   * Register a chain instance
   */
  registerChain(chain: IChain): void {
    if (this.chains.has(chain.chainId)) {
      console.warn(
        `Chain "${chain.chainId}" is already registered. Overwriting...`
      )
    }
    this.chains.set(chain.chainId, chain)
    console.log(`[ChainManager] Registered chain: ${chain.name} (${chain.chainId})`)
  }

  /**
   * Get a chain instance by chain ID
   */
  getChain(chainId: string): IChain {
    const chain = this.chains.get(chainId)
    if (!chain) {
      throw new Error(
        `Chain "${chainId}" is not registered. Available chains: ${Array.from(
          this.chains.keys()
        ).join(", ")}`
      )
    }
    return chain
  }

  /**
   * Get all registered chains
   */
  getAllChains(): IChain[] {
    return Array.from(this.chains.values())
  }

  /**
   * Get list of chain IDs
   */
  getChainIds(): string[] {
    return Array.from(this.chains.keys())
  }

  /**
   * Check if a chain is registered
   */
  hasChain(chainId: string): boolean {
    return this.chains.has(chainId)
  }

  /**
   * Set default chain ID
   */
  setDefaultChain(chainId: string): void {
    if (!this.chains.has(chainId)) {
      throw new Error(`Chain "${chainId}" is not registered`)
    }
    this.defaultChainId = chainId
  }

  /**
   * Get default chain
   */
  getDefaultChain(): IChain {
    return this.getChain(this.defaultChainId)
  }

  /**
   * Get default chain ID
   */
  getDefaultChainId(): string {
    return this.defaultChainId
  }
}

// Singleton instance
export const chainManager = new ChainManager()

