/**
 * 中台平台类型定义
 *
 * 完整的TypeScript类型系统，确保类型安全
 */

/**
 * 平台配置
 */
export interface PlatformConfig {
  name: string
  version: string
  mode: 'development' | 'production'
  shell: ShellConfig
  modules: ModuleConfig[]
  routing: RoutingConfig
  stateMachine: StateMachineConfig
  eventBus: EventBusConfig
  performance: PerformanceConfig
  devTools: DevToolsConfig
}

/**
 * 主应用配置
 */
export interface ShellConfig {
  port: number
  basePath: string
  title: string
  shared: Record<string, SharedDependency>
}

/**
 * 共享依赖配置
 */
export interface SharedDependency {
  singleton: boolean
  requiredVersion: string
  eager?: boolean
}

/**
 * 模块配置
 */
export interface ModuleConfig {
  // 基本信息
  id: string
  name: string
  version: string
  description?: string

  // 模块类型
  type: 'local' | 'remote' | 'iframe'

  // 远程入口（Module Federation）
  entry?: string

  // iframe URL（仅当type为iframe时）
  iframeUrl?: string

  // 路由配置
  routes: RouteConfig[]

  // 导航菜单
  menu: MenuConfig

  // 模块能力
  capabilities: CapabilitiesConfig

  // 生命周期
  lifecycle: ModuleLifecycle

  // 模块配置
  config: Record<string, any>

  // 状态配置
  state: StateConfig
}

/**
 * 路由配置
 */
export interface RouteConfig {
  path: string
  component: string
  meta?: RouteMeta
  children?: RouteConfig[]
}

/**
 * 路由元信息
 */
export interface RouteMeta {
  title?: string
  requiresAuth?: boolean
  roles?: string[]
  keepAlive?: boolean
  [key: string]: any
}

/**
 * 菜单配置
 */
export interface MenuConfig {
  title: string
  icon: string
  order: number
  visible: boolean
  badge?: string | number
}

/**
 * 能力配置
 */
export interface CapabilitiesConfig {
  provides: string[]
  requires: string[]
}

/**
 * 模块生命周期
 */
export interface ModuleLifecycle {
  beforeLoad?: () => Promise<void> | void
  onLoad?: () => Promise<void> | void
  onMount?: () => Promise<void> | void
  onUnmount?: () => Promise<void> | void
  onError?: (error: Error) => Promise<void> | void
  onUpdate?: () => Promise<void> | void
}

/**
 * 状态配置
 */
export interface StateConfig {
  namespace: string
  persist: boolean
  initialState?: Record<string, any>
}

/**
 * 路由配置
 */
export interface RoutingConfig {
  mode: 'browser' | 'hash'
  basename: string
  fallback: string
}

/**
 * 状态机配置
 */
export interface StateMachineConfig {
  initialState: string
  persistState: boolean
  devTools: boolean
}

/**
 * 事件总线配置
 */
export interface EventBusConfig {
  maxListeners: number
  enableLogging: boolean
}

/**
 * 性能配置
 */
export interface PerformanceConfig {
  lazyLoad: boolean
  preload: string[]
  cacheStrategy: 'memory' | 'localStorage' | 'sessionStorage'
}

/**
 * 开发工具配置
 */
export interface DevToolsConfig {
  enabled: boolean
  showModuleInfo: boolean
  showStateTransitions: boolean
}

/**
 * 模块实例
 */
export interface ModuleInstance {
  id: string
  config: ModuleConfig
  status: ModuleStatus
  component?: React.ComponentType<any>
  error?: Error
}

/**
 * 模块状态
 */
export type ModuleStatus =
  | 'unloaded'
  | 'loading'
  | 'loaded'
  | 'mounting'
  | 'mounted'
  | 'unmounting'
  | 'error'

/**
 * 平台事件
 */
export interface PlatformEvent {
  type: string
  payload?: any
  source?: string
  timestamp: number
}

/**
 * 事件处理器
 */
export type EventHandler = (event: PlatformEvent) => void | Promise<void>

/**
 * 模块通信消息
 */
export interface ModuleMessage {
  from: string
  to: string
  action: string
  data?: any
}

/**
 * 平台API
 */
export interface PlatformAPI {
  // 事件总线
  eventBus: {
    emit: (event: string, payload?: any) => void
    on: (event: string, handler: EventHandler) => void
    off: (event: string, handler: EventHandler) => void
    once: (event: string, handler: EventHandler) => void
  }

  // 状态管理
  stateManager: {
    getState: (namespace: string) => any
    setState: (namespace: string, state: any) => void
    subscribe: (namespace: string, callback: (state: any) => void) => () => void
  }

  // 路由
  router: {
    push: (path: string) => void
    replace: (path: string) => void
    go: (n: number) => void
    back: () => void
  }

  // 模块管理
  moduleManager: {
    getModule: (id: string) => ModuleInstance | undefined
    loadModule: (id: string) => Promise<void>
    unloadModule: (id: string) => Promise<void>
    reloadModule: (id: string) => Promise<void>
  }

  // 工具方法
  utils: {
    logger: {
      log: (...args: any[]) => void
      warn: (...args: any[]) => void
      error: (...args: any[]) => void
    }
    storage: {
      get: (key: string) => any
      set: (key: string, value: any) => void
      remove: (key: string) => void
      clear: () => void
    }
  }
}
