/**
 * @fileoverview Web3 Geo Module Constants
 * @description 模块常量定义
 */

import type { ChainConfig, SupportedChainId } from '../types'

// ============================================================
// Chain Configurations
// ============================================================

export const CHAIN_CONFIGS: Record<SupportedChainId, ChainConfig> = {
  // Ethereum Mainnet
  1: {
    id: 1,
    name: 'Ethereum',
    network: 'mainnet',
    rpcUrl: 'https://eth.llamarpc.com',
    blockExplorer: 'https://etherscan.io',
    contracts: {
      geoAsset: '0x0000000000000000000000000000000000000000',
      geoRegistry: '0x0000000000000000000000000000000000000000',
      geoMarketplace: '0x0000000000000000000000000000000000000000',
    },
    isTestnet: false,
  },

  // Base Mainnet (推荐)
  8453: {
    id: 8453,
    name: 'Base',
    network: 'base',
    rpcUrl: 'https://mainnet.base.org',
    blockExplorer: 'https://basescan.org',
    contracts: {
      geoAsset: '0x0000000000000000000000000000000000000000',
      geoRegistry: '0x0000000000000000000000000000000000000000',
      geoMarketplace: '0x0000000000000000000000000000000000000000',
    },
    isTestnet: false,
  },

  // Base Sepolia (测试网)
  84532: {
    id: 84532,
    name: 'Base Sepolia',
    network: 'base-sepolia',
    rpcUrl: 'https://sepolia.base.org',
    blockExplorer: 'https://sepolia.basescan.org',
    contracts: {
      geoAsset: '0x0000000000000000000000000000000000000000',
      geoRegistry: '0x0000000000000000000000000000000000000000',
      geoMarketplace: '0x0000000000000000000000000000000000000000',
    },
    isTestnet: true,
  },

  // Arbitrum One
  42161: {
    id: 42161,
    name: 'Arbitrum One',
    network: 'arbitrum',
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    blockExplorer: 'https://arbiscan.io',
    contracts: {
      geoAsset: '0x0000000000000000000000000000000000000000',
      geoRegistry: '0x0000000000000000000000000000000000000000',
      geoMarketplace: '0x0000000000000000000000000000000000000000',
    },
    isTestnet: false,
  },

  // Arbitrum Sepolia (测试网)
  421614: {
    id: 421614,
    name: 'Arbitrum Sepolia',
    network: 'arbitrum-sepolia',
    rpcUrl: 'https://sepolia-rollup.arbitrum.io/rpc',
    blockExplorer: 'https://sepolia.arbiscan.io',
    contracts: {
      geoAsset: '0x0000000000000000000000000000000000000000',
      geoRegistry: '0x0000000000000000000000000000000000000000',
      geoMarketplace: '0x0000000000000000000000000000000000000000',
    },
    isTestnet: true,
  },
}

// 默认链 (Base Sepolia 用于开发)
export const DEFAULT_CHAIN_ID: SupportedChainId = 84532

// ============================================================
// Contract ABIs (简化版，完整版在 contracts 目录)
// ============================================================

export const GEO_ASSET_ABI = [
  // Read Functions
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function tokenURI(uint256 tokenId) view returns (string)',
  'function ownerOf(uint256 tokenId) view returns (address)',
  'function balanceOf(address owner) view returns (uint256)',
  'function getAsset(uint256 tokenId) view returns (tuple(uint8 assetType, int256 latitude, int256 longitude, string metadataURI, uint256 createdAt, bool verified))',
  'function totalSupply() view returns (uint256)',

  // Write Functions
  'function mint(uint8 assetType, int256 latitude, int256 longitude, string metadataURI) returns (uint256)',
  'function setVerified(uint256 tokenId, bool verified)',
  'function transferFrom(address from, address to, uint256 tokenId)',
  'function approve(address to, uint256 tokenId)',
  'function setApprovalForAll(address operator, bool approved)',

  // Events
  'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
  'event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)',
  'event GeoAssetMinted(uint256 indexed tokenId, address indexed owner, uint8 assetType, string metadataURI)',
  'event GeoAssetVerified(uint256 indexed tokenId, bool verified)',
] as const

export const GEO_MARKETPLACE_ABI = [
  // Read Functions
  'function getListing(uint256 listingId) view returns (tuple(address seller, uint256 tokenId, uint256 price, address currency, uint256 startTime, uint256 endTime, uint8 status))',
  'function getActiveListings(uint256 offset, uint256 limit) view returns (uint256[])',
  'function platformFee() view returns (uint256)',

  // Write Functions
  'function createListing(uint256 tokenId, uint256 price, address currency, uint256 duration) returns (uint256)',
  'function cancelListing(uint256 listingId)',
  'function buyListing(uint256 listingId) payable',
  'function updatePrice(uint256 listingId, uint256 newPrice)',

  // Events
  'event ListingCreated(uint256 indexed listingId, uint256 indexed tokenId, address indexed seller, uint256 price)',
  'event ListingSold(uint256 indexed listingId, uint256 indexed tokenId, address indexed buyer, uint256 price)',
  'event ListingCancelled(uint256 indexed listingId)',
] as const

// ============================================================
// IPFS / Storage
// ============================================================

export const IPFS_GATEWAYS = [
  'https://ipfs.io/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/',
  'https://gateway.pinata.cloud/ipfs/',
  'https://dweb.link/ipfs/',
] as const

export const ARWEAVE_GATEWAY = 'https://arweave.net/'

// ============================================================
// Asset Type Metadata
// ============================================================

export const ASSET_TYPE_CONFIG = {
  mineral: {
    label: 'Mineral Deposit',
    labelZh: '矿产资源',
    icon: 'gem',
    color: '#F59E0B',
    description: 'Mineral deposits and mining rights',
  },
  stratum: {
    label: 'Stratum Data',
    labelZh: '地层数据',
    icon: 'layers',
    color: '#8B5CF6',
    description: 'Geological stratum and formation data',
  },
  fossil: {
    label: 'Fossil Record',
    labelZh: '化石记录',
    icon: 'bone',
    color: '#EC4899',
    description: 'Paleontological fossil discoveries',
  },
  survey: {
    label: 'Survey Report',
    labelZh: '勘探报告',
    icon: 'file-text',
    color: '#3B82F6',
    description: 'Geological survey and exploration reports',
  },
  geopark: {
    label: 'Geopark',
    labelZh: '地质公园',
    icon: 'mountain',
    color: '#10B981',
    description: 'Geological park and heritage sites',
  },
  carbon_sink: {
    label: 'Carbon Sink',
    labelZh: '碳汇资产',
    icon: 'leaf',
    color: '#059669',
    description: 'Geological carbon sequestration assets',
  },
} as const

// ============================================================
// Validation Constants
// ============================================================

export const COORDINATE_PRECISION = 1_000_000 // 6 decimal places
export const MAX_METADATA_SIZE = 10 * 1024 * 1024 // 10MB
export const MIN_LISTING_DURATION = 3600 // 1 hour
export const MAX_LISTING_DURATION = 365 * 24 * 3600 // 1 year

// ============================================================
// API Endpoints
// ============================================================

export const API_ENDPOINTS = {
  // Indexer API
  indexer: {
    base: import.meta.env.VITE_INDEXER_URL || 'http://localhost:8080',
    assets: '/api/v1/assets',
    listings: '/api/v1/listings',
    events: '/api/v1/events',
    stats: '/api/v1/stats',
  },

  // Metadata Service
  metadata: {
    base: import.meta.env.VITE_METADATA_URL || 'http://localhost:8081',
    generate: '/api/v1/metadata/generate',
    upload: '/api/v1/metadata/upload',
  },
} as const

// ============================================================
// Error Messages
// ============================================================

export const ERROR_MESSAGES = {
  WALLET_NOT_CONNECTED: 'Please connect your wallet first',
  UNSUPPORTED_CHAIN: 'Please switch to a supported network',
  INSUFFICIENT_BALANCE: 'Insufficient balance for this transaction',
  TRANSACTION_REJECTED: 'Transaction was rejected',
  INVALID_COORDINATES: 'Invalid geographic coordinates',
  METADATA_UPLOAD_FAILED: 'Failed to upload metadata to IPFS',
  ASSET_NOT_FOUND: 'Asset not found',
  NOT_OWNER: 'You are not the owner of this asset',
  LISTING_EXPIRED: 'This listing has expired',
} as const
