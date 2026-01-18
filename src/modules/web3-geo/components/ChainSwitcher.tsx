/**
 * @fileoverview Chain Switcher Component
 * @description 链切换组件
 */

import React, { useState } from 'react'
import { useWallet } from '../hooks/useWallet'
import { CHAIN_CONFIGS, DEFAULT_CHAIN_ID } from '../constants'
import type { SupportedChainId } from '../types'

interface ChainSwitcherProps {
  className?: string
}

export const ChainSwitcher: React.FC<ChainSwitcherProps> = ({ className = '' }) => {
  const { chainId, switchChain, isConnected } = useWallet()
  const [isOpen, setIsOpen] = useState(false)
  const [isSwitching, setIsSwitching] = useState(false)

  const currentChain = chainId ? CHAIN_CONFIGS[chainId as SupportedChainId] : null
  const isSupported = currentChain !== undefined

  const handleSwitch = async (targetChainId: SupportedChainId) => {
    if (targetChainId === chainId) {
      setIsOpen(false)
      return
    }

    setIsSwitching(true)
    try {
      await switchChain(targetChainId)
    } catch (error) {
      console.error('Failed to switch chain:', error)
    } finally {
      setIsSwitching(false)
      setIsOpen(false)
    }
  }

  if (!isConnected) {
    return null
  }

  return (
    <div className={`chain-switcher ${className}`}>
      <button
        className={`chain-switcher__trigger ${!isSupported ? 'chain-switcher__trigger--warning' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        disabled={isSwitching}
      >
        {isSwitching ? (
          <span className="chain-switcher__spinner" />
        ) : (
          <>
            <span
              className="chain-switcher__dot"
              style={{
                backgroundColor: isSupported ? '#10b981' : '#f59e0b',
              }}
            />
            <span className="chain-switcher__name">
              {currentChain?.name || 'Unsupported Network'}
            </span>
            <span className="chain-switcher__arrow">▼</span>
          </>
        )}
      </button>

      {isOpen && (
        <div className="chain-switcher__dropdown">
          <div className="chain-switcher__header">Select Network</div>
          <div className="chain-switcher__list">
            {Object.values(CHAIN_CONFIGS).map((chain) => (
              <button
                key={chain.id}
                className={`chain-switcher__option ${chain.id === chainId ? 'chain-switcher__option--active' : ''}`}
                onClick={() => handleSwitch(chain.id)}
              >
                <span className="chain-switcher__option-name">
                  {chain.name}
                  {chain.isTestnet && (
                    <span className="chain-switcher__testnet">Testnet</span>
                  )}
                </span>
                {chain.id === chainId && (
                  <span className="chain-switcher__check">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================================
// Styles
// ============================================================

export const chainSwitcherStyles = `
.chain-switcher {
  position: relative;
}

.chain-switcher__trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid #374151;
  border-radius: 8px;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.chain-switcher__trigger:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: #4b5563;
}

.chain-switcher__trigger--warning {
  border-color: #f59e0b;
}

.chain-switcher__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.chain-switcher__name {
  font-weight: 500;
}

.chain-switcher__arrow {
  font-size: 10px;
  opacity: 0.6;
}

.chain-switcher__spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.chain-switcher__dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  min-width: 220px;
  background: #1f2937;
  border: 1px solid #374151;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  z-index: 100;
}

.chain-switcher__header {
  padding: 12px 16px;
  font-size: 12px;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid #374151;
}

.chain-switcher__list {
  padding: 8px;
}

.chain-switcher__option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 10px 12px;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.chain-switcher__option:hover {
  background: rgba(255, 255, 255, 0.05);
}

.chain-switcher__option--active {
  background: rgba(59, 130, 246, 0.1);
}

.chain-switcher__option-name {
  display: flex;
  align-items: center;
  gap: 8px;
}

.chain-switcher__testnet {
  padding: 2px 6px;
  background: rgba(245, 158, 11, 0.2);
  border-radius: 4px;
  font-size: 10px;
  color: #f59e0b;
}

.chain-switcher__check {
  color: #10b981;
  font-weight: bold;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
`
