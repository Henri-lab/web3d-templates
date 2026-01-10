# API 参考文档

> 完整的平台 API 参考手册

## 📖 概述

本文档提供了中台平台所有 API 的完整参考，包括平台 API、事件总线 API、状态管理 API、路由 API 等。

## 📚 API 分类

### 核心 API

| API | 说明 | 文档 |
|-----|------|------|
| Platform API | 平台核心 API | [platform-api.md](./platform-api.md) |
| EventBus API | 事件总线 API | [event-bus-api.md](./event-bus-api.md) |
| State API | 状态管理 API | [state-api.md](./state-api.md) |
| Router API | 路由 API | [router-api.md](./router-api.md) |
| Module API | 模块管理 API | [module-api.md](./module-api.md) |

### React Hooks

| Hook | 说明 | 文档 |
|------|------|------|
| usePlatformAPI | 获取平台 API | [hooks-api.md](./hooks-api.md#useplatformapi) |
| usePlatformStore | 使用平台状态 | [hooks-api.md](./hooks-api.md#useplatformstore) |
| useEventBus | 使用事件总线 | [hooks-api.md](./hooks-api.md#useeventbus) |
| useEventListener | 监听事件 | [hooks-api.md](./hooks-api.md#useeventlistener) |
| usePlatform | 获取平台实例 | [hooks-api.md](./hooks-api.md#useplatform) |

## 🚀 快速参考

### 平台初始化

```typescript
import { initializePlatform, getPlatformInstance } from '@platform/core'

// 初始化平台
const platform = await initializePlatform()

// 获取平台实例
const platform = getPlatformInstance()
```

### 事件总线

```typescript
import { globalEventBus, PlatformEvents } from '@platform/core'

// 发送事件
globalEventBus.emit(PlatformEvents.MODULE_MOUNT, { moduleId: 'story' })

// 监听事件
const unsubscribe = globalEventBus.on(PlatformEvents.MODULE_MOUNT, (event) => {
  console.log('Module mounted:', event.payload.moduleId)
})

// 取消监听
unsubscribe()
```

### 状态管理

```typescript
import { usePlatformStore } from '@platform/core'

// 在组件中使用
const status = usePlatformStore((state) => state.status)
const setReady = usePlatformStore((state) => state.setReady)

// 在非组件中使用
const state = usePlatformStore.getState()
state.setReady()
```

### 平台 API

```typescript
import { usePlatformAPI } from '@platform/core'

function MyComponent() {
  const api = usePlatformAPI()

  // 使用事件总线
  api.eventBus.emit('my-event', { data: 'hello' })

  // 使用路由
  api.router.push('/stories')

  // 使用模块管理
  await api.moduleManager.loadModule('story')
}
```

## 📋 类型定义

### PlatformConfig

```typescript
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
```

### ModuleConfig

```typescript
export interface ModuleConfig {
  id: string
  name: string
  version: string
  description?: string
  type: 'local' | 'remote' | 'iframe'
  entry?: string
  iframeUrl?: string
  routes: RouteConfig[]
  menu: MenuConfig
  capabilities: CapabilitiesConfig
  lifecycle: ModuleLifecycle
  config: Record<string, any>
  state: StateConfig
}
```

### PlatformEvent

```typescript
export interface PlatformEvent {
  type: string
  payload?: any
  source?: string
  timestamp: number
}
```

### PlatformAPI

```typescript
export interface PlatformAPI {
  eventBus: {
    emit: (event: string, payload?: any) => void
    on: (event: string, handler: EventHandler) => void
    off: (event: string, handler: EventHandler) => void
    once: (event: string, handler: EventHandler) => void
  }

  stateManager: {
    getState: (namespace: string) => any
    setState: (namespace: string, state: any) => void
    subscribe: (namespace: string, callback: (state: any) => void) => () => void
  }

  router: {
    push: (path: string) => void
    replace: (path: string) => void
    go: (n: number) => void
    back: () => void
  }

  moduleManager: {
    getModule: (id: string) => ModuleInstance | undefined
    loadModule: (id: string) => Promise<void>
    unloadModule: (id: string) => Promise<void>
    reloadModule: (id: string) => Promise<void>
  }

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
```

## 🔍 API 索引

### 平台核心

- `initializePlatform()` - 初始化平台
- `getPlatformInstance()` - 获取平台实例
- `destroyPlatform()` - 销毁平台
- `restartPlatform()` - 重启平台

### 事件总线

- `globalEventBus.emit()` - 发送事件
- `globalEventBus.on()` - 监听事件
- `globalEventBus.once()` - 监听一次事件
- `globalEventBus.off()` - 取消监听
- `globalEventBus.offAll()` - 取消所有监听
- `globalEventBus.onAll()` - 监听所有事件
- `globalEventBus.getEventLog()` - 获取事件日志
- `globalEventBus.clearEventLog()` - 清空事件日志

### 状态管理

- `usePlatformStore()` - 使用平台状态
- `usePlatformStore.getState()` - 获取状态
- `usePlatformStore.setState()` - 设置状态
- `usePlatformStore.subscribe()` - 订阅状态
- `getSnapshot()` - 获取状态快照

### React Hooks

- `usePlatformAPI()` - 获取平台 API
- `usePlatformStore()` - 使用平台状态
- `useEventBus()` - 使用事件总线
- `useEventListener()` - 监听事件
- `usePlatform()` - 获取平台实例

## 📚 详细文档

### 核心 API

1. [平台 API](./platform-api.md) - 平台核心 API 详解
2. [事件总线 API](./event-bus-api.md) - 事件总线 API 详解
3. [状态管理 API](./state-api.md) - 状态管理 API 详解
4. [路由 API](./router-api.md) - 路由 API 详解
5. [模块管理 API](./module-api.md) - 模块管理 API 详解

### React Hooks

1. [Hooks API](./hooks-api.md) - 所有 React Hooks 详解

## 🎯 使用示例

### 完整示例

```typescript
import React, { useEffect } from 'react'
import {
  usePlatformAPI,
  usePlatformStore,
  globalEventBus,
  PlatformEvents,
} from '@platform/core'

export default function MyComponent() {
  const api = usePlatformAPI()
  const status = usePlatformStore((state) => state.status)

  useEffect(() => {
    // 监听事件
    const unsubscribe = globalEventBus.on(
      PlatformEvents.MODULE_MOUNT,
      (event) => {
        console.log('Module mounted:', event.payload.moduleId)
      }
    )

    // 发送事件
    api.eventBus.emit('myModule:init', { timestamp: Date.now() })

    return unsubscribe
  }, [api])

  const handleAction = async () => {
    // 使用路由
    api.router.push('/stories')

    // 加载模块
    await api.moduleManager.loadModule('story')

    // 发送事件
    api.eventBus.emit('myModule:action', { action: 'navigate' })
  }

  return (
    <div>
      <p>Platform Status: {status}</p>
      <button onClick={handleAction}>执行操作</button>
    </div>
  )
}
```

## ⚠️ 注意事项

### 1. 平台初始化

平台必须在使用任何 API 前初始化：

```typescript
// ✅ 正确
await initializePlatform()
const platform = getPlatformInstance()

// ❌ 错误
const platform = getPlatformInstance() // 可能抛出错误
```

### 2. 事件监听清理

始终在组件卸载时清理事件监听：

```typescript
// ✅ 正确
useEffect(() => {
  const unsubscribe = eventBus.on('event', handler)
  return unsubscribe
}, [])

// ❌ 错误
useEffect(() => {
  eventBus.on('event', handler)
}, [])
```

### 3. 状态选择器

使用选择器避免不必要的重渲染：

```typescript
// ✅ 推荐
const status = usePlatformStore((state) => state.status)

// ❌ 不推荐
const store = usePlatformStore()
```

## 📚 相关文档

- [平台核心系统](../01-platform-core/README.md)
- [模块开发指南](../02-module-development/README.md)
- [事件系统](../04-event-system/README.md)

---

**最后更新**: 2026-01-10
