/**
 * 事件总线 - 模块间通信核心
 *
 * 设计原则：
 * 1. 解耦 - 模块间不直接依赖，通过事件通信
 * 2. 类型安全 - 完整的事件类型定义
 * 3. 可追踪 - 所有事件都有日志记录
 * 4. 可扩展 - 支持事件拦截和转换
 */

import EventEmitter from 'eventemitter3'
import type { PlatformEvent, EventHandler } from '../config/types'

/**
 * 事件总线类
 */
export class EventBus {
  private emitter: EventEmitter
  private eventLog: PlatformEvent[] = []
  private maxLogSize = 1000
  private enableLogging: boolean

  constructor(options: { enableLogging?: boolean; maxListeners?: number } = {}) {
    this.emitter = new EventEmitter()
    this.enableLogging = options.enableLogging ?? true

    // eventemitter3 不支持 setMaxListeners，忽略这个选项
    // 如果需要限制监听器数量，可以在添加监听器时手动检查
  }

  /**
   * 发送事件
   */
  emit(eventType: string, payload?: any, source?: string): void {
    const event: PlatformEvent = {
      type: eventType,
      payload,
      source,
      timestamp: Date.now(),
    }

    // 记录事件日志
    if (this.enableLogging) {
      this.logEvent(event)
    }

    // 发送事件
    this.emitter.emit(eventType, event)

    // 发送通配符事件（用于监听所有事件）
    this.emitter.emit('*', event)
  }

  /**
   * 监听事件
   */
  on(eventType: string, handler: EventHandler): () => void {
    this.emitter.on(eventType, handler)

    // 返回取消监听函数
    return () => this.off(eventType, handler)
  }

  /**
   * 监听一次事件
   */
  once(eventType: string, handler: EventHandler): void {
    this.emitter.once(eventType, handler)
  }

  /**
   * 取消监听
   */
  off(eventType: string, handler: EventHandler): void {
    this.emitter.off(eventType, handler)
  }

  /**
   * 取消所有监听
   */
  offAll(eventType?: string): void {
    if (eventType) {
      this.emitter.removeAllListeners(eventType)
    } else {
      this.emitter.removeAllListeners()
    }
  }

  /**
   * 监听所有事件
   */
  onAll(handler: EventHandler): () => void {
    return this.on('*', handler)
  }

  /**
   * 获取事件日志
   */
  getEventLog(): PlatformEvent[] {
    return [...this.eventLog]
  }

  /**
   * 清空事件日志
   */
  clearEventLog(): void {
    this.eventLog = []
  }

  /**
   * 获取监听器数量
   */
  getListenerCount(eventType: string): number {
    return this.emitter.listenerCount(eventType)
  }

  /**
   * 记录事件日志
   */
  private logEvent(event: PlatformEvent): void {
    this.eventLog.push(event)

    // 限制日志大小
    if (this.eventLog.length > this.maxLogSize) {
      this.eventLog.shift()
    }

    // 控制台输出
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `[EventBus] ${event.type}`,
        event.source ? `from ${event.source}` : '',
        event.payload || '',
      )
    }
  }
}

/**
 * 创建全局事件总线实例
 */
export const globalEventBus = new EventBus({
  enableLogging: true,
  maxListeners: 100,
})

/**
 * 预定义的平台事件类型
 */
export const PlatformEvents = {
  // 平台生命周期
  PLATFORM_INIT: 'platform:init',
  PLATFORM_READY: 'platform:ready',
  PLATFORM_ERROR: 'platform:error',

  // 模块生命周期
  MODULE_REGISTER: 'module:register',
  MODULE_LOAD_START: 'module:load:start',
  MODULE_LOAD_SUCCESS: 'module:load:success',
  MODULE_LOAD_ERROR: 'module:load:error',
  MODULE_MOUNT: 'module:mount',
  MODULE_UNMOUNT: 'module:unmount',
  MODULE_ACTIVATE: 'module:activate',
  MODULE_DEACTIVATE: 'module:deactivate',

  // 路由事件
  ROUTE_CHANGE: 'route:change',
  ROUTE_BEFORE_CHANGE: 'route:before:change',
  ROUTE_ERROR: 'route:error',

  // 状态事件
  STATE_CHANGE: 'state:change',
  STATE_UPDATE: 'state:update',

  // 用户事件
  USER_LOGIN: 'user:login',
  USER_LOGOUT: 'user:logout',
  USER_UPDATE: 'user:update',

  // 设置事件
  SETTINGS_UPDATE: 'settings:update',
  THEME_CHANGE: 'theme:change',
  LANGUAGE_CHANGE: 'language:change',

  // 数据事件
  DATA_LOAD: 'data:load',
  DATA_SAVE: 'data:save',
  DATA_ERROR: 'data:error',

  // UI事件
  UI_SHOW_MODAL: 'ui:show:modal',
  UI_HIDE_MODAL: 'ui:hide:modal',
  UI_SHOW_TOAST: 'ui:show:toast',
  UI_SHOW_LOADING: 'ui:show:loading',
  UI_HIDE_LOADING: 'ui:hide:loading',

  // 性能事件
  PERFORMANCE_MARK: 'performance:mark',
  PERFORMANCE_MEASURE: 'performance:measure',
} as const

/**
 * 事件总线Hook（React）
 */
export function useEventBus() {
  return globalEventBus
}

/**
 * 事件监听Hook（React）
 * 注意：这个Hook需要在React组件中使用，需要导入React
 */
// export function useEventListener(
//   eventType: string,
//   handler: EventHandler,
//   deps: any[] = []
// ) {
//   const eventBus = useEventBus()
//
//   React.useEffect(() => {
//     const unsubscribe = eventBus.on(eventType, handler)
//     return unsubscribe
//   }, [eventType, ...deps])
// }

export default globalEventBus
