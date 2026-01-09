/**
 * 平台Provider - 初始化和提供平台上下文
 */

import React, { createContext, useContext, useEffect, useState } from 'react'
import { initializePlatform, type PlatformInstance } from './core/platform'

/**
 * 平台上下文
 */
const PlatformContext = createContext<PlatformInstance | null>(null)

/**
 * 平台Provider Props
 */
interface PlatformProviderProps {
  children: React.ReactNode
  onInitialized?: (platform: PlatformInstance) => void
  onError?: (error: Error) => void
}

/**
 * 平台Provider组件
 */
export function PlatformProvider({ children, onInitialized, onError }: PlatformProviderProps) {
  const [platform, setPlatform] = useState<PlatformInstance | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let mounted = true

    const init = async () => {
      try {
        console.log('[PlatformProvider] Initializing platform...')
        const platformInstance = await initializePlatform()

        if (mounted) {
          setPlatform(platformInstance)
          setIsInitializing(false)
          onInitialized?.(platformInstance)
          console.log('[PlatformProvider] Platform initialized successfully')
        }
      } catch (err) {
        console.error('[PlatformProvider] Failed to initialize platform:', err)
        if (mounted) {
          setError(err as Error)
          setIsInitializing(false)
          onError?.(err as Error)
        }
      }
    }

    init()

    return () => {
      mounted = false
    }
  }, [])

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-900 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p>正在初始化平台...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-900 text-white">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-2">平台初始化失败</h2>
          <p className="text-gray-400 mb-4">{error.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600"
          >
            重新加载
          </button>
        </div>
      </div>
    )
  }

  return <PlatformContext.Provider value={platform}>{children}</PlatformContext.Provider>
}

/**
 * 使用平台上下文
 */
export function usePlatform(): PlatformInstance {
  const context = useContext(PlatformContext)

  if (!context) {
    throw new Error('usePlatform must be used within PlatformProvider')
  }

  return context
}

export default PlatformProvider
