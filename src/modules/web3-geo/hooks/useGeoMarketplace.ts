/**
 * @fileoverview GeoMarketplace Contract Hook
 * @description 地质资产交易市场合约交互
 */

import { useCallback } from 'react'
import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
} from 'wagmi'
import { parseAbi } from 'viem'
import { CHAIN_CONFIGS, DEFAULT_CHAIN_ID, GEO_MARKETPLACE_ABI } from '../constants'
import { parseContractError, parseEther } from '../utils'
import type { ListingParams, Listing } from '../types'

// ============================================================
// ABI
// ============================================================

const marketplaceAbi = parseAbi(GEO_MARKETPLACE_ABI)

// ============================================================
// Hook: Marketplace Operations
// ============================================================

export interface UseGeoMarketplaceReturn {
  // Read
  platformFee: bigint | undefined

  // Write - Listing
  createListing: (params: ListingParams) => Promise<`0x${string}` | undefined>
  cancelListing: (listingId: bigint) => Promise<`0x${string}` | undefined>
  updatePrice: (listingId: bigint, newPrice: bigint) => Promise<`0x${string}` | undefined>

  // Write - Buy
  buyListing: (listingId: bigint, price: bigint) => Promise<`0x${string}` | undefined>

  // State
  isPending: boolean
  error: string | null
  txHash: `0x${string}` | undefined
  isConfirming: boolean
  isConfirmed: boolean
}

export function useGeoMarketplace(chainId?: number): UseGeoMarketplaceReturn {
  const { address } = useAccount()
  const targetChainId = chainId || DEFAULT_CHAIN_ID
  const contractAddress = CHAIN_CONFIGS[targetChainId as keyof typeof CHAIN_CONFIGS]?.contracts.geoMarketplace

  // Read: Platform Fee
  const { data: platformFee } = useReadContract({
    address: contractAddress,
    abi: marketplaceAbi,
    functionName: 'platformFee',
    query: {
      enabled: !!contractAddress && contractAddress !== '0x0000000000000000000000000000000000000000',
    },
  })

  // Write contract
  const {
    writeContractAsync,
    data: txHash,
    isPending,
    error: writeError,
  } = useWriteContract()

  // Wait for transaction
  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
  } = useWaitForTransactionReceipt({
    hash: txHash,
  })

  // Create Listing
  const createListing = useCallback(
    async (params: ListingParams): Promise<`0x${string}` | undefined> => {
      if (!contractAddress || !address) return undefined

      const geoAssetAddress = CHAIN_CONFIGS[targetChainId as keyof typeof CHAIN_CONFIGS]?.contracts.geoAsset
      const currencyAddress = params.currency === 'ETH'
        ? '0x0000000000000000000000000000000000000000' as `0x${string}`
        : params.currency

      try {
        const hash = await writeContractAsync({
          address: contractAddress,
          abi: marketplaceAbi,
          functionName: 'createListing',
          args: [
            geoAssetAddress,
            params.tokenId,
            params.price,
            currencyAddress,
            BigInt(params.duration),
          ],
        })
        return hash
      } catch (error) {
        console.error('Create listing error:', error)
        throw error
      }
    },
    [contractAddress, address, targetChainId, writeContractAsync]
  )

  // Cancel Listing
  const cancelListing = useCallback(
    async (listingId: bigint): Promise<`0x${string}` | undefined> => {
      if (!contractAddress) return undefined

      try {
        const hash = await writeContractAsync({
          address: contractAddress,
          abi: marketplaceAbi,
          functionName: 'cancelListing',
          args: [listingId],
        })
        return hash
      } catch (error) {
        console.error('Cancel listing error:', error)
        throw error
      }
    },
    [contractAddress, writeContractAsync]
  )

  // Update Price
  const updatePrice = useCallback(
    async (listingId: bigint, newPrice: bigint): Promise<`0x${string}` | undefined> => {
      if (!contractAddress) return undefined

      try {
        const hash = await writeContractAsync({
          address: contractAddress,
          abi: marketplaceAbi,
          functionName: 'updatePrice',
          args: [listingId, newPrice],
        })
        return hash
      } catch (error) {
        console.error('Update price error:', error)
        throw error
      }
    },
    [contractAddress, writeContractAsync]
  )

  // Buy Listing
  const buyListing = useCallback(
    async (listingId: bigint, price: bigint): Promise<`0x${string}` | undefined> => {
      if (!contractAddress) return undefined

      try {
        const hash = await writeContractAsync({
          address: contractAddress,
          abi: marketplaceAbi,
          functionName: 'buyListing',
          args: [listingId],
          value: price, // ETH payment
        })
        return hash
      } catch (error) {
        console.error('Buy listing error:', error)
        throw error
      }
    },
    [contractAddress, writeContractAsync]
  )

  return {
    platformFee: platformFee as bigint | undefined,

    createListing,
    cancelListing,
    updatePrice,
    buyListing,

    isPending,
    error: writeError ? parseContractError(writeError) : null,
    txHash,
    isConfirming,
    isConfirmed,
  }
}

// ============================================================
// Hook: Read Listings
// ============================================================

export interface UseListingsReturn {
  listings: Listing[]
  isLoading: boolean
  refetch: () => void
}

export function useActiveListings(
  offset = 0,
  limit = 20,
  chainId?: number
): UseListingsReturn {
  const targetChainId = chainId || DEFAULT_CHAIN_ID
  const contractAddress = CHAIN_CONFIGS[targetChainId as keyof typeof CHAIN_CONFIGS]?.contracts.geoMarketplace

  const {
    data: listingIds,
    isLoading,
    refetch,
  } = useReadContract({
    address: contractAddress,
    abi: marketplaceAbi,
    functionName: 'getActiveListings',
    args: [BigInt(offset), BigInt(limit)],
    query: {
      enabled: !!contractAddress && contractAddress !== '0x0000000000000000000000000000000000000000',
    },
  })

  // TODO: Fetch full listing data for each ID
  // For now, return empty array
  const listings: Listing[] = []

  return {
    listings,
    isLoading,
    refetch,
  }
}

// ============================================================
// Hook: Single Listing
// ============================================================

export function useListing(listingId: bigint, chainId?: number) {
  const targetChainId = chainId || DEFAULT_CHAIN_ID
  const contractAddress = CHAIN_CONFIGS[targetChainId as keyof typeof CHAIN_CONFIGS]?.contracts.geoMarketplace

  const {
    data: listing,
    isLoading,
    refetch,
  } = useReadContract({
    address: contractAddress,
    abi: marketplaceAbi,
    functionName: 'getListing',
    args: [listingId],
    query: {
      enabled: !!contractAddress && contractAddress !== '0x0000000000000000000000000000000000000000',
    },
  })

  return {
    listing: listing as Listing | undefined,
    isLoading,
    refetch,
  }
}
