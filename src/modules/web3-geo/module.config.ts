/**
 * @fileoverview Web3 Geo Module Configuration
 * @description 模块配置 - 集成到平台配置系统
 */

import type { GeoAssetType } from './types'

export interface Web3GeoModuleConfig {
  id: string
  name: string
  description: string
  version: string
  type: 'local'

  routes: Array<{
    path: string
    component: string
    meta: { title: string; requiresAuth?: boolean }
  }>

  menu: {
    title: string
    icon: string
    order: number
    visible: boolean
  }

  capabilities: {
    provides: string[]
    requires: string[]
  }

  config: {
    defaultChainId: number
    supportedAssetTypes: GeoAssetType[]
    enableTestnet: boolean
    ipfsGateway: string
  }

  state: {
    namespace: string
    persist: boolean
  }
}

export const web3GeoModuleConfig: Web3GeoModuleConfig = {
  id: 'web3-geo',
  name: 'GeoAsset Protocol',
  description: '地质资源数字化资产平台',
  version: '1.0.0',
  type: 'local',

  routes: [
    {
      path: '/geo',
      component: 'GeoExplorerPage',
      meta: { title: 'Geo Explorer' },
    },
    {
      path: '/geo/asset/:tokenId',
      component: 'GeoAssetDetailPage',
      meta: { title: 'Asset Detail' },
    },
    {
      path: '/geo/mint',
      component: 'GeoMintPage',
      meta: { title: 'Mint Asset', requiresAuth: true },
    },
    {
      path: '/geo/marketplace',
      component: 'GeoMarketplacePage',
      meta: { title: 'Marketplace' },
    },
    {
      path: '/geo/my-assets',
      component: 'MyAssetsPage',
      meta: { title: 'My Assets', requiresAuth: true },
    },
  ],

  menu: {
    title: 'GeoAsset',
    icon: 'globe',
    order: 5,
    visible: true,
  },

  capabilities: {
    provides: [
      'web3.wallet.connect',
      'web3.geo.mint',
      'web3.geo.transfer',
      'web3.geo.list',
      'web3.geo.buy',
    ],
    requires: ['platform.eventBus', 'platform.router'],
  },

  config: {
    defaultChainId: 84532, // Base Sepolia
    supportedAssetTypes: [
      'mineral',
      'stratum',
      'fossil',
      'survey',
      'geopark',
      'carbon_sink',
    ] as GeoAssetType[],
    enableTestnet: true,
    ipfsGateway: 'https://ipfs.io/ipfs/',
  },

  state: {
    namespace: 'web3-geo',
    persist: true,
  },
}
