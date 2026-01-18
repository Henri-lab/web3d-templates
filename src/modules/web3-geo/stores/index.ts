/**
 * @fileoverview Web3 Geo Module Store
 * @description Zustand 状态管理
 */

import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { Web3GeoState, GeoAssetOnChain, Listing, SupportedChainId } from '../types'

const initialState = {
  // Connection
  isConnected: false,
  address: null,
  chainId: null,

  // Assets
  ownedAssets: [],
  selectedAsset: null,

  // Listings
  activeListings: [],

  // UI State
  isLoading: false,
  error: null,
}

export const useWeb3GeoStore = create<Web3GeoState>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        // Actions
        setConnected: (connected: boolean, address?: `0x${string}`) =>
          set(
            { isConnected: connected, address: address ?? null },
            false,
            'setConnected'
          ),

        setChainId: (chainId: SupportedChainId) =>
          set({ chainId }, false, 'setChainId'),

        setOwnedAssets: (assets: GeoAssetOnChain[]) =>
          set({ ownedAssets: assets }, false, 'setOwnedAssets'),

        selectAsset: (asset: GeoAssetOnChain | null) =>
          set({ selectedAsset: asset }, false, 'selectAsset'),

        setListings: (listings: Listing[]) =>
          set({ activeListings: listings }, false, 'setListings'),

        setLoading: (loading: boolean) =>
          set({ isLoading: loading }, false, 'setLoading'),

        setError: (error: string | null) =>
          set({ error }, false, 'setError'),

        reset: () => set(initialState, false, 'reset'),
      }),
      {
        name: 'web3-geo-storage',
        partialize: (state) => ({
          // 只持久化必要的状态
          chainId: state.chainId,
        }),
      }
    ),
    { name: 'Web3GeoStore' }
  )
)

// ============================================================
// Selectors (性能优化)
// ============================================================

export const selectIsConnected = (state: Web3GeoState) => state.isConnected
export const selectAddress = (state: Web3GeoState) => state.address
export const selectChainId = (state: Web3GeoState) => state.chainId
export const selectOwnedAssets = (state: Web3GeoState) => state.ownedAssets
export const selectSelectedAsset = (state: Web3GeoState) => state.selectedAsset
export const selectActiveListings = (state: Web3GeoState) => state.activeListings
export const selectIsLoading = (state: Web3GeoState) => state.isLoading
export const selectError = (state: Web3GeoState) => state.error

// Derived selectors
export const selectOwnedAssetCount = (state: Web3GeoState) =>
  state.ownedAssets.length

export const selectAssetsByType = (type: string) => (state: Web3GeoState) =>
  state.ownedAssets.filter((asset) => asset.assetType === type)
