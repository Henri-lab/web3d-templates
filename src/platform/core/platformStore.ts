/**
 * 平台状态管理 - 使用Zustand（稳健版本）
 *
 * 简化的状态管理，替代XState
 * 优点：简单、轻量、易于理解和调试
 */

import { create } from 'zustand'

/**
 * 平台状态类型
 */
export type PlatformStatus = 'initializing' | 'ready' | 'error'

/**
 * 平台状态接口
 */
export interface PlatformState {
  // 状态
  status: PlatformStatus
  loadedModules: string[]
  activeModule: string | null
  error: Error | null

  // 动作
  setReady: () => void
  setError: (error: Error) => void
  clearError: () => void
  addLoadedModule: (moduleId: string) => void
  setActiveModule: (moduleId: string | null) => void
  reset: () => void
}

/**
 * 平台状态Store
 */
export const usePlatformStore = create<PlatformState>((set) => ({
  // 初始状态
  status: 'initializing',
  loadedModules: [],
  activeModule: null,
  error: null,

  // 设置就绪状态
  setReady: () => set({ status: 'ready' }),

  // 设置错误状态
  setError: (error) => set({ status: 'error', error }),

  // 清除错误
  clearError: () => set({ status: 'ready', error: null }),

  // 添加已加载模块
  addLoadedModule: (moduleId) =>
    set((state) => ({
      loadedModules: state.loadedModules.includes(moduleId)
        ? state.loadedModules
        : [...state.loadedModules, moduleId],
    })),

  // 设置活跃模块
  setActiveModule: (moduleId) => set({ activeModule: moduleId }),

  // 重置状态
  reset: () =>
    set({
      status: 'initializing',
      loadedModules: [],
      activeModule: null,
      error: null,
    }),
}))

/**
 * 获取状态快照（兼容旧API）
 */
export function getSnapshot() {
  const state = usePlatformStore.getState()
  return {
    value: state.status,
    context: {
      loadedModules: state.loadedModules,
      activeModule: state.activeModule,
      error: state.error,
    },
  }
}

export default usePlatformStore
