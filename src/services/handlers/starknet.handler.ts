import { RpcRequest, RpcResponse } from "../../types"
import * as contractsDb from "../../db/starknet/contracts"

export async function handleContractsList(request: RpcRequest): Promise<RpcResponse> {
  const result = await contractsDb.getAllContractsWithInstances(
    request.params?.ownerAddress,
    request.params?.network
  )
  return { id: request.id, result }
}

export async function handleContractsGet(request: RpcRequest): Promise<RpcResponse> {
  const result = await contractsDb.getContractWithInstances(request.params?.id)
  if (!result) {
    throw new Error(`Contract not found: ${request.params?.id}`)
  }
  return { id: request.id, result }
}

export async function handleContractsCreate(request: RpcRequest): Promise<RpcResponse> {
  const result = await contractsDb.createContract({
    name: request.params?.name,
    description: request.params?.description,
    network: request.params?.network,
    sierra_json: request.params?.sierraJson,
    casm_json: request.params?.casmJson,
    contract_class_json: request.params?.contractClassJson,
    compiled_contract_class_json: request.params?.compiledContractClassJson,
    owner_address: request.params?.ownerAddress,
  })
  return { id: request.id, result }
}

export async function handleContractsUpdate(request: RpcRequest): Promise<RpcResponse> {
  const result = await contractsDb.updateContract(request.params?.id, {
    name: request.params?.name,
    description: request.params?.description,
    sierra_json: request.params?.sierraJson,
    casm_json: request.params?.casmJson,
    contract_class_json: request.params?.contractClassJson,
    compiled_contract_class_json: request.params?.compiledContractClassJson,
    class_hash: request.params?.classHash,
    compiled_class_hash: request.params?.compiledClassHash,
    status: request.params?.status,
    declare_tx_hash: request.params?.declareTxHash,
  })
  if (!result) {
    throw new Error(`Contract not found: ${request.params?.id}`)
  }
  return { id: request.id, result }
}

export async function handleContractsDelete(request: RpcRequest): Promise<RpcResponse> {
  const deleted = await contractsDb.deleteContract(request.params?.id)
  if (!deleted) {
    throw new Error(`Contract not found: ${request.params?.id}`)
  }
  return { id: request.id, result: { success: true } }
}

export async function handleInstancesCreate(request: RpcRequest): Promise<RpcResponse> {
  const result = await contractsDb.createInstance({
    contract_id: request.params?.contractId,
    instance_address: request.params?.instanceAddress,
    constructor_calldata: request.params?.constructorCalldata,
    deploy_tx_hash: request.params?.deployTxHash,
    deployer_address: request.params?.deployerAddress,
    salt: request.params?.salt,
    status: request.params?.status,
  })
  return { id: request.id, result }
}

export async function handleInstancesUpdateStatus(request: RpcRequest): Promise<RpcResponse> {
  const result = await contractsDb.updateInstanceStatus(
    request.params?.id,
    request.params?.status,
    request.params?.deployTxHash
  )
  if (!result) {
    throw new Error(`Instance not found: ${request.params?.id}`)
  }
  return { id: request.id, result }
}

export async function handleInstancesDelete(request: RpcRequest): Promise<RpcResponse> {
  const instanceDeleted = await contractsDb.deleteInstance(request.params?.id)
  if (!instanceDeleted) {
    throw new Error(`Instance not found: ${request.params?.id}`)
  }
  return { id: request.id, result: { success: true } }
}
