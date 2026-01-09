/**
 * 平台核心模块导出
 */

export {
  initializePlatform,
  getPlatformInstance,
  destroyPlatform,
  restartPlatform,
} from './platform'
export { createModuleRegistry } from './moduleRegistry'
export {
  createPlatformAPI,
  usePlatformAPI,
  useEventBus,
  useEventListener,
  useModule,
  usePlatformState,
} from './platformAPI'
export { globalEventBus, EventBus, PlatformEvents } from './eventBus'

export type { PlatformInstance } from './platform'
export type { ModuleRegistry } from './moduleRegistry'
