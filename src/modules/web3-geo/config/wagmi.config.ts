/**
 * @fileoverview Web3 Provider Configuration
 * @description wagmi + viem 配置
 */

import { http, createConfig } from 'wagmi'
import { base, baseSepolia, arbitrum, arbitrumSepolia, mainnet } from 'wagmi/chains'
import { coinbaseWallet, injected, walletConnect } from 'wagmi/connectors'

// ============================================================
// Environment Variables
// ============================================================

const WALLET_CONNECT_PROJECT_ID = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID || ''
const ALCHEMY_API_KEY = import.meta.env.VITE_ALCHEMY_API_KEY || ''

// ============================================================
// Chain Configuration
// ============================================================

export const supportedChains = [
  baseSepolia,  // 默认开发链
  base,
  arbitrumSepolia,
  arbitrum,
  mainnet,
] as const

// ============================================================
// Transport Configuration
// ============================================================

const transports = {
  [mainnet.id]: http(
    ALCHEMY_API_KEY
      ? `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`
      : undefined
  ),
  [base.id]: http('https://mainnet.base.org'),
  [baseSepolia.id]: http('https://sepolia.base.org'),
  [arbitrum.id]: http('https://arb1.arbitrum.io/rpc'),
  [arbitrumSepolia.id]: http('https://sepolia-rollup.arbitrum.io/rpc'),
}

// ============================================================
// Wagmi Config
// ============================================================

export const wagmiConfig = createConfig({
  chains: supportedChains,
  connectors: [
    // 浏览器钱包 (MetaMask, etc.)
    injected({
      shimDisconnect: true,
    }),

    // Coinbase Wallet (推荐用于 Base)
    coinbaseWallet({
      appName: 'GeoAsset Protocol',
      appLogoUrl: '/logo.svg',
    }),

    // WalletConnect (移动端钱包)
    ...(WALLET_CONNECT_PROJECT_ID
      ? [
          walletConnect({
            projectId: WALLET_CONNECT_PROJECT_ID,
            metadata: {
              name: 'GeoAsset Protocol',
              description: 'Geological Asset Tokenization Platform',
              url: 'https://geoasset.io',
              icons: ['/logo.svg'],
            },
          }),
        ]
      : []),
  ],
  transports,
})

// ============================================================
// Type Exports
// ============================================================

export type SupportedChain = (typeof supportedChains)[number]
export type SupportedChainId = SupportedChain['id']

declare module 'wagmi' {
  interface Register {
    config: typeof wagmiConfig
  }
}
