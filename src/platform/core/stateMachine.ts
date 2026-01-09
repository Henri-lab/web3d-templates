/**
 * 平台状态机 - 使用XState实现（简化版）
 *
 * 设计原则：
 * 1. 可视化 - 可以用XState Visualizer查看状态图
 * 2. 类型安全 - 完整的TypeScript类型推导
 * 3. 可测试 - 状态转换逻辑独立可测
 * 4. 简单明了 - 避免过度复杂
 */

import { createMachine, assign, createActor } from 'xstate'

/**
 * 平台状态上下文
 */
export interface PlatformContext {
  loadedModules: string[]
  activeModule: string | null
  error: Error | null
  loadingProgress: number
}

/**
 * 平台事件类型
 */
export type PlatformEvent =
  | { type: 'INIT_COMPLETE' }
  | { type: 'INIT_ERROR'; error: Error }
  | { type: 'LOAD_MODULE'; moduleId: string }
  | { type: 'MODULE_LOADED'; moduleId: string }
  | { type: 'MODULE_LOAD_ERROR'; moduleId: string; error: Error }
  | { type: 'ACTIVATE_MODULE'; moduleId: string }
  | { type: 'ERROR'; error: Error }
  | { type: 'CLEAR_ERROR' }
  | { type: 'RESET' }

/**
 * 平台状态机定义（简化版）
 */
export const platformMachine = createMachine({
  id: 'platform',

  types: {} as {
    context: PlatformContext
    events: PlatformEvent
  },

  context: {
    loadedModules: [],
    activeModule: null,
    error: null,
    loadingProgress: 0,
  },

  initial: 'initializing',

  states: {
    initializing: {
      on: {
        INIT_COMPLETE: {
          target: 'ready',
          actions: assign({
            loadingProgress: 100,
          }),
        },
        INIT_ERROR: {
          target: 'error',
          actions: assign({
            error: ({ event }) => event.error,
          }),
        },
      },
    },

    ready: {
      on: {
        LOAD_MODULE: {
          target: 'loadingModule',
          actions: assign({
            loadingProgress: 0,
          }),
        },
        ACTIVATE_MODULE: {
          actions: assign({
            activeModule: ({ event }) => event.moduleId,
          }),
        },
        ERROR: {
          target: 'error',
          actions: assign({
            error: ({ event }) => event.error,
          }),
        },
      },
    },

    loadingModule: {
      on: {
        MODULE_LOADED: {
          target: 'ready',
          actions: assign({
            loadedModules: ({ context, event }) => [...context.loadedModules, event.moduleId],
            loadingProgress: 100,
          }),
        },
        MODULE_LOAD_ERROR: {
          target: 'ready',
          actions: assign({
            error: ({ event }) => event.error,
            loadingProgress: 0,
          }),
        },
      },
    },

    error: {
      on: {
        CLEAR_ERROR: {
          target: 'ready',
          actions: assign({
            error: null,
          }),
        },
        RESET: {
          target: 'initializing',
          actions: assign({
            loadedModules: [],
            activeModule: null,
            error: null,
            loadingProgress: 0,
          }),
        },
      },
    },
  },

  on: {
    RESET: {
      target: '.initializing',
      actions: assign({
        loadedModules: [],
        activeModule: null,
        error: null,
        loadingProgress: 0,
      }),
    },
  },
})

/**
 * 状态机服务类型
 */
export type PlatformService = ReturnType<typeof createActor<typeof platformMachine>>

/**
 * 创建状态机服务
 */
export function createPlatformService() {
  const actor = createActor(platformMachine)
  actor.start()
  return actor
}

/**
 * 状态机工具函数
 */
export const stateMachineUtils = {
  /**
   * 检查是否在某个状态
   */
  isInState: (service: PlatformService, statePath: string) => {
    return service.getSnapshot().matches(statePath)
  },

  /**
   * 获取当前状态值
   */
  getCurrentState: (service: PlatformService) => {
    return service.getSnapshot().value
  },

  /**
   * 获取上下文
   */
  getContext: (service: PlatformService) => {
    return service.getSnapshot().context
  },

  /**
   * 检查是否可以执行某个事件
   */
  canTransition: (service: PlatformService, eventType: string) => {
    return service.getSnapshot().can({ type: eventType } as any)
  },
}

export default platformMachine
