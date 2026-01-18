/**
 * @fileoverview My Assets Page
 * @description 用户资产管理页面
 */

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { GeoAssetCard } from '../components/GeoAssetCard'
import { WalletConnect } from '../components/WalletConnect'
import { useWallet } from '../hooks/useWallet'
import { useOwnedGeoAssets } from '../hooks/useGeoAsset'
import { API_ENDPOINTS } from '../constants'
import type { GeoAssetOnChain, GeoAssetMetadata } from '../types'

interface AssetWithMetadata {
  asset: GeoAssetOnChain
  metadata?: GeoAssetMetadata
}

export const MyAssetsPage: React.FC = () => {
  const navigate = useNavigate()
  const { address, isConnected } = useWallet()
  const { balance } = useOwnedGeoAssets(address)

  const [assets, setAssets] = useState<AssetWithMetadata[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isConnected && address) {
      fetchMyAssets()
    }
  }, [isConnected, address])

  const fetchMyAssets = async () => {
    if (!address) return

    setIsLoading(true)
    try {
      const response = await fetch(
        `${API_ENDPOINTS.indexer.base}${API_ENDPOINTS.indexer.assets}/owner/${address}`
      )
      const data = await response.json()

      const assetsWithMetadata: AssetWithMetadata[] = (data.data || []).map((asset: any) => ({
        asset: {
          tokenId: BigInt(asset.token_id),
          owner: asset.owner,
          assetType: asset.asset_type,
          latitude: BigInt(asset.latitude),
          longitude: BigInt(asset.longitude),
          metadataURI: asset.metadata_uri,
          createdAt: BigInt(new Date(asset.minted_at).getTime() / 1000),
          verified: asset.verified,
        },
        metadata: undefined,
      }))

      setAssets(assetsWithMetadata)
    } catch (error) {
      console.error('Failed to fetch assets:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAssetClick = (tokenId: bigint) => {
    navigate(`/geo/asset/${tokenId}`)
  }

  const handleMintClick = () => {
    navigate('/geo/mint')
  }

  if (!isConnected) {
    return (
      <div className="my-assets-page">
        <div className="my-assets-page__connect">
          <h2>Connect Your Wallet</h2>
          <p>Please connect your wallet to view your assets</p>
          <WalletConnect />
        </div>
      </div>
    )
  }

  return (
    <div className="my-assets-page">
      {/* Header */}
      <header className="my-assets-page__header">
        <div>
          <h1 className="my-assets-page__title">My Assets</h1>
          <p className="my-assets-page__subtitle">
            {balance !== undefined ? `${balance} assets owned` : 'Loading...'}
          </p>
        </div>
        <button className="my-assets-page__mint-button" onClick={handleMintClick}>
          + Mint New Asset
        </button>
      </header>

      {/* Content */}
      <div className="my-assets-page__content">
        {isLoading ? (
          <div className="my-assets-page__loading">
            <div className="spinner" />
            <p>Loading your assets...</p>
          </div>
        ) : assets.length === 0 ? (
          <div className="my-assets-page__empty">
            <div className="my-assets-page__empty-icon">📦</div>
            <h3>No Assets Yet</h3>
            <p>Start by minting your first geological asset</p>
            <button className="my-assets-page__mint-button" onClick={handleMintClick}>
              Mint Your First Asset
            </button>
          </div>
        ) : (
          <div className="my-assets-page__grid">
            {assets.map((item) => (
              <GeoAssetCard
                key={item.asset.tokenId.toString()}
                asset={item.asset}
                metadata={item.metadata}
                onClick={handleAssetClick}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Styles
export const myAssetsPageStyles = `
.my-assets-page {
  min-height: 100vh;
  background: #0f172a;
  color: white;
  padding: 24px;
}

.my-assets-page__connect {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
}

.my-assets-page__connect h2 {
  font-size: 32px;
  margin-bottom: 12px;
}

.my-assets-page__connect p {
  font-size: 16px;
  color: #94a3b8;
  margin-bottom: 24px;
}

.my-assets-page__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid #1e293b;
}

.my-assets-page__title {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 8px;
}

.my-assets-page__subtitle {
  font-size: 16px;
  color: #94a3b8;
  margin: 0;
}

.my-assets-page__mint-button {
  padding: 12px 24px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.my-assets-page__mint-button:hover {
  transform: translateY(-2px);
}

.my-assets-page__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}

.my-assets-page__loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px;
  color: #64748b;
}

.my-assets-page__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px;
  text-align: center;
}

.my-assets-page__empty-icon {
  font-size: 64px;
  margin-bottom: 24px;
  opacity: 0.5;
}

.my-assets-page__empty h3 {
  font-size: 24px;
  margin: 0 0 12px;
}

.my-assets-page__empty p {
  font-size: 16px;
  color: #64748b;
  margin: 0 0 24px;
}
`
