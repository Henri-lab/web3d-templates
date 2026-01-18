/**
 * @fileoverview Web3 Geo Module Type Definitions
 * @description 地质资产模块类型定义
 */

// ============================================================
// Chain & Wallet Types
// ============================================================

export type SupportedChainId = 1 | 8453 | 84532 | 42161 | 421614

export interface ChainConfig {
  id: SupportedChainId
  name: string
  network: string
  rpcUrl: string
  blockExplorer: string
  contracts: ContractAddresses
  isTestnet: boolean
}

export interface ContractAddresses {
  geoAsset: `0x${string}`
  geoRegistry: `0x${string}`
  geoMarketplace: `0x${string}`
}

// ============================================================
// Geo Asset Types
// ============================================================

/**
 * 地质资产类型枚举
 */
export enum GeoAssetType {
  /** 矿产资源 */
  MINERAL = 'mineral',
  /** 地层数据 */
  STRATUM = 'stratum',
  /** 化石记录 */
  FOSSIL = 'fossil',
  /** 勘探报告 */
  SURVEY = 'survey',
  /** 地质公园 */
  GEOPARK = 'geopark',
  /** 碳汇资产 */
  CARBON_SINK = 'carbon_sink',
}

/**
 * 地理坐标
 */
export interface GeoCoordinates {
  latitude: number
  longitude: number
  altitude?: number
  /** 坐标系统 (默认 WGS84) */
  crs?: 'WGS84' | 'CGCS2000' | 'GCJ02'
}

/**
 * 地理边界 (多边形)
 */
export interface GeoBoundary {
  type: 'Polygon' | 'MultiPolygon'
  coordinates: number[][][]
}

/**
 * 链上资产数据 (精简，存储在合约中)
 */
export interface GeoAssetOnChain {
  tokenId: bigint
  owner: `0x${string}`
  assetType: GeoAssetType
  /** 中心点坐标 (链上存储为 int256，精度 1e6) */
  latitude: bigint
  longitude: bigint
  /** 元数据 URI (IPFS/Arweave) */
  metadataURI: string
  /** 创建时间戳 */
  createdAt: bigint
  /** 是否已验证 */
  verified: boolean
}

/**
 * 链下元数据 (存储在 IPFS)
 * 遵循 OpenSea Metadata Standard
 */
export interface GeoAssetMetadata {
  // Standard NFT Metadata
  name: string
  description: string
  image: string
  animation_url?: string
  external_url?: string

  // OpenSea Attributes
  attributes: GeoAssetAttribute[]

  // Geo-specific Properties
  properties: GeoAssetProperties
}

export interface GeoAssetAttribute {
  trait_type: string
  value: string | number
  display_type?: 'number' | 'date' | 'boost_number' | 'boost_percentage'
}

export interface GeoAssetProperties {
  // 地理信息
  coordinates: GeoCoordinates
  boundary?: GeoBoundary
  area?: number // 平方公里

  // 地质数据
  geologicalData?: {
    /** 原始数据 IPFS CID */
    rawDataCID: string
    /** 数据格式 */
    format: 'GeoJSON' | 'Shapefile' | 'GeoTIFF' | 'LAS' | 'Custom'
    /** 数据大小 (bytes) */
    size: number
  }

  // 3D 模型
  model3D?: {
    /** 模型 IPFS CID */
    modelCID: string
    /** 模型格式 */
    format: 'glTF' | 'GLB' | 'OBJ' | 'FBX'
    /** 预览图 CID */
    thumbnailCID: string
  }

  // 认证信息
  certification?: {
    /** 认证标准 */
    standard: 'JORC' | 'NI43-101' | 'SAMREC' | 'CIM' | 'Custom'
    /** 认证机构 */
    authority: string
    /** 认证日期 */
    date: string
    /** 认证文件 CID */
    documentCID: string
  }

  // 资源估算 (矿产类型)
  resourceEstimate?: {
    /** 资源类型 */
    resourceType: string
    /** 估算储量 */
    estimatedReserve: number
    /** 单位 */
    unit: string
    /** 品位/浓度 */
    grade?: number
    /** 置信度 */
    confidence: 'Inferred' | 'Indicated' | 'Measured'
  }

  // 扩展字段 (预留)
  extensions?: Record<string, unknown>
}

// ============================================================
// Transaction Types
// ============================================================

export interface MintParams {
  assetType: GeoAssetType
  latitude: number
  longitude: number
  metadataURI: string
}

export interface ListingParams {
  tokenId: bigint
  price: bigint
  currency: `0x${string}` | 'ETH'
  duration: number // seconds
}

export interface Listing {
  listingId: bigint
  seller: `0x${string}`
  tokenId: bigint
  price: bigint
  currency: `0x${string}`
  startTime: bigint
  endTime: bigint
  status: 'active' | 'sold' | 'cancelled'
}

// ============================================================
// API Response Types
// ============================================================

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export interface GeoAssetQueryParams {
  owner?: `0x${string}`
  assetType?: GeoAssetType
  verified?: boolean
  minLat?: number
  maxLat?: number
  minLng?: number
  maxLng?: number
  page?: number
  pageSize?: number
  sortBy?: 'createdAt' | 'price' | 'tokenId'
  sortOrder?: 'asc' | 'desc'
}

// ============================================================
// Event Types
// ============================================================

export interface GeoAssetMintedEvent {
  tokenId: bigint
  owner: `0x${string}`
  assetType: GeoAssetType
  metadataURI: string
  transactionHash: `0x${string}`
  blockNumber: bigint
}

export interface GeoAssetTransferredEvent {
  tokenId: bigint
  from: `0x${string}`
  to: `0x${string}`
  transactionHash: `0x${string}`
  blockNumber: bigint
}

export interface GeoAssetListedEvent {
  listingId: bigint
  tokenId: bigint
  seller: `0x${string}`
  price: bigint
  transactionHash: `0x${string}`
  blockNumber: bigint
}

// ============================================================
// Component Props Types
// ============================================================

export interface WalletConnectProps {
  onConnect?: (address: `0x${string}`) => void
  onDisconnect?: () => void
  className?: string
}

export interface GeoAssetCardProps {
  asset: GeoAssetOnChain
  metadata?: GeoAssetMetadata
  onClick?: (tokenId: bigint) => void
  showPrice?: boolean
  className?: string
}

export interface GeoViewer3DProps {
  modelUrl?: string
  coordinates: GeoCoordinates
  boundary?: GeoBoundary
  markers?: GeoMarker[]
  onMarkerClick?: (marker: GeoMarker) => void
  className?: string
}

export interface GeoMarker {
  id: string
  coordinates: GeoCoordinates
  label?: string
  type?: GeoAssetType
  data?: unknown
}

// ============================================================
// Store Types
// ============================================================

export interface Web3GeoState {
  // Connection
  isConnected: boolean
  address: `0x${string}` | null
  chainId: SupportedChainId | null

  // Assets
  ownedAssets: GeoAssetOnChain[]
  selectedAsset: GeoAssetOnChain | null

  // Listings
  activeListings: Listing[]

  // UI State
  isLoading: boolean
  error: string | null

  // Actions
  setConnected: (connected: boolean, address?: `0x${string}`) => void
  setChainId: (chainId: SupportedChainId) => void
  setOwnedAssets: (assets: GeoAssetOnChain[]) => void
  selectAsset: (asset: GeoAssetOnChain | null) => void
  setListings: (listings: Listing[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}
