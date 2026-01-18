/**
 * @fileoverview Geo Mint Page
 * @description 地质资产铸造页面
 */

import React from 'react'
import { useNavigate } from 'react-router-dom'
import { GeoMintForm } from '../components/GeoMintForm'
import { WalletConnect } from '../components/WalletConnect'
import { useWallet } from '../hooks/useWallet'

export const GeoMintPage: React.FC = () => {
  const navigate = useNavigate()
  const { isConnected } = useWallet()

  const handleSuccess = (tokenId: bigint, txHash: string) => {
    console.log('Minted successfully:', { tokenId, txHash })
    // Navigate to asset detail page after successful mint
    setTimeout(() => {
      navigate(`/geo/asset/${tokenId}`)
    }, 2000)
  }

  const handleError = (error: string) => {
    console.error('Mint error:', error)
  }

  if (!isConnected) {
    return (
      <div className="geo-mint-page">
        <div className="geo-mint-page__connect">
          <h2>Connect Your Wallet</h2>
          <p>Please connect your wallet to mint geological assets</p>
          <WalletConnect />
        </div>
      </div>
    )
  }

  return (
    <div className="geo-mint-page">
      <div className="geo-mint-page__container">
        <header className="geo-mint-page__header">
          <button
            className="geo-mint-page__back"
            onClick={() => navigate('/geo')}
          >
            ← Back to Explorer
          </button>
          <h1 className="geo-mint-page__title">Mint Geological Asset</h1>
          <p className="geo-mint-page__subtitle">
            Create a new NFT representing a geological resource
          </p>
        </header>

        <div className="geo-mint-page__content">
          <GeoMintForm
            onSuccess={handleSuccess}
            onError={handleError}
          />

          <aside className="geo-mint-page__info">
            <h3>What is a GeoAsset?</h3>
            <p>
              GeoAssets are NFTs that represent geological resources, data, or discoveries.
              Each asset is permanently recorded on the blockchain with verifiable ownership.
            </p>

            <h4>Asset Types</h4>
            <ul>
              <li><strong>Mineral</strong> - Mineral deposits and mining rights</li>
              <li><strong>Stratum</strong> - Geological layer data</li>
              <li><strong>Fossil</strong> - Paleontological discoveries</li>
              <li><strong>Survey</strong> - Exploration reports</li>
              <li><strong>Geopark</strong> - Geological heritage sites</li>
              <li><strong>Carbon Sink</strong> - Carbon sequestration assets</li>
            </ul>

            <h4>Minting Process</h4>
            <ol>
              <li>Fill in asset details and coordinates</li>
              <li>Upload metadata to IPFS (automatic)</li>
              <li>Confirm transaction in your wallet</li>
              <li>Wait for blockchain confirmation</li>
            </ol>

            <div className="geo-mint-page__note">
              <strong>Note:</strong> Minting requires a small gas fee.
              Your asset will be visible in "My Assets" after confirmation.
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

// Styles
export const geoMintPageStyles = `
.geo-mint-page {
  min-height: 100vh;
  background: #0f172a;
  color: white;
  padding: 24px;
}

.geo-mint-page__connect {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
}

.geo-mint-page__connect h2 {
  font-size: 32px;
  margin-bottom: 12px;
}

.geo-mint-page__connect p {
  font-size: 16px;
  color: #94a3b8;
  margin-bottom: 24px;
}

.geo-mint-page__container {
  max-width: 1200px;
  margin: 0 auto;
}

.geo-mint-page__header {
  margin-bottom: 32px;
}

.geo-mint-page__back {
  display: inline-flex;
  align-items: center;
  padding: 8px 16px;
  background: transparent;
  border: 1px solid #334155;
  border-radius: 8px;
  color: #94a3b8;
  font-size: 14px;
  cursor: pointer;
  margin-bottom: 16px;
  transition: all 0.2s;
}

.geo-mint-page__back:hover {
  border-color: #475569;
  color: white;
}

.geo-mint-page__title {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 8px;
}

.geo-mint-page__subtitle {
  font-size: 16px;
  color: #94a3b8;
  margin: 0;
}

.geo-mint-page__content {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 32px;
}

@media (max-width: 1024px) {
  .geo-mint-page__content {
    grid-template-columns: 1fr;
  }
}

.geo-mint-page__info {
  padding: 24px;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 16px;
  height: fit-content;
}

.geo-mint-page__info h3 {
  font-size: 20px;
  margin: 0 0 12px;
}

.geo-mint-page__info h4 {
  font-size: 16px;
  margin: 24px 0 12px;
  color: #3b82f6;
}

.geo-mint-page__info p {
  font-size: 14px;
  color: #94a3b8;
  line-height: 1.6;
  margin: 0 0 16px;
}

.geo-mint-page__info ul,
.geo-mint-page__info ol {
  margin: 0;
  padding-left: 20px;
  color: #94a3b8;
  font-size: 14px;
}

.geo-mint-page__info li {
  margin-bottom: 8px;
  line-height: 1.6;
}

.geo-mint-page__note {
  margin-top: 24px;
  padding: 16px;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 8px;
  font-size: 14px;
  color: #94a3b8;
  line-height: 1.6;
}

.geo-mint-page__note strong {
  color: #3b82f6;
}
`
