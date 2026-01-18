/**
 * @fileoverview Wallet Connection Hook
 * @description 钱包连接和状态管理
 */

import { useCallback, useEffect } from 'react'
import {
  useAccount,
  useConnect,
  useDisconnect,
  useChainId,
  useSwitchChain,
  useBalance,
} from 'wagmi'
import { useWeb3GeoStore } from '../stores'
import { DEFAULT_CHAIN_ID } from '../constants'
import type { SupportedChainId } from '../types'

export interface UseWalletReturn {
  // State
  address: `0x${string}` | undefined
  isConnected: boolean
  isConnecting: boolean
  chainId: number | undefined
  balance: bigint | undefined
  balanceFormatted: string | undefined

  // Actions
  connect: (connectorId?: string) => void
  disconnect: () => void
  switchChain: (chainId: SupportedChainId) => Promise<void>

  // Helpers
  isCorrectChain: boolean
  connectors: ReturnType<typeof useConnect>['connectors']
}

export function useWallet(): UseWalletReturn {
  const { address, isConnected, isConnecting } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const chainId = useChainId()
  const { switchChainAsync } = useSwitchChain()
  const { data: balanceData } = useBalance({ address })

  // Store sync
  const { setConnected, setChainId } = useWeb3GeoStore()

  // Sync wallet state to store
  useEffect(() => {
    setConnected(isConnected, address)
  }, [isConnected, address, setConnected])

  useEffect(() => {
    if (chainId) {
      setChainId(chainId as SupportedChainId)
    }
  }, [chainId, setChainId])

  // Connect handler
  const handleConnect = useCallback(
    (connectorId?: string) => {
      const connector = connectorId
        ? connectors.find((c) => c.id === connectorId)
        : connectors[0]

      if (connector) {
        connect({ connector })
      }
    },
    [connect, connectors]
  )

  // Switch chain handler
  const handleSwitchChain = useCallback(
    async (targetChainId: SupportedChainId) => {
      if (switchChainAsync) {
        await switchChainAsync({ chainId: targetChainId })
      }
    },
    [switchChainAsync]
  )

  // Check if on correct chain
  const isCorrectChain = chainId === DEFAULT_CHAIN_ID

  return {
    address,
    isConnected,
    isConnecting: isConnecting || isPending,
    chainId,
    balance: balanceData?.value,
    balanceFormatted: balanceData?.formatted,

    connect: handleConnect,
    disconnect,
    switchChain: handleSwitchChain,

    isCorrectChain,
    connectors,
  }
}

/**
 * Hook to ensure wallet is connected before action
 */
export function useRequireWallet() {
  const { isConnected, connect } = useWallet()

  const requireWallet = useCallback(
    async <T>(action: () => Promise<T>): Promise<T | null> => {
      if (!isConnected) {
        connect()
        return null
      }
      return action()
    },
    [isConnected, connect]
  )

  return { requireWallet, isConnected }
}
