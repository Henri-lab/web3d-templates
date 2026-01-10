# 状态管理

> 基于 Zustand 的轻量级状态管理系统

## 📖 概述

平台使用 Zustand 作为状态管理解决方案，替代了早期的 XState 方案。Zustand 提供了简单、轻量、易于理解的状态管理能力，非常适合中台系统的需求。

## 🎯 设计理念

### 为什么选择 Zustand？

1. **简单直观** - API 简洁，学习成本低
2. **轻量高效** - 体积小，性能好
3. **TypeScript 友好** - 完整的类型支持
4. **无需 Provider** - 不需要包裹组件树
5. **灵活扩展** - 支持中间件和插件

### 与 XState 的对比

| 特性 | Zustand | XState |
|------|---------|--------|
| 学习曲线 | 低 | 高 |
| 代码量 | 少 | 多 |
| 类型安全 | 优秀 | 优秀 |
| 状态机 | 不支持 | 支持 |
| 适用场景 | 简单状态 | 复杂状态流转 |

## 📂 源码位置

```
src/platform/core/platformStore.ts
```

## 🏗️ 状态结构

### 平台状态定义

```typescript
export type PlatformStatus = 'initializing' | 'ready' | 'error'

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
```

### 状态流转图

```
┌─────────────────────────────────────────────────────────┐
│                    Platform State                        │
│                                                          │
│  initializing ──────────> ready                         │
│       │                     │                            │
│       │ setError()          │ setError()                 │
│       ↓                     ↓                            │
│     error ──────────────> ready                         │
│              clearError()                                │
└─────────────────────────────────────────────────────────┘
```

## 🔧 核心 API

### 创建 Store

```typescript
import { create } from 'zustand'

export const usePlatformStore = create<PlatformState>((set) => ({
  // 初始状态
  status: 'initializing',
  loadedModules: [],
  activeModule: null,
  error: null,

  // 动作
  setReady: () => set({ status: 'ready' }),

  setError: (error) => set({ status: 'error', error }),

  clearError: () => set({ status: 'ready', error: null }),

  addLoadedModule: (moduleId) =>
    set((state) => ({
      loadedModules: state.loadedModules.includes(moduleId)
        ? state.loadedModules
        : [...state.loadedModules, moduleId],
    })),

  setActiveModule: (moduleId) => set({ activeModule: moduleId }),

  reset: () =>
    set({
      status: 'initializing',
      loadedModules: [],
      activeModule: null,
      error: null,
    }),
}))
```

### 在组件中使用

```typescript
import { usePlatformStore } from '@platform/core'

function StatusDisplay() {
  // 订阅单个状态
  const status = usePlatformStore((state) => state.status)

  // 订阅多个状态
  const { loadedModules, activeModule } = usePlatformStore((state) => ({
    loadedModules: state.loadedModules,
    activeModule: state.activeModule,
  }))

  // 获取动作
  const setReady = usePlatformStore((state) => state.setReady)

  return (
    <div>
      <p>Status: {status}</p>
      <p>Loaded: {loadedModules.length} modules</p>
      <p>Active: {activeModule || 'None'}</p>
      <button onClick={setReady}>Set Ready</button>
    </div>
  )
}
```

### 在非组件中使用

```typescript
import { usePlatformStore } from '@platform/core'

// 获取状态
const state = usePlatformStore.getState()
console.log('Current status:', state.status)

// 调用动作
state.setReady()
state.addLoadedModule('story')

// 订阅状态变化
const unsubscribe = usePlatformStore.subscribe((state) => {
  console.log('State changed:', state.status)
})

// 取消订阅
unsubscribe()
```

## 🎨 使用模式

### 1. 选择器模式

```typescript
// ✅ 推荐：使用选择器，只订阅需要的状态
const status = usePlatformStore((state) => state.status)

// ❌ 不推荐：订阅整个 store，会导致不必要的重渲染
const store = usePlatformStore()
```

### 2. 浅比较模式

```typescript
import { shallow } from 'zustand/shallow'

// 订阅多个状态，使用浅比较避免不必要的重渲染
const { status, error } = usePlatformStore(
  (state) => ({ status: state.status, error: state.error }),
  shallow
)
```

### 3. 派生状态模式

```typescript
// 计算派生状态
const isReady = usePlatformStore((state) => state.status === 'ready')
const hasError = usePlatformStore((state) => state.error !== null)
const moduleCount = usePlatformStore((state) => state.loadedModules.length)
```

### 4. 动作组合模式

```typescript
// 在 store 中组合多个动作
export const usePlatformStore = create<PlatformState>((set, get) => ({
  // ... 其他状态和动作

  // 组合动作
  loadModule: async (moduleId: string) => {
    try {
      // 加载模块逻辑
      await loadModuleLogic(moduleId)

      // 更新状态
      get().addLoadedModule(moduleId)
      get().setActiveModule(moduleId)
    } catch (error) {
      get().setError(error as Error)
    }
  },
}))
```

## 🔄 状态持久化

### 使用 persist 中间件

```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useModuleStore = create(
  persist<ModuleState>(
    (set) => ({
      preferences: {},
      setPreference: (key, value) =>
        set((state) => ({
          preferences: { ...state.preferences, [key]: value },
        })),
    }),
    {
      name: 'module-storage',  // localStorage key
      partialize: (state) => ({ preferences: state.preferences }),  // 只持久化部分状态
    }
  )
)
```

### 模块状态隔离

```typescript
// 为每个模块创建独立的 store
export function createModuleStore<T>(
  moduleId: string,
  initialState: T,
  persist: boolean = false
) {
  const store = create<T>((set) => ({
    ...initialState,
    // 模块特定的动作
  }))

  if (persist) {
    return create(
      persist(store, {
        name: `module-${moduleId}`,
      })
    )
  }

  return store
}

// 使用
const useStoryStore = createModuleStore('story', {
  currentStory: null,
  isPlaying: false,
}, true)
```

## 📊 状态调试

### 1. DevTools 集成

```typescript
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export const usePlatformStore = create(
  devtools<PlatformState>(
    (set) => ({
      // ... 状态和动作
    }),
    {
      name: 'PlatformStore',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
)
```

### 2. 日志中间件

```typescript
import { create } from 'zustand'

const log = (config) => (set, get, api) =>
  config(
    (...args) => {
      console.log('  applying', args)
      set(...args)
      console.log('  new state', get())
    },
    get,
    api
  )

export const usePlatformStore = create(
  log<PlatformState>((set) => ({
    // ... 状态和动作
  }))
)
```

### 3. 状态快照

```typescript
// 获取状态快照（兼容旧 API）
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

// 使用
const snapshot = getSnapshot()
console.log('Platform snapshot:', snapshot)
```

## 🎯 最佳实践

### 1. 状态设计

```typescript
// ✅ 推荐：扁平化状态结构
interface State {
  users: User[]
  currentUserId: string | null
}

// ❌ 不推荐：嵌套过深
interface State {
  data: {
    users: {
      list: User[]
      current: {
        id: string
      }
    }
  }
}
```

### 2. 动作命名

```typescript
// ✅ 推荐：动词开头，语义清晰
setReady()
addLoadedModule()
clearError()

// ❌ 不推荐：名词或不清晰
ready()
module()
clear()
```

### 3. 状态更新

```typescript
// ✅ 推荐：使用函数式更新
set((state) => ({
  loadedModules: [...state.loadedModules, moduleId],
}))

// ❌ 不推荐：直接修改状态
set({ loadedModules: state.loadedModules.push(moduleId) })
```

### 4. 选择器优化

```typescript
// ✅ 推荐：精确选择需要的状态
const status = usePlatformStore((state) => state.status)

// ✅ 推荐：使用 shallow 比较对象
const { status, error } = usePlatformStore(
  (state) => ({ status: state.status, error: state.error }),
  shallow
)

// ❌ 不推荐：选择整个 store
const store = usePlatformStore()
```

## 🔌 与事件总线集成

### 状态变化触发事件

```typescript
import { globalEventBus, PlatformEvents } from './eventBus'

export const usePlatformStore = create<PlatformState>((set) => ({
  // ... 其他状态

  setReady: () => {
    set({ status: 'ready' })
    globalEventBus.emit(PlatformEvents.PLATFORM_READY)
  },

  setError: (error) => {
    set({ status: 'error', error })
    globalEventBus.emit(PlatformEvents.PLATFORM_ERROR, { error })
  },

  addLoadedModule: (moduleId) => {
    set((state) => ({
      loadedModules: [...state.loadedModules, moduleId],
    }))
    globalEventBus.emit(PlatformEvents.MODULE_LOAD_SUCCESS, { moduleId })
  },
}))
```

### 事件触发状态变化

```typescript
import { globalEventBus, PlatformEvents } from './eventBus'
import { usePlatformStore } from './platformStore'

// 监听事件并更新状态
globalEventBus.on(PlatformEvents.MODULE_MOUNT, (event) => {
  const { moduleId } = event.payload
  usePlatformStore.getState().setActiveModule(moduleId)
})

globalEventBus.on(PlatformEvents.MODULE_UNMOUNT, () => {
  usePlatformStore.getState().setActiveModule(null)
})
```

## ⚠️ 注意事项

### 1. 避免状态冗余

```typescript
// ❌ 不推荐：派生状态存储在 store 中
interface State {
  users: User[]
  userCount: number  // 冗余，可以从 users.length 计算
}

// ✅ 推荐：在组件中计算派生状态
const userCount = usePlatformStore((state) => state.users.length)
```

### 2. 避免频繁更新

```typescript
// ❌ 不推荐：频繁调用 set
for (const module of modules) {
  set({ loadedModules: [...state.loadedModules, module] })
}

// ✅ 推荐：批量更新
set({ loadedModules: [...state.loadedModules, ...modules] })
```

### 3. 避免在渲染中调用动作

```typescript
// ❌ 不推荐：在渲染中调用动作
function Component() {
  const setReady = usePlatformStore((state) => state.setReady)
  setReady()  // 会导致无限循环
  return <div>...</div>
}

// ✅ 推荐：在 useEffect 中调用
function Component() {
  const setReady = usePlatformStore((state) => state.setReady)
  useEffect(() => {
    setReady()
  }, [])
  return <div>...</div>
}
```

## 📚 相关文档

- [平台初始化](./platform-initialization.md)
- [事件总线](./event-bus.md)
- [模块状态管理](../02-module-development/module-state.md)
- [Zustand 官方文档](https://github.com/pmndrs/zustand)

---

**最后更新**: 2026-01-10
