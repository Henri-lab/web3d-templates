/**
 * 平台初始化 - 启动中台系统
 *
 * 设计原则：
 * 1. 配置驱动 - 从配置文件读取所有设置
 * 2. 渐进式启动 - 分阶段初始化各个系统
 * 3. 错误处理 - 优雅处理初始化错误
 * 4. 可观测 - 记录初始化过程
 */

import { createPlatformService } from './stateMachine'
import { createModuleRegistry } from './moduleRegistry'
import { createPlatformAPI } from './platformAPI'
import { globalEventBus, PlatformEvents } from './eventBus'
import platformConfig, { moduleConfigs } from '../config/platform.config'
import type { PlatformAPI } from '../config/types'
import type { PlatformService } from './stateMachine'
import type { ModuleRegistry } from './moduleRegistry'

/**
 * 平台实例
 */
export interface PlatformInstance {
  config: typeof platformConfig
  stateService: PlatformService
  moduleRegistry: ModuleRegistry
  api: PlatformAPI
  eventBus: typeof globalEventBus
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
    // 1. 创建状态机服务
    console.log('[Platform] Creating state machine...')
    const stateService = createPlatformService()

    // 2. 创建平台API（临时，用于创建模块注册中心）
    const tempAPI = createPlatformAPI(stateService, null as any)

    // 3. 创建模块注册中心
    console.log('[Platform] Creating module registry...')
    const moduleRegistry = createModuleRegistry(tempAPI)

    // 4. 创建完整的平台API
    console.log('[Platform] Creating platform API...')
    const api = createPlatformAPI(stateService, moduleRegistry)

    // 5. 将API挂载到全局（供模块使用）
    ;(window as any).__PLATFORM_API__ = api

    // 6. 注册所有模块
    console.log('[Platform] Registering modules...')
    await moduleRegistry.registerAll(moduleConfigs)

    // 8. 预加载指定模块
    if (platformConfig.performance.preload.length > 0) {
      console.log('[Platform] Preloading modules:', platformConfig.performance.preload)
      for (const moduleId of platformConfig.performance.preload) {
        try {
          await moduleRegistry.load(moduleId)
        } catch (error) {
          console.error(`[Platform] Failed to preload module ${moduleId}:`, error)
        }
      }
    }

    // 9. 创建平台实例
    platformInstance = {
      config: platformConfig,
      stateService,
      moduleRegistry,
      api,
      eventBus: globalEventBus,
    }

    // 10. 发送初始化完成事件
    stateService.send({ type: 'INIT_COMPLETE' })
    globalEventBus.emit(PlatformEvents.PLATFORM_READY)

    console.log('[Platform] Initialized successfully')
    console.log('[Platform] Registered modules:', moduleRegistry.getAll().map(m => m.id))

    return platformInstance
  } catch (error) {
    console.error('[Platform] Initialization failed:', error)

    // 发送初始化错误事件
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
  if (!platformInstance) {
    return
  }

  console.log('[Platform] Destroying...')

  // 停止状态机
  platformInstance.stateService.stop()

  // 卸载所有模块
  const modules = platformInstance.moduleRegistry.getAll()
  for (const module of modules) {
    if (module.status === 'loaded' || module.status === 'mounted') {
      platformInstance.moduleRegistry.unload(module.id).catch(console.error)
    }
  }

  // 清理全局API
  delete (window as any).__PLATFORM_API__

  // 清空实例
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
