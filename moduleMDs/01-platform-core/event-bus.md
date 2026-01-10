# 事件总线

> 模块间通信的核心机制，基于 EventEmitter3 实现

## 📖 概述

事件总线是中台系统中模块间通信的核心机制。通过发布-订阅模式，实现模块间的解耦通信，避免模块间的直接依赖。

## 🎯 设计理念

### 为什么需要事件总线？

1. **解耦模块** - 模块间不直接依赖，通过事件通信
2. **灵活扩展** - 新模块可以轻松接入现有事件
3. **可追踪** - 所有事件都有日志记录，便于调试
4. **类型安全** - 完整的事件类型定义
5. **性能优化** - 基于 EventEmitter3，性能优异

### 事件总线 vs 直接调用

```typescript
// ❌ 直接调用：模块间强耦合
// ModuleA.tsx
import { playStory } from '../ModuleB/storyPlayer'
playStory('qin-unification')

// ✅ 事件总线：模块间解耦
// ModuleA.tsx
eventBus.emit('story:play', { storyId: 'qin-unification' })

// ModuleB.tsx
eventBus.on('story:play', (event) => {
  playStory(event.payload.storyId)
})
```

## 📂 源码位置

```
src/platform/core/eventBus.ts
```

## 🏗️ 核心架构

### 事件流程图

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│  Module A   │         │  EventBus   │         │  Module B   │
└─────────────┘         └─────────────┘         └─────────────┘
      │                       │                       │
      │  emit('event', data)  │                       │
      │──────────────────────>│                       │
      │                       │                       │
      │                       │  trigger handler      │
      │                       │──────────────────────>│
      │                       │                       │
      │                       │<──────────────────────│
      │                       │   handler executed    │
      │                       │                       │
```

### 事件结构

```typescript
export interface PlatformEvent {
  type: string        // 事件类型
  payload?: any       // 事件数据
  source?: string     // 事件来源
  timestamp: number   // 时间戳
}
```

## 🔧 核心 API

### EventBus 类

```typescript
export class EventBus {
  // 发送事件
  emit(eventType: string, payload?: any, source?: string): void

  // 监听事件
  on(eventType: string, handler: EventHandler): () => void

  // 监听一次事件
  once(eventType: string, handler: EventHandler): void

  // 取消监听
  off(eventType: string, handler: EventHandler): void

  // 取消所有监听
  offAll(eventType?: string): void

  // 监听所有事件
  onAll(handler: EventHandler): () => void

  // 获取事件日志
  getEventLog(): PlatformEvent[]

  // 清空事件日志
  clearEventLog(): void

  // 获取监听器数量
  getListenerCount(eventType: string): number
}
```

### 全局事件总线实例

```typescript
import { globalEventBus } from '@platform/core'

// 发送事件
globalEventBus.emit('my-event', { data: 'hello' })

// 监听事件
const unsubscribe = globalEventBus.on('my-event', (event) => {
  console.log('Event received:', event.payload)
})

// 取消监听
unsubscribe()
```

## 📝 预定义事件

### 平台生命周期事件

```typescript
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
```

## 🎨 使用模式

### 1. 基本使用

```typescript
import { globalEventBus, PlatformEvents } from '@platform/core'

// 发送事件
globalEventBus.emit(PlatformEvents.MODULE_MOUNT, {
  moduleId: 'story',
  timestamp: Date.now(),
})

// 监听事件
globalEventBus.on(PlatformEvents.MODULE_MOUNT, (event) => {
  console.log('Module mounted:', event.payload.moduleId)
})
```

### 2. 在 React 组件中使用

```typescript
import { useEffect } from 'react'
import { globalEventBus, PlatformEvents } from '@platform/core'

function MyComponent() {
  useEffect(() => {
    // 监听事件
    const unsubscribe = globalEventBus.on(
      PlatformEvents.MODULE_MOUNT,
      (event) => {
        console.log('Module mounted:', event.payload.moduleId)
      }
    )

    // 清理：组件卸载时取消监听
    return unsubscribe
  }, [])

  const handleClick = () => {
    // 发送事件
    globalEventBus.emit('button:click', { buttonId: 'submit' })
  }

  return <button onClick={handleClick}>Click Me</button>
}
```

### 3. 使用 Hook

```typescript
import { useEventBus } from '@platform/core'

function MyComponent() {
  const eventBus = useEventBus()

  const handleClick = () => {
    eventBus.emit('button:click', { buttonId: 'submit' })
  }

  return <button onClick={handleClick}>Click Me</button>
}
```

### 4. 自定义事件监听 Hook

```typescript
import { useEffect } from 'react'
import { globalEventBus } from '@platform/core'
import type { EventHandler } from '@platform/core'

export function useEventListener(
  eventType: string,
  handler: EventHandler,
  deps: any[] = []
) {
  useEffect(() => {
    const unsubscribe = globalEventBus.on(eventType, handler)
    return unsubscribe
  }, [eventType, ...deps])
}

// 使用
function MyComponent() {
  useEventListener('story:play', (event) => {
    console.log('Story playing:', event.payload.storyId)
  })

  return <div>...</div>
}
```

### 5. 监听一次事件

```typescript
import { globalEventBus } from '@platform/core'

// 只监听一次，触发后自动取消
globalEventBus.once('platform:ready', (event) => {
  console.log('Platform is ready!')
  // 执行初始化逻辑
})
```

### 6. 监听所有事件

```typescript
import { globalEventBus } from '@platform/core'

// 监听所有事件（用于调试）
globalEventBus.onAll((event) => {
  console.log(`[Event] ${event.type}`, event.payload)
})
```

## 🔔 事件命名规范

### 命名格式

```
<namespace>:<action>[:<detail>]
```

### 示例

```typescript
// ✅ 推荐：清晰的命名空间和动作
'module:load'
'module:load:success'
'module:load:error'
'story:play'
'story:pause'
'story:end'
'user:login'
'user:logout'
'ui:show:modal'
'ui:hide:modal'

// ❌ 不推荐：模糊的命名
'load'
'update'
'change'
'click'
```

### 命名空间约定

| 命名空间 | 说明 | 示例 |
|---------|------|------|
| `platform:` | 平台级事件 | `platform:ready` |
| `module:` | 模块生命周期 | `module:mount` |
| `route:` | 路由事件 | `route:change` |
| `state:` | 状态事件 | `state:update` |
| `user:` | 用户事件 | `user:login` |
| `ui:` | UI 事件 | `ui:show:modal` |
| `data:` | 数据事件 | `data:load` |
| `<moduleId>:` | 模块特定事件 | `story:play` |

## 📊 事件日志

### 查看事件日志

```typescript
import { globalEventBus } from '@platform/core'

// 获取所有事件日志
const logs = globalEventBus.getEventLog()
console.log('Event logs:', logs)

// 输出格式
// [
//   {
//     type: 'platform:ready',
//     payload: undefined,
//     source: 'platform',
//     timestamp: 1704902400000
//   },
//   ...
// ]
```

### 清空事件日志

```typescript
import { globalEventBus } from '@platform/core'

// 清空日志
globalEventBus.clearEventLog()
```

### 事件日志配置

```typescript
// src/platform/config/platform.config.ts
export const platformConfig: PlatformConfig = {
  // ...
  eventBus: {
    maxListeners: 100,
    enableLogging: true,  // 启用事件日志
  },
}
```

## 🔍 调试技巧

### 1. 监听所有事件

```typescript
import { globalEventBus } from '@platform/core'

// 在开发环境监听所有事件
if (process.env.NODE_ENV === 'development') {
  globalEventBus.onAll((event) => {
    console.log(
      `%c[Event] ${event.type}`,
      'color: #4CAF50; font-weight: bold',
      event.payload
    )
  })
}
```

### 2. 事件过滤

```typescript
import { globalEventBus } from '@platform/core'

// 只监听特定命名空间的事件
globalEventBus.onAll((event) => {
  if (event.type.startsWith('module:')) {
    console.log('Module event:', event)
  }
})
```

### 3. 事件统计

```typescript
import { globalEventBus } from '@platform/core'

// 统计事件触发次数
const eventCounts = new Map<string, number>()

globalEventBus.onAll((event) => {
  const count = eventCounts.get(event.type) || 0
  eventCounts.set(event.type, count + 1)
})

// 查看统计
console.log('Event counts:', Object.fromEntries(eventCounts))
```

### 4. 事件时序分析

```typescript
import { globalEventBus } from '@platform/core'

// 记录事件时序
const eventTimeline: Array<{ type: string; time: number }> = []

globalEventBus.onAll((event) => {
  eventTimeline.push({
    type: event.type,
    time: event.timestamp,
  })
})

// 分析事件间隔
function analyzeEventTiming() {
  for (let i = 1; i < eventTimeline.length; i++) {
    const prev = eventTimeline[i - 1]
    const curr = eventTimeline[i]
    const interval = curr.time - prev.time
    console.log(`${prev.type} -> ${curr.type}: ${interval}ms`)
  }
}
```

## 🎯 最佳实践

### 1. 事件命名

```typescript
// ✅ 推荐：使用预定义事件
import { PlatformEvents } from '@platform/core'
eventBus.emit(PlatformEvents.MODULE_MOUNT, { moduleId: 'story' })

// ✅ 推荐：自定义事件使用命名空间
eventBus.emit('story:play', { storyId: 'qin-unification' })

// ❌ 不推荐：使用通用名称
eventBus.emit('play', { id: 'qin-unification' })
```

### 2. 事件数据

```typescript
// ✅ 推荐：使用对象传递数据
eventBus.emit('story:play', {
  storyId: 'qin-unification',
  autoPlay: true,
  startTime: 0,
})

// ❌ 不推荐：传递多个参数
eventBus.emit('story:play', 'qin-unification', true, 0)
```

### 3. 事件监听清理

```typescript
// ✅ 推荐：在组件卸载时清理
useEffect(() => {
  const unsubscribe = eventBus.on('story:play', handler)
  return unsubscribe  // 自动清理
}, [])

// ❌ 不推荐：忘记清理
useEffect(() => {
  eventBus.on('story:play', handler)
  // 没有清理，会导致内存泄漏
}, [])
```

### 4. 事件处理错误

```typescript
// ✅ 推荐：处理事件处理器中的错误
eventBus.on('story:play', async (event) => {
  try {
    await playStory(event.payload.storyId)
  } catch (error) {
    console.error('Failed to play story:', error)
    eventBus.emit('story:error', { error })
  }
})

// ❌ 不推荐：不处理错误
eventBus.on('story:play', async (event) => {
  await playStory(event.payload.storyId)  // 可能抛出错误
})
```

### 5. 避免事件循环

```typescript
// ❌ 不推荐：事件循环
eventBus.on('event-a', () => {
  eventBus.emit('event-b')
})

eventBus.on('event-b', () => {
  eventBus.emit('event-a')  // 无限循环！
})

// ✅ 推荐：使用标志位避免循环
let isProcessing = false

eventBus.on('event-a', () => {
  if (isProcessing) return
  isProcessing = true
  eventBus.emit('event-b')
  isProcessing = false
})
```

## 🔌 与状态管理集成

### 事件触发状态变化

```typescript
import { globalEventBus, PlatformEvents } from './eventBus'
import { usePlatformStore } from './platformStore'

// 监听事件并更新状态
globalEventBus.on(PlatformEvents.MODULE_MOUNT, (event) => {
  const { moduleId } = event.payload
  usePlatformStore.getState().setActiveModule(moduleId)
})
```

### 状态变化触发事件

```typescript
import { globalEventBus, PlatformEvents } from './eventBus'

export const usePlatformStore = create<PlatformState>((set) => ({
  setReady: () => {
    set({ status: 'ready' })
    globalEventBus.emit(PlatformEvents.PLATFORM_READY)
  },
}))
```

## ⚠️ 注意事项

### 1. 避免过度使用

事件总线适合模块间通信，但不适合组件内部通信。

```typescript
// ❌ 不推荐：组件内部使用事件
function Parent() {
  useEventListener('child:click', handleChildClick)
  return <Child />
}

function Child() {
  const eventBus = useEventBus()
  return <button onClick={() => eventBus.emit('child:click')}>Click</button>
}

// ✅ 推荐：使用 props
function Parent() {
  return <Child onClick={handleChildClick} />
}

function Child({ onClick }) {
  return <button onClick={onClick}>Click</button>
}
```

### 2. 避免内存泄漏

始终在组件卸载时取消事件监听。

```typescript
// ✅ 推荐
useEffect(() => {
  const unsubscribe = eventBus.on('event', handler)
  return unsubscribe
}, [])

// ❌ 不推荐
useEffect(() => {
  eventBus.on('event', handler)
}, [])
```

### 3. 事件命名冲突

使用命名空间避免事件名称冲突。

```typescript
// ✅ 推荐：使用模块 ID 作为命名空间
eventBus.emit('story:play', { storyId: 'qin' })
eventBus.emit('video:play', { videoId: 'intro' })

// ❌ 不推荐：通用名称容易冲突
eventBus.emit('play', { id: 'qin' })
```

## 📚 相关文档

- [平台初始化](./platform-initialization.md)
- [状态管理](./state-management.md)
- [模块通信](../02-module-development/module-communication.md)
- [事件类型定义](../04-event-system/event-types.md)

---

**最后更新**: 2026-01-10
