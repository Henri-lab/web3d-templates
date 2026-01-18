/**
 * @fileoverview Geo Mint Form Component
 * @description 地质资产铸造表单
 */

import React, { useState, useCallback } from 'react'
import { useGeoAsset } from '../hooks/useGeoAsset'
import { useWallet } from '../hooks/useWallet'
import { ASSET_TYPE_CONFIG } from '../constants'
import { isValidCoordinates } from '../utils'
import type { GeoAssetType, MintParams } from '../types'

interface GeoMintFormProps {
  onSuccess?: (tokenId: bigint, txHash: string) => void
  onError?: (error: string) => void
  className?: string
}

interface FormData {
  name: string
  description: string
  assetType: GeoAssetType
  latitude: string
  longitude: string
  imageUrl: string
}

const initialFormData: FormData = {
  name: '',
  description: '',
  assetType: 'mineral' as GeoAssetType,
  latitude: '',
  longitude: '',
  imageUrl: '',
}

export const GeoMintForm: React.FC<GeoMintFormProps> = ({
  onSuccess,
  onError,
  className = '',
}) => {
  const { isConnected } = useWallet()
  const { mint, isMinting, mintError, txHash, isConfirming, isConfirmed } = useGeoAsset()

  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [validationErrors, setValidationErrors] = useState<Partial<FormData>>({})

  // Handle input change
  const handleChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setValidationErrors((prev) => ({ ...prev, [name]: '' }))
  }, [])

  // Validate form
  const validateForm = useCallback((): boolean => {
    const errors: Partial<FormData> = {}

    if (!formData.name.trim()) {
      errors.name = 'Name is required'
    }

    if (!formData.latitude || isNaN(parseFloat(formData.latitude))) {
      errors.latitude = 'Valid latitude is required'
    } else {
      const lat = parseFloat(formData.latitude)
      if (lat < -90 || lat > 90) {
        errors.latitude = 'Latitude must be between -90 and 90'
      }
    }

    if (!formData.longitude || isNaN(parseFloat(formData.longitude))) {
      errors.longitude = 'Valid longitude is required'
    } else {
      const lng = parseFloat(formData.longitude)
      if (lng < -180 || lng > 180) {
        errors.longitude = 'Longitude must be between -180 and 180'
      }
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }, [formData])

  // Handle submit
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    // TODO: Upload metadata to IPFS and get URI
    // For now, use a placeholder
    const metadataURI = `ipfs://placeholder/${Date.now()}`

    const params: MintParams = {
      assetType: formData.assetType,
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
      metadataURI,
    }

    try {
      const hash = await mint(params)
      if (hash && onSuccess) {
        // Token ID would come from event parsing
        onSuccess(BigInt(0), hash)
      }
    } catch (error) {
      if (onError) {
        onError(error instanceof Error ? error.message : 'Mint failed')
      }
    }
  }, [formData, validateForm, mint, onSuccess, onError])

  // Reset form
  const handleReset = useCallback(() => {
    setFormData(initialFormData)
    setValidationErrors({})
  }, [])

  if (!isConnected) {
    return (
      <div className={`geo-mint-form geo-mint-form--disconnected ${className}`}>
        <p>Please connect your wallet to mint assets</p>
      </div>
    )
  }

  return (
    <form className={`geo-mint-form ${className}`} onSubmit={handleSubmit}>
      <h2 className="geo-mint-form__title">Mint GeoAsset</h2>

      {/* Asset Type */}
      <div className="geo-mint-form__field">
        <label htmlFor="assetType">Asset Type</label>
        <select
          id="assetType"
          name="assetType"
          value={formData.assetType}
          onChange={handleChange}
        >
          {Object.entries(ASSET_TYPE_CONFIG).map(([key, config]) => (
            <option key={key} value={key}>
              {config.label} ({config.labelZh})
            </option>
          ))}
        </select>
      </div>

      {/* Name */}
      <div className="geo-mint-form__field">
        <label htmlFor="name">Name *</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g., Nevada Lithium Deposit"
        />
        {validationErrors.name && (
          <span className="geo-mint-form__error">{validationErrors.name}</span>
        )}
      </div>

      {/* Description */}
      <div className="geo-mint-form__field">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          placeholder="Describe the geological asset..."
        />
      </div>

      {/* Coordinates */}
      <div className="geo-mint-form__row">
        <div className="geo-mint-form__field">
          <label htmlFor="latitude">Latitude *</label>
          <input
            type="number"
            id="latitude"
            name="latitude"
            value={formData.latitude}
            onChange={handleChange}
            step="0.000001"
            placeholder="e.g., 39.9042"
          />
          {validationErrors.latitude && (
            <span className="geo-mint-form__error">{validationErrors.latitude}</span>
          )}
        </div>

        <div className="geo-mint-form__field">
          <label htmlFor="longitude">Longitude *</label>
          <input
            type="number"
            id="longitude"
            name="longitude"
            value={formData.longitude}
            onChange={handleChange}
            step="0.000001"
            placeholder="e.g., 116.4074"
          />
          {validationErrors.longitude && (
            <span className="geo-mint-form__error">{validationErrors.longitude}</span>
          )}
        </div>
      </div>

      {/* Image URL */}
      <div className="geo-mint-form__field">
        <label htmlFor="imageUrl">Image URL (IPFS)</label>
        <input
          type="text"
          id="imageUrl"
          name="imageUrl"
          value={formData.imageUrl}
          onChange={handleChange}
          placeholder="ipfs://..."
        />
      </div>

      {/* Error Display */}
      {mintError && (
        <div className="geo-mint-form__error-box">
          {mintError}
        </div>
      )}

      {/* Transaction Status */}
      {txHash && (
        <div className="geo-mint-form__status">
          {isConfirming && <span>Confirming transaction...</span>}
          {isConfirmed && <span className="success">Transaction confirmed!</span>}
        </div>
      )}

      {/* Actions */}
      <div className="geo-mint-form__actions">
        <button
          type="button"
          className="geo-mint-form__button geo-mint-form__button--secondary"
          onClick={handleReset}
          disabled={isMinting}
        >
          Reset
        </button>
        <button
          type="submit"
          className="geo-mint-form__button geo-mint-form__button--primary"
          disabled={isMinting || isConfirming}
        >
          {isMinting ? 'Minting...' : isConfirming ? 'Confirming...' : 'Mint Asset'}
        </button>
      </div>
    </form>
  )
}

// ============================================================
// Styles
// ============================================================

export const geoMintFormStyles = `
.geo-mint-form {
  max-width: 600px;
  padding: 24px;
  background: #1f2937;
  border: 1px solid #374151;
  border-radius: 16px;
}

.geo-mint-form__title {
  margin: 0 0 24px;
  font-size: 24px;
  font-weight: 600;
  color: white;
}

.geo-mint-form__field {
  margin-bottom: 20px;
}

.geo-mint-form__field label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #e5e7eb;
}

.geo-mint-form__field input,
.geo-mint-form__field select,
.geo-mint-form__field textarea {
  width: 100%;
  padding: 12px 16px;
  background: #111827;
  border: 1px solid #374151;
  border-radius: 8px;
  color: white;
  font-size: 14px;
  transition: border-color 0.2s ease;
}

.geo-mint-form__field input:focus,
.geo-mint-form__field select:focus,
.geo-mint-form__field textarea:focus {
  outline: none;
  border-color: #3b82f6;
}

.geo-mint-form__field textarea {
  resize: vertical;
  min-height: 80px;
}

.geo-mint-form__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.geo-mint-form__error {
  display: block;
  margin-top: 6px;
  font-size: 12px;
  color: #ef4444;
}

.geo-mint-form__error-box {
  padding: 12px 16px;
  margin-bottom: 20px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  color: #ef4444;
  font-size: 14px;
}

.geo-mint-form__status {
  padding: 12px 16px;
  margin-bottom: 20px;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 8px;
  color: #3b82f6;
  font-size: 14px;
}

.geo-mint-form__status .success {
  color: #10b981;
}

.geo-mint-form__actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.geo-mint-form__button {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.geo-mint-form__button--primary {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
}

.geo-mint-form__button--primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.geo-mint-form__button--secondary {
  background: transparent;
  border: 1px solid #374151;
  color: #9ca3af;
}

.geo-mint-form__button--secondary:hover:not(:disabled) {
  border-color: #4b5563;
  color: white;
}

.geo-mint-form__button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
`
