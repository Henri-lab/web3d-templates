/**
 * @fileoverview Geo Marketplace Page
 * @description 地质资产交易市场页面
 */

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { GeoAssetCard } from '../components/GeoAssetCard'
import { WalletConnect } from '../components/WalletConnect'
import { ChainSwitcher } from '../components/ChainSwitcher'
import { useActiveListings } from '../hooks/useGeoMarketplace'
import { formatEther } from '../utils'
import { API_ENDPOINTS } from '../constants'
import type { GeoAssetOnChain, GeoAssetMetadata, Listing } from '../types'

interface ListingWithAsset {
  listing: Listing
  asset?: GeoAssetOnChain
  metadata?: GeoAssetMetadata
}

export const GeoMarketplacePage: React.FC = () => {
  const navigate = useNavigate()
  const { listings: contractListings, isLoading: isLoadingContract } = useActiveListings()

  const [listings, setListings] = useState<ListingWithAsset[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'price' | 'recent'>('recent')

  useEffect(() => {
    fetchListings()
  }, [])

  const fetchListings = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(
        `${API_ENDPOINTS.indexer.base}${API_ENDPOINTS.indexer.listings}?limit=50`
      )
      const data = await response.json()

      const listingsWithAssets: ListingWithAsset[] = await Promise.all(
        (data.data || []).map(async (listing: any) => {
          // Fetch asset data
          let asset: GeoAssetOnChain | undefined
          try {
            const assetResponse = await fetch(
              `${API_ENDPOINTS.indexer.base}${API_ENDPOINTS.indexer.assets}/${listing.token_id}`
            )
            const assetData = await assetResponse.json()
            asset = {
              tokenId: BigInt(assetData.token_id),
              owner: assetData.owner,
              assetType: assetData.asset_type,
              latitude: BigInt(assetData.latitude),
              longitude: BigInt(assetData.longitude),
              metadataURI: assetData.metadata_uri,
              createdAt: BigInt(new Date(assetData.minted_at).getTime() / 1000),
              verified: assetData.verified,
            }
          } catch (error) {
            console.error('Failed to fetch asset:', error)
          }

          return {
            listing: {
              listingId: BigInt(listing.listing_id),
              tokenId: BigInt(listing.token_id),
              seller: listing.seller,
              price: BigInt(listing.price),
              currency: listing.currency,
              startTime: BigInt(new Date(listing.start_time).getTime() / 1000),
              endTime: BigInt(new Date(listing.end_time).getTime() / 1000),
              status: listing.status === 0 ? 'active' : listing.status === 1 ? 'sold' : 'cancelled',
            },
            asset,
            metadata: undefined,
          }
        })
      )

      setListings(listingsWithAssets)
    } catch (error) {
      console.error('Failed to fetch listings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleListingClick = (tokenId: bigint) => {
    navigate(`/geo/asset/${tokenId}`)
  }

  const sortedListings = [...listings].sort((a, b) => {
    if (sortBy === 'price') {
      return Number(a.listing.price - b.listing.price)
    }
    return Number(b.listing.startTime - a.listing.startTime)
  })

  return (
    <div className="marketplace-page">
      {/* Header */}
      <header className="marketplace-page__header">
        <div className="marketplace-page__header-content">
          <h1 className="marketplace-page__title">Marketplace</h1>
          <p className="marketplace-page__subtitle">
            Buy and sell geological assets
          </p>
        </div>

        <div className="marketplace-page__header-actions">
          <ChainSwitcher />
          <WalletConnect />
        </div>
      </header>

      {/* Controls */}
      <div className="marketplace-page__controls">
        <div className="marketplace-page__stats">
          <div className="marketplace-page__stat">
            <span className="marketplace-page__stat-value">{listings.length}</span>
            <span className="marketplace-page__stat-label">Active Listings</span>
          </div>
        </div>

        <div className="marketplace-page__sort">
          <label>Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'price' | 'recent')}
          >
            <option value="recent">Most Recent</option>
            <option value="price">Price: Low to High</option>
          </select>
        </div>
      </div>

      {/* Listings Grid */}
      <div className="marketplace-page__content">
        {isLoading ? (
          <div className="marketplace-page__loading">
            <div className="spinner" />
            <p>Loading marketplace...</p>
          </div>
        ) : sortedListings.length === 0 ? (
          <div className="marketplace-page__empty">
            <p>No active listings</p>
          </div>
        ) : (
          <div className="marketplace-page__grid">
            {sortedListings.map((item) =>
              item.asset ? (
                <div key={item.listing.listingId.toString()} className="marketplace-page__item">
                  <GeoAssetCard
                    asset={item.asset}
                    metadata={item.metadata}
                    onClick={handleListingClick}
                    showPrice
                  />
                  <div className="marketplace-page__item-footer">
                    <div className="marketplace-page__price">
                      <span className="marketplace-page__price-label">Price</span>
                      <span className="marketplace-page__price-value">
                        {formatEther(item.listing.price)} ETH
                      </span>
                    </div>
                    <button
                      className="marketplace-page__buy-button"
                      onClick={() => handleListingClick(item.listing.tokenId)}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ) : null
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Styles
export const marketplacePageStyles = `
.marketplace-page {
  min-height: 100vh;
  background: #0f172a;
  color: white;
  padding: 24px;
}

.marketplace-page__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid #1e293b;
}

.marketplace-page__title {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 8px;
}

.marketplace-page__subtitle {
  font-size: 16px;
  color: #94a3b8;
  margin: 0;
}

.marketplace-page__header-actions {
  display: flex;
  gap: 12px;
}

.marketplace-page__controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.marketplace-page__stats {
  display: flex;
  gap: 24px;
}

.marketplace-page__stat {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.marketplace-page__stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #3b82f6;
}

.marketplace-page__stat-label {
  font-size: 14px;
  color: #64748b;
}

.marketplace-page__sort {
  display: flex;
  align-items: center;
  gap: 12px;
}

.marketplace-page__sort label {
  font-size: 14px;
  color: #94a3b8;
}

.marketplace-page__sort select {
  padding: 8px 12px;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
  color: white;
  font-size: 14px;
}

.marketplace-page__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}

.marketplace-page__item {
  display: flex;
  flex-direction: column;
}

.marketplace-page__item-footer {
  margin-top: 12px;
  padding: 16px;
  background: #1e293b;
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.marketplace-page__price {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.marketplace-page__price-label {
  font-size: 12px;
  color: #64748b;
}

.marketplace-page__price-value {
  font-size: 18px;
  font-weight: 700;
  color: #10b981;
}

.marketplace-page__buy-button {
  padding: 10px 20px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.marketplace-page__buy-button:hover {
  transform: translateY(-2px);
}

.marketplace-page__loading,
.marketplace-page__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px;
  color: #64748b;
}
`
