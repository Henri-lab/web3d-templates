/**
 * @fileoverview Transaction Status Component
 * @description 交易状态显示组件
 */

import React from 'react'
import { CHAIN_CONFIGS, DEFAULT_CHAIN_ID } from '../constants'
import type { SupportedChainId } from '../types'

interface TransactionStatusProps {
  hash?: `0x${string}`
  isPending?: boolean
  isConfirming?: boolean
  isConfirmed?: boolean
  error?: string | null
  chainId?: SupportedChainId
  className?: string
}

export const TransactionStatus: React.FC<TransactionStatusProps> = ({
  hash,
  isPending,
  isConfirming,
  isConfirmed,
  error,
  chainId = DEFAULT_CHAIN_ID,
  className = '',
}) => {
  const chain = CHAIN_CONFIGS[chainId]
  const explorerUrl = hash ? `${chain?.blockExplorer}/tx/${hash}` : null

  // No transaction yet
  if (!hash && !isPending && !error) {
    return null
  }

  return (
    <div className={`tx-status ${className}`}>
      {/* Pending */}
      {isPending && (
        <div className="tx-status__item tx-status__item--pending">
          <span className="tx-status__spinner" />
          <span>Waiting for wallet confirmation...</span>
        </div>
      )}

      {/* Confirming */}
      {isConfirming && hash && (
        <div className="tx-status__item tx-status__item--confirming">
          <span className="tx-status__spinner" />
          <div className="tx-status__content">
            <span>Transaction submitted, waiting for confirmation...</span>
            {explorerUrl && (
              <a
                href={explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="tx-status__link"
              >
                View on Explorer →
              </a>
            )}
          </div>
        </div>
      )}

      {/* Confirmed */}
      {isConfirmed && hash && (
        <div className="tx-status__item tx-status__item--confirmed">
          <span className="tx-status__icon">✓</span>
          <div className="tx-status__content">
            <span>Transaction confirmed!</span>
            {explorerUrl && (
              <a
                href={explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="tx-status__link"
              >
                View on Explorer →
              </a>
            )}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="tx-status__item tx-status__item--error">
          <span className="tx-status__icon">✕</span>
          <div className="tx-status__content">
            <span>Transaction failed</span>
            <span className="tx-status__error-message">{error}</span>
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================================
// Styles
// ============================================================

export const transactionStatusStyles = `
.tx-status {
  margin: 16px 0;
}

.tx-status__item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border-radius: 12px;
}

.tx-status__item--pending {
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.3);
  color: #3b82f6;
}

.tx-status__item--confirming {
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.3);
  color: #f59e0b;
}

.tx-status__item--confirmed {
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: #10b981;
}

.tx-status__item--error {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #ef4444;
}

.tx-status__spinner {
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.tx-status__icon {
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.tx-status__content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tx-status__link {
  font-size: 13px;
  color: inherit;
  opacity: 0.8;
  text-decoration: none;
}

.tx-status__link:hover {
  opacity: 1;
  text-decoration: underline;
}

.tx-status__error-message {
  font-size: 13px;
  opacity: 0.8;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
`
