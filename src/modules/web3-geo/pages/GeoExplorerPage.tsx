/**
 * @fileoverview GeoAsset Explorer Page
 * @description 地质资产浏览页面
 */

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { GeoAssetCard } from '../components/GeoAssetCard'
import { ChainSwitcher } from '../components/ChainSwitcher'
import { WalletConnect } from '../components/WalletConnect'
import { useWallet } from '../hooks/useWallet'
import { ASSET_TYPE_CONFIG, API_ENDPOINTS } from '../constants'
import type { GeoAssetOnChain, GeoAssetMetadata, GeoAssetType } from '../types'

interface AssetWithMetadata {
  asset: GeoAssetOnChain
  metadata?: GeoAssetMetadata
}

export const GeoExplorerPage: React.FC = () => {
  const navigate = useNavigate()
  const { isConnected } = useWallet()

  const [assets, setAssets] = useState<AssetWithMetadata[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedType, setSelectedType] = useState<GeoAssetType | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch assets from indexer
  useEffect(() => {
    fetchAssets()
  }, [selectedType])

  const fetchAssets = async () => {
    setIsLoading(true)
    try {
      const url = selectedType === 'all'
        ? `${API_ENDPOINTS.indexer.base}${API_ENDPOINTS.indexer.assets}?limit=50`
        : `${API_ENDPOINTS.indexer.base}${API_ENDPOINTS.indexer.assets}/type/${getAssetTypeIndex(selectedType)}`

      const response = await fetch(url)
      const data = await response.json()

      // Transform data
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
        metadata: undefined, // TODO: Fetch from IPFS
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

  const filteredAssets = assets.filter((item) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      item.metadata?.name?.toLowerCase().includes(query) ||
      item.asset.tokenId.toString().includes(query)
    )
  })

  return (
    <div className="geo-explorer-page">
      {/* Header */}
      <header className="geo-explorer-page__header">
        <div className="geo-explorer-page__header-content">
          <h1 className="geo-explorer-page__title">GeoAsset Explorer</h1>
          <p className="geo-explorer-page__subtitle">
            Discover geological assets from around the world
          </p>
        </div>

        <div className="geo-explorer-page__header-actions">
          <ChainSwitcher />
          <WalletConnect />
        </div>
      </header>

      {/* Filters */}
      <div className="geo-explorer-page__filters">
        <div className="geo-explorer-page__search">
          <input
            type="text"
            placeholder="Search by name or token ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="geo-explorer-page__search-input"
          />
        </div>

        <div className="geo-explorer-page__type-filters">
          <button
            className={`geo-explorer-page__type-filter ${selectedType === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedType('all')}
          >
            All Types
          </button>
          {Object.entries(ASSET_TYPE_CONFIG).map(([key, config]) => (
            <button
              key={key}
              className={`geo-explorer-page__type-filter ${selectedType === key ? 'active' : ''}`}
              onClick={() => setSelectedType(key as GeoAssetType)}
              style={{ borderColor: config.color }}
            >
              {config.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="geo-explorer-page__stats">
        <div className="geo-explorer-page__stat">
          <span className="geo-explorer-page__stat-value">{assets.length}</span>
          <span className="geo-explorer-page__stat-label">Total Assets</span>
        </div>
        <div className="geo-explorer-page__stat">
          <span className="geo-explorer-page__stat-value">
            {assets.filter((a) => a.asset.verified).length}
          </span>
          <span className="geo-explorer-page__stat-label">Verified</span>
        </div>
      </div>

      {/* Assets Grid */}
      <div className="geo-explorer-page__content">
        {isLoading ? (
          <div className="geo-explorer-page__loading">
            <div className="spinner" />
            <p>Loading assets...</p>
          </div>
        ) : filteredAssets.length === 0 ? (
          <div className="geo-explorer-page__empty">
            <p>No assets found</p>
          </div>
        ) : (
          <div className="geo-explorer-page__grid">
            {filteredAssets.map((item) => (
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

// Helper
function getAssetTypeIndex(type: GeoAssetType): number {
  const map: Record<GeoAssetType, number> = {
    mineral: 0,
    stratum: 1,
    fossil: 2,
    survey: 3,
    geopark: 4,
    carbon_sink: 5,
  }
  return map[type] ?? 0
}

// Styles
export const geoExplorerPageStyles = `
.geo-explorer-page {
  min-height: 100vh;
  background: #0f172a;
  color: white;
  padding: 24px;
}

.geo-explorer-page__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid #1e293b;
}

.geo-explorer-page__title {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 8px;
}

.geo-explorer-page__subtitle {
  font-size: 16px;
  color: #94a3b8;
  margin: 0;
}

.geo-explorer-page__header-actions {
  display: flex;
  gap: 12px;
}

.geo-explorer-page__filters {
  margin-bottom: 32px;
}

.geo-explorer-page__search {
  margin-bottom: 16px;
}

.geo-explorer-page__search-input {
  width: 100%;
  max-width: 500px;
  padding: 12px 16px;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
  color: white;
  font-size: 14px;
}

.geo-explorer-page__type-filters {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.geo-explorer-page__type-filter {
  padding: 8px 16px;
  background: transparent;
  border: 1px solid #334155;
  border-radius: 8px;
  color: #94a3b8;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.geo-explorer-page__type-filter:hover {
  border-color: #475569;
  color: white;
}

.geo-explorer-page__type-filter.active {
  background: rgba(59, 130, 246, 0.1);
  border-color: #3b82f6;
  color: #3b82f6;
}

.geo-explorer-page__stats {
  display: flex;
  gap: 24px;
  margin-bottom: 32px;
}

.geo-explorer-page__stat {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.geo-explorer-page__stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #3b82f6;
}

.geo-explorer-page__stat-label {
  font-size: 14px;
  color: #64748b;
}

.geo-explorer-page__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}

.geo-explorer-page__loading,
.geo-explorer-page__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px;
  color: #64748b;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #1e293b;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
`
