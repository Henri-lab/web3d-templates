/**
 * 平台API - 提供给模块使用的统一接口
 *
 * 设计原则：
 * 1. 简单易用 - 提供简洁的API接口
 * 2. 类型安全 - 完整的TypeScript类型
 * 3. 功能完整 - 覆盖所有平台能力
 * 4. 向后兼容 - API稳定不轻易变更
 */

import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { globalEventBus } from './eventBus'
import type { PlatformAPI, PlatformEvent, EventHandler } from '../config/types'
import type { ModuleRegistry } from './moduleRegistry'

/**
 * 创建平台API
 */
export function createPlatformAPI(
  getContext: () => Record<string, any>,
  moduleRegistry: ModuleRegistry
): PlatformAPI {
  return {
    // 事件总线
    eventBus: {
      emit: (event: string, payload?: any) => {
        globalEventBus.emit(event, payload)
      },

      on: (event: string, handler: EventHandler) => {
        return globalEventBus.on(event, handler)
      },

      off: (event: string, handler: EventHandler) => {
        globalEventBus.off(event, handler)
      },

      once: (event: string, handler: EventHandler) => {
        globalEventBus.once(event, handler)
      },
    },

    // 状态管理
    stateManager: {
      getState: (namespace: string) => {
        const context = getContext()
        return (context as any)[namespace]
      },

      setState: (namespace: string, state: any) => {
        // 通过事件更新状态
        globalEventBus.emit('state:update', { namespace, state })
      },

      subscribe: (namespace: string, callback: (state: any) => void) => {
        const handler = (event: PlatformEvent) => {
          if (event.payload?.namespace === namespace) {
            callback(event.payload.state)
          }
        }

        return globalEventBus.on('state:update', handler)
      },
    },

    // 路由（需要在React组件中使用）
    router: {
      push: (path: string) => {
        globalEventBus.emit('route:change', { path, action: 'push' })
      },

      replace: (path: string) => {
        globalEventBus.emit('route:change', { path, action: 'replace' })
      },

      go: (n: number) => {
        globalEventBus.emit('route:change', { delta: n, action: 'go' })
      },

      back: () => {
        globalEventBus.emit('route:change', { action: 'back' })
      },
    },

    // 模块管理
    moduleManager: {
      getModule: (id: string) => {
        return moduleRegistry.get(id)
      },

      loadModule: async (id: string) => {
        await moduleRegistry.load(id)
      },

      unloadModule: async (id: string) => {
        await moduleRegistry.unload(id)
      },

      reloadModule: async (id: string) => {
        await moduleRegistry.reload(id)
      },
    },

    // 工具方法
    utils: {
      logger: {
        log: (...args: any[]) => {
          console.log('[Platform]', ...args)
        },

        warn: (...args: any[]) => {
          console.warn('[Platform]', ...args)
        },

        error: (...args: any[]) => {
          console.error('[Platform]', ...args)
        },
      },

      storage: {
        get: (key: string) => {
          try {
            const value = localStorage.getItem(key)
            return value ? JSON.parse(value) : null
          } catch (error) {
            console.error('Failed to get from storage:', error)
            return null
          }
        },

        set: (key: string, value: any) => {
          try {
            localStorage.setItem(key, JSON.stringify(value))
          } catch (error) {
            console.error('Failed to set to storage:', error)
          }
        },

        remove: (key: string) => {
          try {
            localStorage.removeItem(key)
          } catch (error) {
            console.error('Failed to remove from storage:', error)
          }
        },

        clear: () => {
          try {
            localStorage.clear()
          } catch (error) {
            console.error('Failed to clear storage:', error)
          }
        },
      },
    },
  }
}

/**
 * React Hook: 使用平台API
 */
export function usePlatformAPI(): PlatformAPI {
  const navigate = useNavigate()
  useLocation() // 调用以保持与路由的订阅关系（无需显式使用返回值）

  // 从全局上下文获取平台API
  const platformAPI = (window as any).__PLATFORM_API__

  if (!platformAPI) {
    throw new Error('Platform API not initialized')
  }

  // 增强路由功能（使用React Router）
  const enhancedAPI: PlatformAPI = {
    ...platformAPI,
    router: {
      ...platformAPI.router,
      push: (path: string) => {
        navigate(path)
        platformAPI.eventBus.emit('route:change', { path, action: 'push' })
      },
      replace: (path: string) => {
        navigate(path, { replace: true })
        platformAPI.eventBus.emit('route:change', { path, action: 'replace' })
      },
      go: (n: number) => {
        navigate(n)
        platformAPI.eventBus.emit('route:change', { delta: n, action: 'go' })
      },
      back: () => {
        navigate(-1)
        platformAPI.eventBus.emit('route:change', { action: 'back' })
      },
    },
  }

  return enhancedAPI
}

/**
 * React Hook: 使用事件总线
 */
export function useEventBus() {
  const api = usePlatformAPI()
  return api.eventBus
}

/**
 * React Hook: 监听事件
 */
export function useEventListener(
  eventType: string,
  handler: EventHandler,
  deps: any[] = []
) {
  const eventBus = useEventBus()

  React.useEffect(() => {
    const unsubscribe = eventBus.on(eventType, handler)
    return unsubscribe
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventType, ...deps])
}

/**
 * React Hook: 使用模块
 */
export function useModule(moduleId: string) {
  const api = usePlatformAPI()
  const [module, setModule] = React.useState(() => api.moduleManager.getModule(moduleId))
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<Error | null>(null)

  const load = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      await api.moduleManager.loadModule(moduleId)
      setModule(api.moduleManager.getModule(moduleId))
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [moduleId])

  const unload = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      await api.moduleManager.unloadModule(moduleId)
      setModule(api.moduleManager.getModule(moduleId))
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [moduleId])

  const reload = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      await api.moduleManager.reloadModule(moduleId)
      setModule(api.moduleManager.getModule(moduleId))
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [moduleId])

  return {
    module,
    loading,
    error,
    load,
    unload,
    reload,
  }
}

/**
 * React Hook: 使用状态管理
 */
export function usePlatformState<T = any>(namespace: string, initialState?: T) {
  const api = usePlatformAPI()
  const [state, setState] = React.useState<T>(() => {
    return api.stateManager.getState(namespace) || initialState
  })

  React.useEffect(() => {
    const unsubscribe = api.stateManager.subscribe(namespace, (newState) => {
      setState(newState)
    })

    return unsubscribe
  }, [namespace])

  const updateState = React.useCallback(
    (newState: T | ((prev: T) => T)) => {
      const nextState = typeof newState === 'function'
        ? (newState as (prev: T) => T)(state)
        : newState

      api.stateManager.setState(namespace, nextState)
      setState(nextState)
    },
    [namespace, state]
  )

  return [state, updateState] as const
}

export default createPlatformAPI
