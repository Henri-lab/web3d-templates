/**
 * @fileoverview Web3 Geo Module Utilities
 * @description 工具函数
 */

import { COORDINATE_PRECISION, IPFS_GATEWAYS, ARWEAVE_GATEWAY } from '../constants'
import type { GeoCoordinates, GeoAssetMetadata } from '../types'

// ============================================================
// Coordinate Utilities
// ============================================================

/**
 * 将浮点坐标转换为链上整数格式
 * @param coord 浮点坐标
 * @returns 整数坐标 (精度 1e6)
 */
export function coordToChain(coord: number): bigint {
  return BigInt(Math.round(coord * COORDINATE_PRECISION))
}

/**
 * 将链上整数坐标转换为浮点格式
 * @param chainCoord 链上整数坐标
 * @returns 浮点坐标
 */
export function chainToCoord(chainCoord: bigint): number {
  return Number(chainCoord) / COORDINATE_PRECISION
}

/**
 * 验证坐标是否有效
 */
export function isValidCoordinates(coords: GeoCoordinates): boolean {
  const { latitude, longitude } = coords
  return (
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  )
}

/**
 * 计算两点之间的距离 (Haversine 公式)
 * @returns 距离 (公里)
 */
export function calculateDistance(
  coord1: GeoCoordinates,
  coord2: GeoCoordinates
): number {
  const R = 6371 // 地球半径 (km)
  const dLat = toRad(coord2.latitude - coord1.latitude)
  const dLon = toRad(coord2.longitude - coord1.longitude)
  const lat1 = toRad(coord1.latitude)
  const lat2 = toRad(coord2.latitude)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180)
}

// ============================================================
// IPFS / Storage Utilities
// ============================================================

/**
 * 解析 IPFS URI 为 HTTP URL
 */
export function ipfsToHttp(uri: string, gatewayIndex = 0): string {
  if (!uri) return ''

  // 已经是 HTTP URL
  if (uri.startsWith('http://') || uri.startsWith('https://')) {
    return uri
  }

  // ipfs:// 协议
  if (uri.startsWith('ipfs://')) {
    const cid = uri.replace('ipfs://', '')
    return `${IPFS_GATEWAYS[gatewayIndex]}${cid}`
  }

  // ar:// 协议 (Arweave)
  if (uri.startsWith('ar://')) {
    const txId = uri.replace('ar://', '')
    return `${ARWEAVE_GATEWAY}${txId}`
  }

  // 纯 CID
  if (uri.startsWith('Qm') || uri.startsWith('bafy')) {
    return `${IPFS_GATEWAYS[gatewayIndex]}${uri}`
  }

  return uri
}

/**
 * 生成 IPFS URI
 */
export function toIpfsUri(cid: string): string {
  return `ipfs://${cid}`
}

/**
 * 从 URL 提取 CID
 */
export function extractCid(url: string): string | null {
  // ipfs:// 协议
  if (url.startsWith('ipfs://')) {
    return url.replace('ipfs://', '')
  }

  // HTTP 网关 URL
  const ipfsMatch = url.match(/\/ipfs\/([a-zA-Z0-9]+)/)
  if (ipfsMatch) {
    return ipfsMatch[1]
  }

  // 纯 CID
  if (url.startsWith('Qm') || url.startsWith('bafy')) {
    return url
  }

  return null
}

// ============================================================
// Metadata Utilities
// ============================================================

/**
 * 验证元数据格式
 */
export function validateMetadata(metadata: unknown): metadata is GeoAssetMetadata {
  if (!metadata || typeof metadata !== 'object') return false

  const m = metadata as Record<string, unknown>

  // 必需字段
  if (typeof m.name !== 'string' || !m.name) return false
  if (typeof m.description !== 'string') return false
  if (typeof m.image !== 'string' || !m.image) return false
  if (!Array.isArray(m.attributes)) return false
  if (!m.properties || typeof m.properties !== 'object') return false

  return true
}

/**
 * 生成默认元数据模板
 */
export function createMetadataTemplate(
  name: string,
  assetType: string,
  coordinates: GeoCoordinates
): Partial<GeoAssetMetadata> {
  return {
    name,
    description: '',
    image: '',
    attributes: [
      { trait_type: 'Asset Type', value: assetType },
      { trait_type: 'Latitude', value: coordinates.latitude },
      { trait_type: 'Longitude', value: coordinates.longitude },
    ],
    properties: {
      coordinates,
    },
  }
}

// ============================================================
// Address Utilities
// ============================================================

/**
 * 缩短地址显示
 */
export function shortenAddress(address: string, chars = 4): string {
  if (!address) return ''
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`
}

/**
 * 验证以太坊地址格式
 */
export function isValidAddress(address: string): address is `0x${string}` {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}

// ============================================================
// Number Formatting
// ============================================================

/**
 * 格式化 Wei 为 ETH
 */
export function formatEther(wei: bigint, decimals = 4): string {
  const eth = Number(wei) / 1e18
  return eth.toFixed(decimals)
}

/**
 * 解析 ETH 为 Wei
 */
export function parseEther(eth: string | number): bigint {
  return BigInt(Math.round(Number(eth) * 1e18))
}

/**
 * 格式化大数字
 */
export function formatNumber(num: number | bigint): string {
  const n = typeof num === 'bigint' ? Number(num) : num

  if (n >= 1_000_000_000) {
    return `${(n / 1_000_000_000).toFixed(2)}B`
  }
  if (n >= 1_000_000) {
    return `${(n / 1_000_000).toFixed(2)}M`
  }
  if (n >= 1_000) {
    return `${(n / 1_000).toFixed(2)}K`
  }
  return n.toLocaleString()
}

// ============================================================
// Time Utilities
// ============================================================

/**
 * 格式化时间戳
 */
export function formatTimestamp(timestamp: bigint | number): string {
  const date = new Date(Number(timestamp) * 1000)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * 计算剩余时间
 */
export function getTimeRemaining(endTime: bigint): string {
  const now = BigInt(Math.floor(Date.now() / 1000))
  const remaining = endTime - now

  if (remaining <= 0n) return 'Expired'

  const days = Number(remaining / 86400n)
  const hours = Number((remaining % 86400n) / 3600n)
  const minutes = Number((remaining % 3600n) / 60n)

  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

// ============================================================
// Error Handling
// ============================================================

/**
 * 解析合约错误
 */
export function parseContractError(error: unknown): string {
  if (!error) return 'Unknown error'

  // ethers.js / viem 错误格式
  if (typeof error === 'object') {
    const e = error as Record<string, unknown>

    // 用户拒绝
    if (e.code === 4001 || e.code === 'ACTION_REJECTED') {
      return 'Transaction rejected by user'
    }

    // 合约 revert
    if (e.reason && typeof e.reason === 'string') {
      return e.reason
    }

    // 短消息
    if (e.shortMessage && typeof e.shortMessage === 'string') {
      return e.shortMessage
    }

    // 通用消息
    if (e.message && typeof e.message === 'string') {
      // 提取有用信息
      const match = e.message.match(/reason="([^"]+)"/)
      if (match) return match[1]
      return e.message.slice(0, 100)
    }
  }

  return String(error).slice(0, 100)
}
