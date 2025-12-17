import { prisma } from "../prisma"

// ============================================================================
// 类型定义
// ============================================================================

// 合约状态
export type ContractStatus = "draft" | "declared" | "deployed"
export type InstanceStatus = "pending" | "deployed" | "failed"

// JSON 类型定义
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type JsonValue = any

// 合约类型定义
export interface Contract {
  id: string
  name: string
  description?: string
  network: string
  sierra_json?: JsonValue
  casm_json?: JsonValue
  class_hash?: string
  compiled_class_hash?: string
  status: ContractStatus
  owner_address?: string
  declare_tx_hash?: string
  created_at: Date
  updated_at: Date
}

export interface ContractInstance {
  id: string
  contract_id: string
  instance_address: string
  constructor_calldata?: JsonValue
  deploy_tx_hash?: string
  deployer_address?: string
  salt?: string
  status: InstanceStatus
  created_at: Date
  updated_at: Date
}

// 创建合约输入
export interface CreateContractInput {
  name: string
  description?: string
  network?: string
  sierra_json?: JsonValue
  casm_json?: JsonValue
  owner_address?: string
}

// 更新合约输入
export interface UpdateContractInput {
  name?: string
  description?: string
  sierra_json?: JsonValue
  casm_json?: JsonValue
  class_hash?: string
  compiled_class_hash?: string
  status?: ContractStatus
  declare_tx_hash?: string
}

// 创建实例输入
export interface CreateInstanceInput {
  contract_id: string
  instance_address: string
  constructor_calldata?: JsonValue
  deploy_tx_hash?: string
  deployer_address?: string
  salt?: string
  status?: InstanceStatus
}

// 合约与实例联合查询
export interface ContractWithInstances extends Contract {
  instances: ContractInstance[]
}

// ============================================================================
// 合约 CRUD 操作（使用 Prisma）
// ============================================================================

export async function getAllContracts(
  ownerAddress?: string,
  network?: string
): Promise<Contract[]> {
  const contracts = await prisma.contract.findMany({
    where: {
      ...(ownerAddress && { owner_address: ownerAddress }),
      ...(network && { network }),
    },
    orderBy: {
      updated_at: "desc",
    },
  })

  return contracts.map(mapContractFromPrisma)
}

export async function getContractById(id: string): Promise<Contract | null> {
  const contract = await prisma.contract.findUnique({
    where: { id },
  })

  return contract ? mapContractFromPrisma(contract) : null
}

export async function getContractByClassHash(classHash: string): Promise<Contract | null> {
  const contract = await prisma.contract.findFirst({
    where: { class_hash: classHash },
  })

  return contract ? mapContractFromPrisma(contract) : null
}

export async function createContract(input: CreateContractInput): Promise<Contract> {
  const contract = await prisma.contract.create({
    data: {
      name: input.name,
      description: input.description,
      network: input.network || "sepolia",
      sierra_json: input.sierra_json,
      casm_json: input.casm_json,
      owner_address: input.owner_address,
    },
  })

  return mapContractFromPrisma(contract)
}

export async function updateContract(
  id: string,
  input: UpdateContractInput
): Promise<Contract | null> {
  const contract = await prisma.contract.update({
    where: { id },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.sierra_json !== undefined && { sierra_json: input.sierra_json }),
      ...(input.casm_json !== undefined && { casm_json: input.casm_json }),
      ...(input.class_hash !== undefined && { class_hash: input.class_hash }),
      ...(input.compiled_class_hash !== undefined && {
        compiled_class_hash: input.compiled_class_hash,
      }),
      ...(input.status !== undefined && { status: input.status }),
      ...(input.declare_tx_hash !== undefined && {
        declare_tx_hash: input.declare_tx_hash,
      }),
    },
  })

  return mapContractFromPrisma(contract)
}

export async function deleteContract(id: string): Promise<boolean> {
  try {
    await prisma.contract.delete({
      where: { id },
    })
    return true
  } catch {
    return false
  }
}

// ============================================================================
// 合约实例 CRUD 操作（使用 Prisma）
// ============================================================================

export async function getInstancesByContractId(contractId: string): Promise<ContractInstance[]> {
  const instances = await prisma.contractInstance.findMany({
    where: { contract_id: contractId },
    orderBy: {
      created_at: "desc",
    },
  })

  return instances.map(mapInstanceFromPrisma)
}

export async function getInstanceById(id: string): Promise<ContractInstance | null> {
  const instance = await prisma.contractInstance.findUnique({
    where: { id },
  })

  return instance ? mapInstanceFromPrisma(instance) : null
}

export async function getInstanceByAddress(address: string): Promise<ContractInstance | null> {
  const instance = await prisma.contractInstance.findFirst({
    where: { instance_address: address },
  })

  return instance ? mapInstanceFromPrisma(instance) : null
}

export async function createInstance(input: CreateInstanceInput): Promise<ContractInstance> {
  const instance = await prisma.contractInstance.create({
    data: {
      contract_id: input.contract_id,
      instance_address: input.instance_address,
      constructor_calldata: input.constructor_calldata,
      deploy_tx_hash: input.deploy_tx_hash,
      deployer_address: input.deployer_address,
      salt: input.salt,
      status: input.status || "pending",
    },
  })

  return mapInstanceFromPrisma(instance)
}

export async function updateInstanceStatus(
  id: string,
  status: InstanceStatus,
  deployTxHash?: string
): Promise<ContractInstance | null> {
  const instance = await prisma.contractInstance.update({
    where: { id },
    data: {
      status,
      ...(deployTxHash && { deploy_tx_hash: deployTxHash }),
    },
  })

  return mapInstanceFromPrisma(instance)
}

export async function deleteInstance(id: string): Promise<boolean> {
  try {
    await prisma.contractInstance.delete({
      where: { id },
    })
    return true
  } catch {
    return false
  }
}

// ============================================================================
// 合约与实例联合查询（使用 Prisma）
// ============================================================================

export async function getContractWithInstances(id: string): Promise<ContractWithInstances | null> {
  const contract = await prisma.contract.findUnique({
    where: { id },
    include: {
      instances: {
        orderBy: {
          created_at: "desc",
        },
      },
    },
  })

  if (!contract) return null

  return {
    ...mapContractFromPrisma(contract),
    instances: contract.instances.map(mapInstanceFromPrisma),
  }
}

export async function getAllContractsWithInstances(
  ownerAddress?: string,
  network?: string
): Promise<ContractWithInstances[]> {
  const contracts = await prisma.contract.findMany({
    where: {
      ...(ownerAddress && { owner_address: ownerAddress }),
      ...(network && { network }),
    },
    include: {
      instances: {
        orderBy: {
          created_at: "desc",
        },
      },
    },
    orderBy: {
      updated_at: "desc",
    },
  })

  return contracts.map((contract) => ({
    ...mapContractFromPrisma(contract),
    instances: contract.instances.map(mapInstanceFromPrisma),
  }))
}

// ============================================================================
// 类型映射辅助函数
// ============================================================================

function mapContractFromPrisma(contract: {
  id: string
  name: string
  description: string | null
  network: string
  sierra_json: JsonValue
  casm_json: JsonValue
  class_hash: string | null
  compiled_class_hash: string | null
  status: string
  owner_address: string | null
  declare_tx_hash: string | null
  created_at: Date
  updated_at: Date
}): Contract {
  return {
    id: contract.id,
    name: contract.name,
    description: contract.description || undefined,
    network: contract.network,
    sierra_json: contract.sierra_json,
    casm_json: contract.casm_json,
    class_hash: contract.class_hash || undefined,
    compiled_class_hash: contract.compiled_class_hash || undefined,
    status: contract.status as ContractStatus,
    owner_address: contract.owner_address || undefined,
    declare_tx_hash: contract.declare_tx_hash || undefined,
    created_at: contract.created_at,
    updated_at: contract.updated_at,
  }
}

function mapInstanceFromPrisma(instance: {
  id: string
  contract_id: string
  instance_address: string
  constructor_calldata: JsonValue
  deploy_tx_hash: string | null
  deployer_address: string | null
  salt: string | null
  status: string
  created_at: Date
  updated_at: Date
}): ContractInstance {
  return {
    id: instance.id,
    contract_id: instance.contract_id,
    instance_address: instance.instance_address,
    constructor_calldata: instance.constructor_calldata,
    deploy_tx_hash: instance.deploy_tx_hash || undefined,
    deployer_address: instance.deployer_address || undefined,
    salt: instance.salt || undefined,
    status: instance.status as InstanceStatus,
    created_at: instance.created_at,
    updated_at: instance.updated_at,
  }
}
