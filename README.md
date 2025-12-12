# Allia Server

WebSocket server for Allia RPC operations. This server handles all non-wallet RPC operations, allowing the frontend to query blockchain data without directly connecting to RPC nodes.

## Features

- WebSocket server for real-time communication
- RPC proxy for Starknet network calls
- Support for multiple networks (Mainnet, Sepolia)
- Contract call proxy
- Balance queries
- Starknet ID and Profile queries

## Installation

```bash
npm install
```

## Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Update the environment variables in `.env`:
- `PORT`: HTTP server port (default: 8080)
- `WS_PORT`: WebSocket server port (default: 8081)
- `STARKNET_MAINNET_RPC_URL`: Mainnet RPC endpoint
- `STARKNET_SEPOLIA_RPC_URL`: Sepolia RPC endpoint
- `DEFAULT_CHAIN_ID`: Default chain ID (SN_MAIN or SN_SEPOLIA)
- `CORS_ORIGIN`: Allowed CORS origin

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
npm start
```

## WebSocket API

### Connection

Connect to `ws://localhost:8081` (or your configured WS_PORT)

### Message Format

#### Request
```json
{
  "id": "unique-request-id",
  "method": "rpc_method_name",
  "chainId": "starknet",  // Optional: chain identifier (defaults to configured default chain)
  "params": {
    "network": "mainnet",  // Optional: network name (e.g., "mainnet", "sepolia")
    // method-specific parameters
  }
}
```

#### Response
```json
{
  "id": "unique-request-id",
  "result": {
    // method result
  },
  "error": null
}
```

### Supported Methods

#### Standard Methods (supported by all chains)

- `callContract`: Call a contract method
  ```json
  {
    "id": "1",
    "method": "callContract",
    "chainId": "starknet",
    "params": {
      "contractAddress": "0x...",
      "entrypoint": "balanceOf",
      "calldata": ["0x..."],
      "network": "mainnet"
    }
  }
  ```

- `getBalance`: Get account balance
  ```json
  {
    "id": "2",
    "method": "getBalance",
    "chainId": "starknet",
    "params": {
      "address": "0x...",
      "network": "mainnet"
    }
  }
  ```

- `getBlock`: Get block information
- `getTransaction`: Get transaction information

#### Chain-Specific Methods

- `getStarkName`: Get Starknet ID name (Starknet only)
- `getStarkProfile`: Get Starknet profile (Starknet only)

#### Utility Methods

- `listChains`: List all available chains
  ```json
  {
    "id": "3",
    "method": "listChains"
  }
  ```

- `getChainInfo`: Get information about a specific chain
  ```json
  {
    "id": "4",
    "method": "getChainInfo",
    "chainId": "starknet"
  }
  ```

## Architecture

The server acts as a proxy between the frontend and blockchain RPC nodes, handling:
- Read-only RPC operations (queries)
- Contract state queries
- Balance and account information queries

Wallet operations (signing, sending transactions) remain in the frontend.

### Multi-Chain Support

The server is designed with a multi-chain architecture:

1. **Base Chain Interface** (`chains/base.ts`): Defines the interface that all chain implementations must follow
2. **Chain Implementations**: Each blockchain has its own implementation (e.g., `chains/starknet.ts`)
3. **Chain Manager** (`chains/manager.ts`): Manages multiple chain instances and routes requests to the appropriate chain

### Adding a New Chain

To add support for a new blockchain:

1. **Create a chain implementation** extending `BaseChain`:
   ```typescript
   // src/chains/yourchain.ts
   import { BaseChain } from "./base"
   
   export class YourChain extends BaseChain {
     readonly chainId = "yourchain"
     readonly name = "Your Chain"
     readonly supportedNetworks = ["mainnet", "testnet"]
     
     // Implement required methods
     async callContract(params) { ... }
     async getBalance(params) { ... }
     async getBlock(params) { ... }
     async getTransaction(params) { ... }
   }
   ```

2. **Register the chain** in `chains/manager.ts`:
   ```typescript
   import { YourChain } from "./yourchain"
   
   private registerDefaultChains(): void {
     // ... existing chains
     const yourChain = new YourChain()
     this.registerChain(yourChain)
   }
   ```

3. **Use the chain** in requests by specifying `chainId`:
   ```json
   {
     "id": "1",
     "method": "getBalance",
     "chainId": "yourchain",
     "params": {
       "address": "0x...",
       "network": "mainnet"
     }
   }
   ```

See `chains/ethereum.example.ts` for a complete example template.

