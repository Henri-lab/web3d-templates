/**
 * @fileoverview GeoAsset Card Component
 * @description 地质资产卡片展示组件
 */

import React from 'react'
import { ipfsToHttp, formatTimestamp, chainToCoord } from '../utils'
import { ASSET_TYPE_CONFIG } from '../constants'
import type { GeoAssetCardProps, GeoAssetType } from '../types'

export const GeoAssetCard: React.FC<GeoAssetCardProps> = ({
  asset,
  metadata,
  onClick,
  showPrice,
  className = '',
}) => {
  const assetTypeKey = asset.assetType as unknown as GeoAssetType
  const typeConfig = ASSET_TYPE_CONFIG[assetTypeKey] || ASSET_TYPE_CONFIG.mineral

  const handleClick = () => {
    if (onClick) {
      onClick(asset.tokenId)
    }
  }

  const latitude = chainToCoord(asset.latitude)
  const longitude = chainToCoord(asset.longitude)

  return (
    <div
      className={`geo-asset-card ${className}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
    >
      {/* Image */}
      <div className="geo-asset-card__image">
        {metadata?.image ? (
          <img
            src={ipfsToHttp(metadata.image)}
            alt={metadata.name || `GeoAsset #${asset.tokenId}`}
            loading="lazy"
          />
        ) : (
          <div className="geo-asset-card__placeholder">
            <span className="geo-asset-card__icon">{typeConfig.icon}</span>
          </div>
        )}

        {/* Badge */}
        <div
          className="geo-asset-card__badge"
          style={{ backgroundColor: typeConfig.color }}
        >
          {typeConfig.label}
        </div>

        {/* Verified */}
        {asset.verified && (
          <div className="geo-asset-card__verified" title="Verified Asset">
            ✓
          </div>
        )}
      </div>

      {/* Content */}
      <div className="geo-asset-card__content">
        <h3 className="geo-asset-card__title">
          {metadata?.name || `GeoAsset #${asset.tokenId.toString()}`}
        </h3>

        <p className="geo-asset-card__description">
          {metadata?.description?.slice(0, 100) || 'No description'}
          {metadata?.description && metadata.description.length > 100 && '...'}
        </p>

        {/* Location */}
        <div className="geo-asset-card__location">
          <span className="geo-asset-card__coords">
            {latitude.toFixed(4)}, {longitude.toFixed(4)}
          </span>
        </div>

        {/* Footer */}
        <div className="geo-asset-card__footer">
          <span className="geo-asset-card__date">
            {formatTimestamp(asset.createdAt)}
          </span>

          {showPrice && (
            <span className="geo-asset-card__price">
              {/* Price would come from listing data */}
              --
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================================
// Styles
// ============================================================

export const geoAssetCardStyles = `
.geo-asset-card {
  background: #1f2937;
  border: 1px solid #374151;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
}

.geo-asset-card:hover {
  transform: translateY(-4px);
  border-color: #4b5563;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
}

.geo-asset-card__image {
  position: relative;
  aspect-ratio: 16 / 10;
  background: #111827;
  overflow: hidden;
}

.geo-asset-card__image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.geo-asset-card__placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1f2937, #111827);
}

.geo-asset-card__icon {
  font-size: 48px;
  opacity: 0.3;
}

.geo-asset-card__badge {
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  color: white;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.geo-asset-card__verified {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 24px;
  height: 24px;
  background: #10b981;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
  font-weight: bold;
}

.geo-asset-card__content {
  padding: 16px;
}

.geo-asset-card__title {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 600;
  color: white;
  line-height: 1.3;
}

.geo-asset-card__description {
  margin: 0 0 12px;
  font-size: 13px;
  color: #9ca3af;
  line-height: 1.5;
}

.geo-asset-card__location {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 12px;
}

.geo-asset-card__coords {
  font-size: 12px;
  color: #6b7280;
  font-family: monospace;
}

.geo-asset-card__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #374151;
}

.geo-asset-card__date {
  font-size: 12px;
  color: #6b7280;
}

.geo-asset-card__price {
  font-size: 14px;
  font-weight: 600;
  color: #10b981;
}
`
