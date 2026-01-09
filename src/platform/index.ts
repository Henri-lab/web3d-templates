/**
 * 平台模块统一导出
 */

export * from './core'
export * from './config/types'
export {
  default as platformConfig,
  moduleConfigs,
  getModuleConfig,
  getAllRoutes,
  getNavigationMenu,
} from './config/platform.config'
export { PlatformProvider, usePlatform } from './PlatformProvider'
