/**
 * @fileoverview Wallet Connect Component
 * @description 钱包连接按钮组件
 */

import React from 'react'
import { useWallet } from '../hooks/useWallet'
import { shortenAddress } from '../utils'
import type { WalletConnectProps } from '../types'

export const WalletConnect: React.FC<WalletConnectProps> = ({
  onConnect,
  onDisconnect,
  className = '',
}) => {
  const {
    address,
    isConnected,
    isConnecting,
    balanceFormatted,
    connect,
    disconnect,
    connectors,
  } = useWallet()

  const [showConnectors, setShowConnectors] = React.useState(false)

  const handleConnect = (connectorId: string) => {
    connect(connectorId)
    setShowConnectors(false)
    if (onConnect && address) {
      onConnect(address)
    }
  }

  const handleDisconnect = () => {
    disconnect()
    if (onDisconnect) {
      onDisconnect()
    }
  }

  // Connected state
  if (isConnected && address) {
    return (
      <div className={`wallet-connect wallet-connect--connected ${className}`}>
        <div className="wallet-connect__info">
          <span className="wallet-connect__balance">
            {balanceFormatted ? `${parseFloat(balanceFormatted).toFixed(4)} ETH` : '...'}
          </span>
          <span className="wallet-connect__address">
            {shortenAddress(address)}
          </span>
        </div>
        <button
          className="wallet-connect__button wallet-connect__button--disconnect"
          onClick={handleDisconnect}
        >
          Disconnect
        </button>
      </div>
    )
  }

  // Connecting state
  if (isConnecting) {
    return (
      <div className={`wallet-connect wallet-connect--connecting ${className}`}>
        <button className="wallet-connect__button" disabled>
          <span className="wallet-connect__spinner" />
          Connecting...
        </button>
      </div>
    )
  }

  // Disconnected state
  return (
    <div className={`wallet-connect wallet-connect--disconnected ${className}`}>
      {showConnectors ? (
        <div className="wallet-connect__connectors">
          <div className="wallet-connect__connectors-header">
            <span>Connect Wallet</span>
            <button
              className="wallet-connect__close"
              onClick={() => setShowConnectors(false)}
            >
              &times;
            </button>
          </div>
          <div className="wallet-connect__connectors-list">
            {connectors.map((connector) => (
              <button
                key={connector.id}
                className="wallet-connect__connector"
                onClick={() => handleConnect(connector.id)}
              >
                {connector.name}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <button
          className="wallet-connect__button wallet-connect__button--connect"
          onClick={() => setShowConnectors(true)}
        >
          Connect Wallet
        </button>
      )}
    </div>
  )
}

// ============================================================
// Styles (可以移到单独的 CSS 文件)
// ============================================================

export const walletConnectStyles = `
.wallet-connect {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.wallet-connect__info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
}

.wallet-connect__balance {
  font-size: 14px;
  color: #10b981;
  font-weight: 500;
}

.wallet-connect__address {
  font-size: 14px;
  color: #e5e7eb;
  font-family: monospace;
}

.wallet-connect__button {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.wallet-connect__button--connect {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
}

.wallet-connect__button--connect:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.wallet-connect__button--disconnect {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.wallet-connect__button--disconnect:hover {
  background: rgba(239, 68, 68, 0.3);
}

.wallet-connect__button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.wallet-connect__spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-right: 8px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.wallet-connect__connectors {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background: #1f2937;
  border: 1px solid #374151;
  border-radius: 12px;
  padding: 16px;
  min-width: 280px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  z-index: 100;
}

.wallet-connect__connectors-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  font-weight: 600;
  color: white;
}

.wallet-connect__close {
  background: none;
  border: none;
  color: #9ca3af;
  font-size: 20px;
  cursor: pointer;
}

.wallet-connect__connectors-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.wallet-connect__connector {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid #374151;
  border-radius: 8px;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.wallet-connect__connector:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: #4b5563;
}
`
