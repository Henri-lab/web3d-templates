/**
 * @fileoverview GeoAsset Contract Hook
 * @description 地质资产 NFT 合约交互
 */

import { useCallback } from 'react'
import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
} from 'wagmi'
import { parseAbi } from 'viem'
import { CHAIN_CONFIGS, DEFAULT_CHAIN_ID, GEO_ASSET_ABI } from '../constants'
import { coordToChain, parseContractError } from '../utils'
import type { GeoAssetType, GeoAssetOnChain, MintParams } from '../types'

// ============================================================
// ABI
// ============================================================

const geoAssetAbi = parseAbi(GEO_ASSET_ABI)

// ============================================================
// Hook
// ============================================================

export interface UseGeoAssetReturn {
  // Read
  totalSupply: bigint | undefined
  isLoadingSupply: boolean

  // Write
  mint: (params: MintParams) => Promise<`0x${string}` | undefined>
  isMinting: boolean
  mintError: string | null

  // Transaction
  txHash: `0x${string}` | undefined
  isConfirming: boolean
  isConfirmed: boolean

  // Helpers
  getAsset: (tokenId: bigint) => Promise<GeoAssetOnChain | null>
  getTokenURI: (tokenId: bigint) => Promise<string | null>
}

export function useGeoAsset(chainId?: number): UseGeoAssetReturn {
  const { address } = useAccount()
  const targetChainId = chainId || DEFAULT_CHAIN_ID
  const contractAddress = CHAIN_CONFIGS[targetChainId as keyof typeof CHAIN_CONFIGS]?.contracts.geoAsset

  // Read: Total Supply
  const {
    data: totalSupply,
    isLoading: isLoadingSupply,
  } = useReadContract({
    address: contractAddress,
    abi: geoAssetAbi,
    functionName: 'totalSupply',
    query: {
      enabled: !!contractAddress && contractAddress !== '0x0000000000000000000000000000000000000000',
    },
  })

  // Write: Mint
  const {
    writeContractAsync,
    data: txHash,
    isPending: isMinting,
    error: writeError,
  } = useWriteContract()

  // Wait for transaction
  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
  } = useWaitForTransactionReceipt({
    hash: txHash,
  })

  // Mint function
  const mint = useCallback(
    async (params: MintParams): Promise<`0x${string}` | undefined> => {
      if (!contractAddress || !address) return undefined

      const assetTypeIndex = getAssetTypeIndex(params.assetType)
      const latitudeChain = coordToChain(params.latitude)
      const longitudeChain = coordToChain(params.longitude)

      try {
        const hash = await writeContractAsync({
          address: contractAddress,
          abi: geoAssetAbi,
          functionName: 'mint',
          args: [
            address,
            assetTypeIndex,
            latitudeChain,
            longitudeChain,
            params.metadataURI,
          ],
        })
        return hash
      } catch (error) {
        console.error('Mint error:', error)
        throw error
      }
    },
    [contractAddress, address, writeContractAsync]
  )

  // Get asset data (for one-off queries)
  const getAsset = useCallback(
    async (tokenId: bigint): Promise<GeoAssetOnChain | null> => {
      // This would typically use a read contract call
      // For now, return null as placeholder
      console.log('getAsset called for tokenId:', tokenId)
      return null
    },
    []
  )

  // Get token URI
  const getTokenURI = useCallback(
    async (tokenId: bigint): Promise<string | null> => {
      console.log('getTokenURI called for tokenId:', tokenId)
      return null
    },
    []
  )

  return {
    totalSupply: totalSupply as bigint | undefined,
    isLoadingSupply,

    mint,
    isMinting,
    mintError: writeError ? parseContractError(writeError) : null,

    txHash,
    isConfirming,
    isConfirmed,

    getAsset,
    getTokenURI,
  }
}

// ============================================================
// Hook: Read owned assets
// ============================================================

export function useOwnedGeoAssets(ownerAddress?: `0x${string}`) {
  const { address } = useAccount()
  const targetAddress = ownerAddress || address
  const contractAddress = CHAIN_CONFIGS[DEFAULT_CHAIN_ID]?.contracts.geoAsset

  const {
    data: balance,
    isLoading,
    refetch,
  } = useReadContract({
    address: contractAddress,
    abi: geoAssetAbi,
    functionName: 'balanceOf',
    args: targetAddress ? [targetAddress] : undefined,
    query: {
      enabled: !!targetAddress && !!contractAddress &&
        contractAddress !== '0x0000000000000000000000000000000000000000',
    },
  })

  return {
    balance: balance as bigint | undefined,
    isLoading,
    refetch,
  }
}

// ============================================================
// Helpers
// ============================================================

function getAssetTypeIndex(assetType: GeoAssetType): number {
  const typeMap: Record<GeoAssetType, number> = {
    mineral: 0,
    stratum: 1,
    fossil: 2,
    survey: 3,
    geopark: 4,
    carbon_sink: 5,
  }
  return typeMap[assetType] ?? 0
}
