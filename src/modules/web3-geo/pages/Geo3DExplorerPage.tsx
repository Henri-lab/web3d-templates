/**
 * @fileoverview GeoAsset Explorer with 3D View
 * @description 集成 3D 地球可视化的资产浏览页面
 */

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Geo3DViewer } from '../components/Geo3DViewer'
import { GeoAssetCard } from '../components/GeoAssetCard'
import { WalletConnect } from '../components/WalletConnect'
import { ChainSwitcher } from '../components/ChainSwitcher'
import { API_ENDPOINTS } from '../constants'
import type { GeoAssetOnChain, GeoAssetMetadata } from '../types'

interface AssetWithMetadata {
  asset: GeoAssetOnChain
  metadata?: GeoAssetMetadata
}

export const Geo3DExplorerPage: React.FC = () => {
  const navigate = useNavigate()

  const [assets, setAssets] = useState<AssetWithMetadata[]>([])
  const [selectedAsset, setSelectedAsset] = useState<GeoAssetOnChain | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'3d' | 'grid'>('3d')

  useEffect(() => {
    fetchAssets()
  }, [])

  const fetchAssets = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(
        `${API_ENDPOINTS.indexer.base}${API_ENDPOINTS.indexer.assets}?limit=100`
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

  const handleAssetClick = (asset: GeoAssetOnChain) => {
    setSelectedAsset(asset)
  }

  const handleViewDetails = () => {
    if (selectedAsset) {
      navigate(`/geo/asset/${selectedAsset.tokenId}`)
    }
  }

  return (
    <div className="geo-3d-explorer-page">
      {/* Header */}
      <header className="geo-3d-explorer-page__header">
        <div>
          <h1 className="geo-3d-explorer-page__title">GeoAsset 3D Explorer</h1>
          <p className="geo-3d-explorer-page__subtitle">
            Explore geological assets in 3D
          </p>
        </div>

        <div className="geo-3d-explorer-page__header-actions">
          <div className="geo-3d-explorer-page__view-toggle">
            <button
              className={viewMode === '3d' ? 'active' : ''}
              onClick={() => setViewMode('3d')}
            >
              3D View
            </button>
            <button
              className={viewMode === 'grid' ? 'active' : ''}
              onClick={() => setViewMode('grid')}
            >
              Grid View
            </button>
          </div>
          <ChainSwitcher />
          <WalletConnect />
        </div>
      </header>

      {/* Content */}
      <div className="geo-3d-explorer-page__content">
        {viewMode === '3d' ? (
          <>
            {/* 3D Viewer */}
            <div className="geo-3d-explorer-page__viewer">
              {isLoading ? (
                <div className="geo-3d-explorer-page__loading">
                  <div className="spinner" />
                  <p>Loading assets...</p>
                </div>
              ) : (
                <Geo3DViewer
                  assets={assets.map((a) => a.asset)}
                  selectedAsset={selectedAsset}
                  onAssetClick={handleAssetClick}
                />
              )}
            </div>

            {/* Sidebar */}
            <aside className="geo-3d-explorer-page__sidebar">
              <div className="geo-3d-explorer-page__stats">
                <div className="stat">
                  <span className="value">{assets.length}</span>
                  <span className="label">Total Assets</span>
                </div>
                <div className="stat">
                  <span className="value">
                    {assets.filter((a) => a.asset.verified).length}
                  </span>
                  <span className="label">Verified</span>
                </div>
              </div>

              {selectedAsset ? (
                <div className="geo-3d-explorer-page__selected">
                  <h3>Selected Asset</h3>
                  <GeoAssetCard
                    asset={selectedAsset}
                    metadata={
                      assets.find((a) => a.asset.tokenId === selectedAsset.tokenId)
                        ?.metadata
                    }
                    onClick={() => {}}
                  />
                  <button
                    className="geo-3d-explorer-page__details-button"
                    onClick={handleViewDetails}
                  >
                    View Full Details
                  </button>
                </div>
              ) : (
                <div className="geo-3d-explorer-page__hint">
                  <p>Click on a marker to view asset details</p>
                </div>
              )}
            </aside>
          </>
        ) : (
          /* Grid View */
          <div className="geo-3d-explorer-page__grid">
            {assets.map((item) => (
              <GeoAssetCard
                key={item.asset.tokenId.toString()}
                asset={item.asset}
                metadata={item.metadata}
                onClick={(tokenId) => navigate(`/geo/asset/${tokenId}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Styles
export const geo3DExplorerPageStyles = `
.geo-3d-explorer-page {
  min-height: 100vh;
  background: #0f172a;
  color: white;
  padding: 24px;
}

.geo-3d-explorer-page__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid #1e293b;
}

.geo-3d-explorer-page__title {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 8px;
}

.geo-3d-explorer-page__subtitle {
  font-size: 16px;
  color: #94a3b8;
  margin: 0;
}

.geo-3d-explorer-page__header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.geo-3d-explorer-page__view-toggle {
  display: flex;
  gap: 4px;
  padding: 4px;
  background: #1e293b;
  border-radius: 8px;
}

.geo-3d-explorer-page__view-toggle button {
  padding: 8px 16px;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: #94a3b8;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.geo-3d-explorer-page__view-toggle button.active {
  background: #3b82f6;
  color: white;
}

.geo-3d-explorer-page__content {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 24px;
}

@media (max-width: 1024px) {
  .geo-3d-explorer-page__content {
    grid-template-columns: 1fr;
  }
}

.geo-3d-explorer-page__viewer {
  min-height: 600px;
}

.geo-3d-explorer-page__sidebar {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.geo-3d-explorer-page__stats {
  display: flex;
  gap: 16px;
  padding: 20px;
  background: #1e293b;
  border-radius: 12px;
}

.geo-3d-explorer-page__stats .stat {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.geo-3d-explorer-page__stats .value {
  font-size: 24px;
  font-weight: 700;
  color: #3b82f6;
}

.geo-3d-explorer-page__stats .label {
  font-size: 12px;
  color: #64748b;
}

.geo-3d-explorer-page__selected {
  padding: 20px;
  background: #1e293b;
  border-radius: 12px;
}

.geo-3d-explorer-page__selected h3 {
  margin: 0 0 16px;
  font-size: 16px;
  font-weight: 600;
}

.geo-3d-explorer-page__details-button {
  width: 100%;
  margin-top: 16px;
  padding: 12px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.geo-3d-explorer-page__details-button:hover {
  transform: translateY(-2px);
}

.geo-3d-explorer-page__hint {
  padding: 40px 20px;
  text-align: center;
  color: #64748b;
}

.geo-3d-explorer-page__grid {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}

.geo-3d-explorer-page__loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 600px;
  color: #64748b;
}
`
