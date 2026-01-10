# 事件系统

> 模块间通信的核心机制

## 📖 概述

事件系统是中台平台模块间通信的核心机制。通过发布-订阅模式，实现模块间的解耦通信，避免模块间的直接依赖。

## 🎯 核心概念

### 发布-订阅模式

```
发布者 (Publisher)  ──>  事件总线 (EventBus)  ──>  订阅者 (Subscriber)
     │                         │                         │
     │  emit('event', data)    │                         │
     │────────────────────────>│                         │
     │                         │  on('event', handler)   │
     │                         │<────────────────────────│
     │                         │                         │
     │                         │  trigger handler        │
     │                         │────────────────────────>│
```

### 事件流程

```
1. 模块 A 发送事件
   ↓
2. 事件总线接收事件
   ↓
3. 记录事件日志
   ↓
4. 查找订阅者
   ↓
5. 触发订阅者的处理函数
   ↓
6. 处理函数执行
```

## 📚 文档导航

1. [事件类型定义](./event-types.md) - 所有预定义事件类型
2. [事件流程图](./event-flow.md) - 事件流转详解
3. [自定义事件](./custom-events.md) - 创建自定义事件
4. [事件调试](./event-debugging.md) - 调试技巧

## 🔔 预定义事件

### 平台生命周期事件

| 事件类型 | 说明 | Payload |
|---------|------|---------|
| `platform:init` | 平台初始化 | - |
| `platform:ready` | 平台就绪 | - |
| `platform:error` | 平台错误 | `{ error: Error }` |

### 模块生命周期事件

| 事件类型 | 说明 | Payload |
|---------|------|---------|
| `module:register` | 模块注册 | `{ moduleId: string }` |
| `module:load:start` | 模块开始加载 | `{ moduleId: string }` |
| `module:load:success` | 模块加载成功 | `{ moduleId: string }` |
| `module:load:error` | 模块加载失败 | `{ moduleId: string, error: Error }` |
| `module:mount` | 模块挂载 | `{ moduleId: string }` |
| `module:unmount` | 模块卸载 | `{ moduleId: string }` |
| `module:activate` | 模块激活 | `{ moduleId: string }` |
| `module:deactivate` | 模块停用 | `{ moduleId: string }` |

### 路由事件

| 事件类型 | 说明 | Payload |
|---------|------|---------|
| `route:change` | 路由变化 | `{ from: string, to: string }` |
| `route:before:change` | 路由变化前 | `{ from: string, to: string }` |
| `route:error` | 路由错误 | `{ error: Error }` |

### 状态事件

| 事件类型 | 说明 | Payload |
|---------|------|---------|
| `state:change` | 状态变化 | `{ namespace: string, state: any }` |
| `state:update` | 状态更新 | `{ namespace: string, updates: any }` |

### UI 事件

| 事件类型 | 说明 | Payload |
|---------|------|---------|
| `ui:show:modal` | 显示模态框 | `{ modalId: string, props: any }` |
| `ui:hide:modal` | 隐藏模态框 | `{ modalId: string }` |
| `ui:show:toast` | 显示提示 | `{ message: string, type: string }` |
| `ui:show:loading` | 显示加载 | `{ message?: string }` |
| `ui:hide:loading` | 隐藏加载 | - |

## 🚀 快速开始

### 1. 发送事件

```typescript
import { globalEventBus, PlatformEvents } from '@platform/core'

// 发送预定义事件
globalEventBus.emit(PlatformEvents.MODULE_MOUNT, {
  moduleId: 'story',
})

// 发送自定义事件
globalEventBus.emit('story:play', {
  storyId: 'qin-unification',
  autoPlay: true,
})
```

### 2. 监听事件

```typescript
import { globalEventBus, PlatformEvents } from '@platform/core'

// 监听预定义事件
const unsubscribe = globalEventBus.on(
  PlatformEvents.MODULE_MOUNT,
  (event) => {
    console.log('Module mounted:', event.payload.moduleId)
  }
)

// 监听自定义事件
globalEventBus.on('story:play', (event) => {
  const { storyId, autoPlay } = event.payload
  console.log(`Playing story: ${storyId}, autoPlay: ${autoPlay}`)
})

// 取消监听
unsubscribe()
```

### 3. 在 React 组件中使用

```typescript
import React, { useEffect } from 'react'
import { globalEventBus, PlatformEvents } from '@platform/core'

export default function MyComponent() {
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

## 📝 事件命名规范

### 命名格式

```
<namespace>:<action>[:<detail>]
```

### 命名空间

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

### 命名示例

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

## 🎨 使用模式

### 1. 模块间通信

```typescript
// 模块 A：发送事件
globalEventBus.emit('story:play', {
  storyId: 'qin-unification',
})

// 模块 B：监听事件
globalEventBus.on('story:play', (event) => {
  playStory(event.payload.storyId)
})
```

### 2. 请求-响应模式

```typescript
// 请求方
globalEventBus.emit('data:request', {
  requestId: '123',
  type: 'stories',
})

globalEventBus.once('data:response:123', (event) => {
  console.log('Data received:', event.payload.data)
})

// 响应方
globalEventBus.on('data:request', (event) => {
  const { requestId, type } = event.payload
  const data = fetchData(type)

  globalEventBus.emit(`data:response:${requestId}`, { data })
})
```

### 3. 广播模式

```typescript
// 广播方
globalEventBus.emit('settings:update', {
  theme: 'dark',
  language: 'zh-CN',
})

// 多个订阅者
globalEventBus.on('settings:update', (event) => {
  updateTheme(event.payload.theme)
})

globalEventBus.on('settings:update', (event) => {
  updateLanguage(event.payload.language)
})
```

### 4. 事件链模式

```typescript
// 事件 A 触发事件 B
globalEventBus.on('user:login', (event) => {
  // 处理登录
  loginUser(event.payload.userId)

  // 触发下一个事件
  globalEventBus.emit('user:profile:load', {
    userId: event.payload.userId,
  })
})

// 事件 B 触发事件 C
globalEventBus.on('user:profile:load', (event) => {
  // 加载用户资料
  loadProfile(event.payload.userId)

  // 触发下一个事件
  globalEventBus.emit('user:ready', {
    userId: event.payload.userId,
  })
})
```

## 🔍 调试技巧

### 1. 监听所有事件

```typescript
import { globalEventBus } from '@platform/core'

// 监听所有事件
globalEventBus.onAll((event) => {
  console.log(`[Event] ${event.type}`, event.payload)
})
```

### 2. 过滤特定事件

```typescript
// 只监听模块相关事件
globalEventBus.onAll((event) => {
  if (event.type.startsWith('module:')) {
    console.log('Module event:', event)
  }
})
```

### 3. 查看事件日志

```typescript
// 获取事件日志
const logs = globalEventBus.getEventLog()
console.log('Event logs:', logs)

// 清空事件日志
globalEventBus.clearEventLog()
```

### 4. 事件统计

```typescript
const eventCounts = new Map<string, number>()

globalEventBus.onAll((event) => {
  const count = eventCounts.get(event.type) || 0
  eventCounts.set(event.type, count + 1)
})

// 查看统计
console.log('Event counts:', Object.fromEntries(eventCounts))
```

## ⚠️ 注意事项

### 1. 避免事件循环

```typescript
// ❌ 不推荐：事件循环
eventBus.on('event-a', () => {
  eventBus.emit('event-b')
})

eventBus.on('event-b', () => {
  eventBus.emit('event-a') // 无限循环！
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

### 2. 清理事件监听

```typescript
// ✅ 推荐：在组件卸载时清理
useEffect(() => {
  const unsubscribe = eventBus.on('event', handler)
  return unsubscribe
}, [])

// ❌ 不推荐：忘记清理
useEffect(() => {
  eventBus.on('event', handler)
}, [])
```

### 3. 事件命名冲突

```typescript
// ✅ 推荐：使用命名空间
eventBus.emit('story:play', { storyId: 'qin' })
eventBus.emit('video:play', { videoId: 'intro' })

// ❌ 不推荐：通用名称容易冲突
eventBus.emit('play', { id: 'qin' })
```

## 📚 相关文档

- [事件类型定义](./event-types.md)
- [事件流程图](./event-flow.md)
- [自定义事件](./custom-events.md)
- [事件调试](./event-debugging.md)
- [事件总线 API](../03-api-reference/event-bus-api.md)

---

**最后更新**: 2026-01-10
