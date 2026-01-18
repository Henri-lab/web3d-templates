/**
 * @fileoverview IPFS Upload Service
 * @description IPFS 元数据上传服务 (Pinata)
 */

import type { GeoAssetMetadata, GeoCoordinates } from '../types'

// ============================================================
// Configuration
// ============================================================

const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY || ''
const PINATA_SECRET_KEY = import.meta.env.VITE_PINATA_SECRET_KEY || ''
const PINATA_API_URL = 'https://api.pinata.cloud'

// ============================================================
// Types
// ============================================================

export interface UploadResult {
  ipfsHash: string
  ipfsUri: string
  pinataUrl: string
}

export interface UploadMetadataParams {
  name: string
  description: string
  image?: string
  assetType: string
  coordinates: GeoCoordinates
  attributes?: Array<{ trait_type: string; value: string | number }>
  properties?: Record<string, unknown>
}

// ============================================================
// Upload Functions
// ============================================================

/**
 * Upload JSON metadata to IPFS via Pinata
 */
export async function uploadMetadata(
  params: UploadMetadataParams
): Promise<UploadResult> {
  if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
    throw new Error('Pinata API keys not configured')
  }

  // Construct metadata
  const metadata: GeoAssetMetadata = {
    name: params.name,
    description: params.description,
    image: params.image || '',
    attributes: [
      { trait_type: 'Asset Type', value: params.assetType },
      { trait_type: 'Latitude', value: params.coordinates.latitude },
      { trait_type: 'Longitude', value: params.coordinates.longitude },
      ...(params.attributes || []),
    ],
    properties: {
      coordinates: params.coordinates,
      ...(params.properties || {}),
    },
  }

  // Upload to Pinata
  const response = await fetch(`${PINATA_API_URL}/pinning/pinJSONToIPFS`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      pinata_api_key: PINATA_API_KEY,
      pinata_secret_api_key: PINATA_SECRET_KEY,
    },
    body: JSON.stringify({
      pinataContent: metadata,
      pinataMetadata: {
        name: `${params.name} - Metadata`,
      },
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to upload metadata: ${error}`)
  }

  const data = await response.json()

  return {
    ipfsHash: data.IpfsHash,
    ipfsUri: `ipfs://${data.IpfsHash}`,
    pinataUrl: `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`,
  }
}

/**
 * Upload file to IPFS via Pinata
 */
export async function uploadFile(file: File): Promise<UploadResult> {
  if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
    throw new Error('Pinata API keys not configured')
  }

  const formData = new FormData()
  formData.append('file', file)

  const metadata = JSON.stringify({
    name: file.name,
  })
  formData.append('pinataMetadata', metadata)

  const response = await fetch(`${PINATA_API_URL}/pinning/pinFileToIPFS`, {
    method: 'POST',
    headers: {
      pinata_api_key: PINATA_API_KEY,
      pinata_secret_api_key: PINATA_SECRET_KEY,
    },
    body: formData,
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to upload file: ${error}`)
  }

  const data = await response.json()

  return {
    ipfsHash: data.IpfsHash,
    ipfsUri: `ipfs://${data.IpfsHash}`,
    pinataUrl: `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`,
  }
}

/**
 * Upload image and create metadata in one go
 */
export async function uploadAssetWithImage(
  params: UploadMetadataParams,
  imageFile?: File
): Promise<UploadResult> {
  let imageUri = params.image || ''

  // Upload image first if provided
  if (imageFile) {
    const imageResult = await uploadFile(imageFile)
    imageUri = imageResult.ipfsUri
  }

  // Upload metadata with image URI
  return uploadMetadata({
    ...params,
    image: imageUri,
  })
}

/**
 * Fetch metadata from IPFS
 */
export async function fetchMetadata(
  ipfsUri: string
): Promise<GeoAssetMetadata | null> {
  try {
    // Convert IPFS URI to HTTP URL
    const url = ipfsUri.startsWith('ipfs://')
      ? `https://gateway.pinata.cloud/ipfs/${ipfsUri.replace('ipfs://', '')}`
      : ipfsUri

    const response = await fetch(url)
    if (!response.ok) {
      throw new Error('Failed to fetch metadata')
    }

    const metadata = await response.json()
    return metadata as GeoAssetMetadata
  } catch (error) {
    console.error('Error fetching metadata:', error)
    return null
  }
}

// ============================================================
// Alternative: Web3.Storage (Free, Decentralized)
// ============================================================

/**
 * Upload to Web3.Storage (alternative to Pinata)
 * Requires: npm install web3.storage
 */
export async function uploadToWeb3Storage(
  params: UploadMetadataParams
): Promise<UploadResult> {
  // This is a placeholder - implement if using Web3.Storage
  throw new Error('Web3.Storage not implemented. Use Pinata or implement this.')
}

// ============================================================
// Helpers
// ============================================================

/**
 * Validate file size and type
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 10 * 1024 * 1024 // 10MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 10MB' }
  }

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'File type must be JPEG, PNG, GIF, or WebP' }
  }

  return { valid: true }
}

/**
 * Generate thumbnail from image file
 */
export async function generateThumbnail(
  file: File,
  maxWidth = 400,
  maxHeight = 400
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    img.onload = () => {
      let width = img.width
      let height = img.height

      if (width > height) {
        if (width > maxWidth) {
          height *= maxWidth / width
          width = maxWidth
        }
      } else {
        if (height > maxHeight) {
          width *= maxHeight / height
          height = maxHeight
        }
      }

      canvas.width = width
      canvas.height = height
      ctx?.drawImage(img, 0, 0, width, height)

      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('Failed to generate thumbnail'))
        }
      }, 'image/jpeg', 0.8)
    }

    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = URL.createObjectURL(file)
  })
}
