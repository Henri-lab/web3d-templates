import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { AppState, AppEvent, AppSettings } from '@/types'

interface AppStore {
  // 应用状态
  state: AppState
  previousState: AppState | null
  isLoading: boolean
  loadingProgress: number
  error: Error | null

  // 状态转换
  transition: (event: AppEvent) => void
  setState: (state: AppState) => void

  // 加载状态
  setLoading: (loading: boolean) => void
  setLoadingProgress: (progress: number) => void
  setError: (error: Error | null) => void

  // 重置
  reset: () => void
}

// 状态转换表
const stateTransitions: Record<AppState, Partial<Record<AppEvent, AppState>>> = {
  loading: {
    LOAD_COMPLETE: 'welcome',
    LOAD_ERROR: 'error',
  },
  welcome: {
    START_CLICK: 'story-selection',
    SETTINGS_CLICK: 'settings',
    ACHIEVEMENT_CLICK: 'achievements',
  },
  settings: {
    CLOSE: 'welcome',
  },
  achievements: {
    CLOSE: 'welcome',
  },
  'story-selection': {
    SELECT_STORY: 'story-preview',
    BACK: 'welcome',
  },
  'story-preview': {
    CONFIRM: 'story-loading',
    CANCEL: 'story-selection',
  },
  'story-loading': {
    LOADED: 'story-playing',
    LOAD_ERROR: 'error',
  },
  error: {
    RETRY: 'story-selection',
    HOME: 'welcome',
  },
  'story-playing': {
    NEXT_SCENE: 'scene-transition',
    PREV_SCENE: 'scene-transition',
    CLICK_OBJECT: 'object-detail',
    PAUSE: 'paused',
    STORY_END: 'quiz',
  },
  'scene-transition': {
    LOADED: 'story-playing',
  },
  'object-detail': {
    CLOSE: 'story-playing',
  },
  paused: {
    RESUME: 'story-playing',
    EXIT: 'story-selection',
    SETTINGS_CLICK: 'settings',
  },
  quiz: {
    SUBMIT: 'quiz-result',
  },
  'quiz-result': {
    CONTINUE: 'story-complete',
  },
  'story-complete': {
    NEW_STORY: 'story-selection',
    HOME: 'welcome',
    SHARE: 'story-complete',
  },
}

export const useAppStore = create<AppStore>()(
  devtools(
    (set, get) => ({
      state: 'loading',
      previousState: null,
      isLoading: true,
      loadingProgress: 0,
      error: null,

      transition: (event: AppEvent) => {
        const { state } = get()
        const transitions = stateTransitions[state]
        const nextState = transitions?.[event]

        if (nextState) {
          set({
            previousState: state,
            state: nextState,
          })
        } else {
          console.warn(`Invalid transition: ${state} + ${event}`)
        }
      },

      setState: (state: AppState) => {
        set({ previousState: get().state, state })
      },

      setLoading: (isLoading: boolean) => set({ isLoading }),

      setLoadingProgress: (loadingProgress: number) => set({ loadingProgress }),

      setError: (error: Error | null) => set({ error }),

      reset: () =>
        set({
          state: 'loading',
          previousState: null,
          isLoading: true,
          loadingProgress: 0,
          error: null,
        }),
    }),
    { name: 'app-store' },
  ),
)

// 设置 Store
interface SettingsStore {
  settings: AppSettings
  updateSettings: (settings: Partial<AppSettings>) => void
  resetSettings: () => void
}

const defaultSettings: AppSettings = {
  theme: 'auto',
  language: 'zh-CN',
  quality: 'auto',
  volume: {
    master: 0.8,
    music: 0.6,
    sfx: 0.8,
    voice: 1.0,
  },
  accessibility: {
    reducedMotion: false,
    highContrast: false,
    fontSize: 'medium',
  },
  controls: {
    invertY: false,
    sensitivity: 1.0,
  },
}

export const useSettingsStore = create<SettingsStore>()(
  devtools(
    persist(
      (set) => ({
        settings: defaultSettings,

        updateSettings: (newSettings: Partial<AppSettings>) =>
          set((state) => ({
            settings: { ...state.settings, ...newSettings },
          })),

        resetSettings: () => set({ settings: defaultSettings }),
      }),
      { name: 'settings-storage' },
    ),
    { name: 'settings-store' },
  ),
)
