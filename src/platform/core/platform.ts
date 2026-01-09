/**
 * 平台初始化 - 稳健版本
 *
 * 简化的平台初始化，使用Zustand替代XState
 * 移除了复杂的微前端加载逻辑
 */

import { usePlatformStore, getSnapshot } from './platformStore'
import { globalEventBus, PlatformEvents } from './eventBus'
import platformConfig, { moduleConfigs } from '../config/platform.config'
import type { ModuleConfig } from '../config/types'

/**
 * 平台实例接口
 */
export interface PlatformInstance {
  config: typeof platformConfig
  modules: ModuleConfig[]
  eventBus: typeof globalEventBus
  store: typeof usePlatformStore
  getSnapshot: typeof getSnapshot
}

/**
 * 全局平台实例
 */
let platformInstance: PlatformInstance | null = null

/**
 * 初始化平台
 */
export async function initializePlatform(): Promise<PlatformInstance> {
  console.log('[Platform] Initializing...')

  try {
    const store = usePlatformStore

    // 注册所有模块
    console.log('[Platform] Registering modules...')
    for (const module of moduleConfigs) {
      console.log(`[Platform] Registered module: ${module.id}`)
      globalEventBus.emit(PlatformEvents.MODULE_REGISTER, { moduleId: module.id })
      store.getState().addLoadedModule(module.id)
    }

    // 创建平台实例
    platformInstance = {
      config: platformConfig,
      modules: moduleConfigs,
      eventBus: globalEventBus,
      store: usePlatformStore,
      getSnapshot,
    }

    // 设置就绪状态
    store.getState().setReady()

    // 发送就绪事件
    globalEventBus.emit(PlatformEvents.PLATFORM_READY)

    console.log('[Platform] Initialized successfully')
    console.log('[Platform] Registered modules:', moduleConfigs.map(m => m.id))

    return platformInstance
  } catch (error) {
    console.error('[Platform] Initialization failed:', error)
    usePlatformStore.getState().setError(error as Error)
    globalEventBus.emit(PlatformEvents.PLATFORM_ERROR, { error })
    throw error
  }
}

/**
 * 获取平台实例
 */
export function getPlatformInstance(): PlatformInstance {
  if (!platformInstance) {
    throw new Error('Platform not initialized. Call initializePlatform() first.')
  }
  return platformInstance
}

/**
 * 销毁平台
 */
export function destroyPlatform(): void {
  if (!platformInstance) return

  console.log('[Platform] Destroying...')
  usePlatformStore.getState().reset()
  platformInstance = null
  console.log('[Platform] Destroyed')
}

/**
 * 重启平台
 */
export async function restartPlatform(): Promise<PlatformInstance> {
  destroyPlatform()
  return await initializePlatform()
}

export default initializePlatform
