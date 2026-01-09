/**
 * 模块注册中心 - 管理所有微前端模块
 *
 * 设计原则：
 * 1. 配置驱动 - 通过配置文件注册模块
 * 2. 生命周期管理 - 完整的模块生命周期钩子
 * 3. 依赖管理 - 自动处理模块依赖关系
 * 4. 错误隔离 - 模块错误不影响其他模块
 */

import type { ModuleConfig, ModuleInstance, ModuleStatus } from '../config/types'
import { globalEventBus, PlatformEvents } from './eventBus'

/**
 * 模块注册中心类
 */
export class ModuleRegistry {
  private modules: Map<string, ModuleInstance> = new Map()
  // 稳健版中暂不依赖 PlatformAPI（保留简单的本地模块注册与加载）
  constructor() {}

  /**
   * 注册模块
   */
  async register(config: ModuleConfig): Promise<void> {
    console.log(`[ModuleRegistry] Registering module: ${config.id}`)

    // 检查模块是否已注册
    if (this.modules.has(config.id)) {
      console.warn(`[ModuleRegistry] Module ${config.id} already registered`)
      return
    }

    // 创建模块实例
    const instance: ModuleInstance = {
      id: config.id,
      config,
      status: 'unloaded',
    }

    this.modules.set(config.id, instance)

    // 发送注册事件
    globalEventBus.emit(PlatformEvents.MODULE_REGISTER, { moduleId: config.id })

    console.log(`[ModuleRegistry] Module ${config.id} registered successfully`)
  }

  /**
   * 批量注册模块
   */
  async registerAll(configs: ModuleConfig[]): Promise<void> {
    for (const config of configs) {
      await this.register(config)
    }
  }

  /**
   * 加载模块
   */
  async load(moduleId: string): Promise<void> {
    const instance = this.modules.get(moduleId)

    if (!instance) {
      throw new Error(`Module ${moduleId} not found`)
    }

    if (instance.status === 'loaded' || instance.status === 'mounted') {
      console.log(`[ModuleRegistry] Module ${moduleId} already loaded`)
      return
    }

    try {
      // 更新状态
      this.updateStatus(moduleId, 'loading')

      // 发送加载开始事件
      globalEventBus.emit(PlatformEvents.MODULE_LOAD_START, { moduleId })

      // 执行 beforeLoad 钩子
      if (instance.config.lifecycle.beforeLoad) {
        await instance.config.lifecycle.beforeLoad()
      }

      // 稳健版仅支持本地模块加载
      await this.loadLocalModule(instance)

      // 执行 onLoad 钩子
      if (instance.config.lifecycle.onLoad) {
        await instance.config.lifecycle.onLoad()
      }

      // 更新状态
      this.updateStatus(moduleId, 'loaded')

      // 发送加载成功事件
      globalEventBus.emit(PlatformEvents.MODULE_LOAD_SUCCESS, { moduleId })

      console.log(`[ModuleRegistry] Module ${moduleId} loaded successfully`)
    } catch (error) {
      // 更新状态
      this.updateStatus(moduleId, 'error')
      instance.error = error as Error

      // 执行 onError 钩子
      if (instance.config.lifecycle.onError) {
        await instance.config.lifecycle.onError(error as Error)
      }

      // 发送加载失败事件
      globalEventBus.emit(PlatformEvents.MODULE_LOAD_ERROR, {
        moduleId,
        error: error as Error,
      })

      console.error(`[ModuleRegistry] Failed to load module ${moduleId}:`, error)
      throw error
    }
  }

  /**
   * 卸载模块
   */
  async unload(moduleId: string): Promise<void> {
    const instance = this.modules.get(moduleId)

    if (!instance) {
      throw new Error(`Module ${moduleId} not found`)
    }

    if (instance.status === 'unloaded') {
      console.log(`[ModuleRegistry] Module ${moduleId} already unloaded`)
      return
    }

    try {
      // 更新状态
      this.updateStatus(moduleId, 'unmounting')

      // 执行 onUnmount 钩子
      if (instance.config.lifecycle.onUnmount) {
        await instance.config.lifecycle.onUnmount()
      }

      // 清理模块组件
      instance.component = undefined

      // 更新状态
      this.updateStatus(moduleId, 'unloaded')

      // 发送卸载事件
      globalEventBus.emit(PlatformEvents.MODULE_UNMOUNT, { moduleId })

      console.log(`[ModuleRegistry] Module ${moduleId} unloaded successfully`)
    } catch (error) {
      console.error(`[ModuleRegistry] Failed to unload module ${moduleId}:`, error)
      throw error
    }
  }

  /**
   * 重新加载模块
   */
  async reload(moduleId: string): Promise<void> {
    await this.unload(moduleId)
    await this.load(moduleId)
  }

  /**
   * 获取模块实例
   */
  get(moduleId: string): ModuleInstance | undefined {
    return this.modules.get(moduleId)
  }

  /**
   * 获取所有模块
   */
  getAll(): ModuleInstance[] {
    return Array.from(this.modules.values())
  }

  /**
   * 获取已加载的模块
   */
  getLoaded(): ModuleInstance[] {
    return this.getAll().filter((m) => m.status === 'loaded' || m.status === 'mounted')
  }

  /**
   * 检查模块是否已加载
   */
  isLoaded(moduleId: string): boolean {
    const instance = this.modules.get(moduleId)
    return instance?.status === 'loaded' || instance?.status === 'mounted'
  }

  /**
   * 更新模块状态
   */
  private updateStatus(moduleId: string, status: ModuleStatus): void {
    const instance = this.modules.get(moduleId)
    if (instance) {
      instance.status = status
    }
  }

  /**
   * 加载本地模块
   */
  private async loadLocalModule(instance: ModuleInstance): Promise<void> {
    // 本地模块直接从当前应用加载
    // 这里可以使用动态 import
    const modulePath = `../../pages/${instance.config.routes[0]?.component}`

    try {
      const module = await import(/* @vite-ignore */ modulePath)
      instance.component = module.default || module[instance.config.routes[0]?.component]
    } catch (error) {
      console.error(`Failed to load local module ${instance.id}:`, error)
      throw error
    }
  }
}

/**
 * 创建全局模块注册中心
 */
export function createModuleRegistry(): ModuleRegistry {
  return new ModuleRegistry()
}

export default ModuleRegistry
