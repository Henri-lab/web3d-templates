/**
 * @fileoverview Geo Asset Detail Page
 * @description 地质资产详情页面
 */

import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { TransactionStatus } from '../components/TransactionStatus'
import { useWallet } from '../hooks/useWallet'
import { useGeoMarketplace } from '../hooks/useGeoMarketplace'
import { chainToCoord, formatEther, formatTimestamp, ipfsToHttp } from '../utils'
import { ASSET_TYPE_CONFIG, API_ENDPOINTS } from '../constants'
import type { GeoAssetOnChain, GeoAssetMetadata, GeoAssetType } from '../types'

export const GeoAssetDetailPage: React.FC = () => {
  const { tokenId } = useParams<{ tokenId: string }>()
  const navigate = useNavigate()
  const { address, isConnected } = useWallet()
  const { createListing, buyListing, isPending, txHash, isConfirming, isConfirmed } = useGeoMarketplace()

  const [asset, setAsset] = useState<GeoAssetOnChain | null>(null)
  const [metadata, setMetadata] = useState<GeoAssetMetadata | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showListingForm, setShowListingForm] = useState(false)
  const [listingPrice, setListingPrice] = useState('')

  useEffect(() => {
    if (tokenId) {
      fetchAssetDetail()
    }
  }, [tokenId])

  const fetchAssetDetail = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(
        `${API_ENDPOINTS.indexer.base}${API_ENDPOINTS.indexer.assets}/${tokenId}`
      )
      const data = await response.json()

      const assetData: GeoAssetOnChain = {
        tokenId: BigInt(data.token_id),
        owner: data.owner,
        assetType: data.asset_type,
        latitude: BigInt(data.latitude),
        longitude: BigInt(data.longitude),
        metadataURI: data.metadata_uri,
        createdAt: BigInt(new Date(data.minted_at).getTime() / 1000),
        verified: data.verified,
      }

      setAsset(assetData)

      // TODO: Fetch metadata from IPFS
      // For now, use placeholder
      setMetadata({
        name: `GeoAsset #${tokenId}`,
        description: 'Geological asset description',
        image: '',
        attributes: [],
        properties: {
          coordinates: {
            latitude: chainToCoord(assetData.latitude),
            longitude: chainToCoord(assetData.longitude),
          },
        },
      })
    } catch (error) {
      console.error('Failed to fetch asset:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleListForSale = async () => {
    if (!asset || !listingPrice) return

    try {
      const priceWei = BigInt(Math.round(parseFloat(listingPrice) * 1e18))
      await createListing({
        tokenId: asset.tokenId,
        price: priceWei,
        currency: 'ETH',
        duration: 30 * 24 * 3600, // 30 days
      })
      setShowListingForm(false)
    } catch (error) {
      console.error('Failed to create listing:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="asset-detail-page">
        <div className="asset-detail-page__loading">
          <div className="spinner" />
          <p>Loading asset...</p>
        </div>
      </div>
    )
  }

  if (!asset) {
    return (
      <div className="asset-detail-page">
        <div className="asset-detail-page__error">
          <h2>Asset Not Found</h2>
          <button onClick={() => navigate('/geo')}>Back to Explorer</button>
        </div>
      </div>
    )
  }

  const assetTypeKey = asset.assetType as unknown as GeoAssetType
  const typeConfig = ASSET_TYPE_CONFIG[assetTypeKey] || ASSET_TYPE_CONFIG.mineral
  const isOwner = isConnected && address?.toLowerCase() === asset.owner.toLowerCase()
  const latitude = chainToCoord(asset.latitude)
  const longitude = chainToCoord(asset.longitude)

  return (
    <div className="asset-detail-page">
      <div className="asset-detail-page__container">
        {/* Back Button */}
        <button
          className="asset-detail-page__back"
          onClick={() => navigate('/geo')}
        >
          ← Back to Explorer
        </button>

        <div className="asset-detail-page__content">
          {/* Image */}
          <div className="asset-detail-page__image">
            {metadata?.image ? (
              <img src={ipfsToHttp(metadata.image)} alt={metadata.name} />
            ) : (
              <div className="asset-detail-page__placeholder">
                <span style={{ fontSize: '64px' }}>{typeConfig.icon}</span>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="asset-detail-page__details">
            <div className="asset-detail-page__header">
              <div>
                <div
                  className="asset-detail-page__badge"
                  style={{ backgroundColor: typeConfig.color }}
                >
                  {typeConfig.label}
                </div>
                <h1 className="asset-detail-page__title">
                  {metadata?.name || `GeoAsset #${asset.tokenId}`}
                </h1>
              </div>
              {asset.verified && (
                <div className="asset-detail-page__verified">✓ Verified</div>
              )}
            </div>

            <p className="asset-detail-page__description">
              {metadata?.description || 'No description available'}
            </p>

            {/* Info Grid */}
            <div className="asset-detail-page__info-grid">
              <div className="asset-detail-page__info-item">
                <span className="label">Token ID</span>
                <span className="value">#{asset.tokenId.toString()}</span>
              </div>
              <div className="asset-detail-page__info-item">
                <span className="label">Owner</span>
                <span className="value">
                  {asset.owner.slice(0, 6)}...{asset.owner.slice(-4)}
                </span>
              </div>
              <div className="asset-detail-page__info-item">
                <span className="label">Coordinates</span>
                <span className="value">
                  {latitude.toFixed(4)}, {longitude.toFixed(4)}
                </span>
              </div>
              <div className="asset-detail-page__info-item">
                <span className="label">Minted</span>
                <span className="value">{formatTimestamp(asset.createdAt)}</span>
              </div>
            </div>

            {/* Actions */}
            {isOwner && (
              <div className="asset-detail-page__actions">
                {!showListingForm ? (
                  <button
                    className="asset-detail-page__button asset-detail-page__button--primary"
                    onClick={() => setShowListingForm(true)}
                  >
                    List for Sale
                  </button>
                ) : (
                  <div className="asset-detail-page__listing-form">
                    <input
                      type="number"
                      placeholder="Price in ETH"
                      value={listingPrice}
                      onChange={(e) => setListingPrice(e.target.value)}
                      step="0.01"
                    />
                    <button
                      className="asset-detail-page__button asset-detail-page__button--primary"
                      onClick={handleListForSale}
                      disabled={isPending || !listingPrice}
                    >
                      {isPending ? 'Creating...' : 'Create Listing'}
                    </button>
                    <button
                      className="asset-detail-page__button asset-detail-page__button--secondary"
                      onClick={() => setShowListingForm(false)}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Transaction Status */}
            <TransactionStatus
              hash={txHash}
              isPending={isPending}
              isConfirming={isConfirming}
              isConfirmed={isConfirmed}
            />

            {/* Attributes */}
            {metadata?.attributes && metadata.attributes.length > 0 && (
              <div className="asset-detail-page__attributes">
                <h3>Attributes</h3>
                <div className="asset-detail-page__attributes-grid">
                  {metadata.attributes.map((attr, index) => (
                    <div key={index} className="asset-detail-page__attribute">
                      <span className="label">{attr.trait_type}</span>
                      <span className="value">{attr.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Styles
export const assetDetailPageStyles = `
.asset-detail-page {
  min-height: 100vh;
  background: #0f172a;
  color: white;
  padding: 24px;
}

.asset-detail-page__container {
  max-width: 1200px;
  margin: 0 auto;
}

.asset-detail-page__back {
  display: inline-flex;
  align-items: center;
  padding: 8px 16px;
  background: transparent;
  border: 1px solid #334155;
  border-radius: 8px;
  color: #94a3b8;
  font-size: 14px;
  cursor: pointer;
  margin-bottom: 24px;
  transition: all 0.2s;
}

.asset-detail-page__back:hover {
  border-color: #475569;
  color: white;
}

.asset-detail-page__content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
}

@media (max-width: 768px) {
  .asset-detail-page__content {
    grid-template-columns: 1fr;
  }
}

.asset-detail-page__image {
  aspect-ratio: 1;
  border-radius: 16px;
  overflow: hidden;
  background: #1e293b;
}

.asset-detail-page__image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.asset-detail-page__placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1e293b, #111827);
}

.asset-detail-page__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.asset-detail-page__badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  color: white;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
}

.asset-detail-page__title {
  font-size: 32px;
  font-weight: 700;
  margin: 0;
}

.asset-detail-page__verified {
  padding: 6px 12px;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 8px;
  color: #10b981;
  font-size: 14px;
  font-weight: 600;
}

.asset-detail-page__description {
  font-size: 16px;
  color: #94a3b8;
  line-height: 1.6;
  margin-bottom: 24px;
}

.asset-detail-page__info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
}

.asset-detail-page__info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.asset-detail-page__info-item .label {
  font-size: 12px;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.asset-detail-page__info-item .value {
  font-size: 16px;
  font-weight: 600;
  color: white;
}

.asset-detail-page__actions {
  margin-bottom: 24px;
}

.asset-detail-page__button {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.asset-detail-page__button--primary {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
}

.asset-detail-page__button--primary:hover:not(:disabled) {
  transform: translateY(-2px);
}

.asset-detail-page__button--secondary {
  background: transparent;
  border: 1px solid #334155;
  color: #94a3b8;
}

.asset-detail-page__button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.asset-detail-page__listing-form {
  display: flex;
  gap: 12px;
}

.asset-detail-page__listing-form input {
  flex: 1;
  padding: 12px 16px;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
  color: white;
  font-size: 14px;
}

.asset-detail-page__attributes {
  padding-top: 24px;
  border-top: 1px solid #1e293b;
}

.asset-detail-page__attributes h3 {
  font-size: 18px;
  margin: 0 0 16px;
}

.asset-detail-page__attributes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
}

.asset-detail-page__attribute {
  padding: 12px;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.asset-detail-page__attribute .label {
  font-size: 11px;
  color: #64748b;
  text-transform: uppercase;
}

.asset-detail-page__attribute .value {
  font-size: 14px;
  font-weight: 600;
  color: white;
}

.asset-detail-page__loading,
.asset-detail-page__error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
}
`
