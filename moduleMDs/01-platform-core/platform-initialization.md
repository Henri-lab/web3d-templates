# 平台初始化

> 平台启动和初始化流程的完整说明

## 📖 概述

平台初始化是中台系统启动的第一步，负责创建平台实例、注册模块、初始化状态和事件总线等核心功能。

## 🔄 初始化流程

### 完整流程图

```
┌─────────────────────────────────────────────────────────┐
│ 1. 应用启动 (App.tsx)                                    │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 2. PlatformProvider 包裹应用                             │
│    - 创建 React Context                                  │
│    - 调用 initializePlatform()                           │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 3. 初始化平台核心 (initializePlatform)                   │
│    ├─ 创建 Zustand Store                                │
│    ├─ 创建 EventBus 实例                                │
│    ├─ 加载平台配置                                       │
│    └─ 创建平台实例对象                                   │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 4. 注册所有模块                                          │
│    ├─ 遍历 moduleConfigs                                │
│    ├─ 发送 MODULE_REGISTER 事件                         │
│    ├─ 添加到 loadedModules                              │
│    └─ 执行模块 beforeLoad 钩子                          │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 5. 设置平台就绪                                          │
│    ├─ 调用 store.setReady()                             │
│    ├─ 发送 PLATFORM_READY 事件                          │
│    └─ 返回平台实例                                       │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 6. 应用可用                                              │
│    - 模块可以开始加载和渲染                              │
└─────────────────────────────────────────────────────────┘
```

## 📂 源码位置

```
src/platform/core/platform.ts
```

## 🔧 核心 API

### initializePlatform()

初始化平台，创建平台实例。

**签名**:
```typescript
async function initializePlatform(): Promise<PlatformInstance>
```

**返回值**:
```typescript
interface PlatformInstance {
  config: PlatformConfig          // 平台配置
  modules: ModuleConfig[]         // 模块配置列表
  eventBus: EventBus              // 事件总线实例
  store: typeof usePlatformStore  // Zustand Store
  getSnapshot: () => Snapshot     // 获取状态快照
}
```

**示例**:
```typescript
import { initializePlatform } from '@platform/core'

async function bootstrap() {
  try {
    const platform = await initializePlatform()
    console.log('Platform initialized:', platform.config.name)
    console.log('Loaded modules:', platform.modules.map(m => m.id))
  } catch (error) {
    console.error('Platform initialization failed:', error)
  }
}

bootstrap()
```

### getPlatformInstance()

获取已初始化的平台实例。

**签名**:
```typescript
function getPlatformInstance(): PlatformInstance
```

**抛出异常**:
- 如果平台未初始化，抛出错误

**示例**:
```typescript
import { getPlatformInstance } from '@platform/core'

// 在平台初始化后使用
const platform = getPlatformInstance()
console.log('Platform version:', platform.config.version)
```

### destroyPlatform()

销毁平台实例，清理所有资源。

**签名**:
```typescript
function destroyPlatform(): void
```

**示例**:
```typescript
import { destroyPlatform } from '@platform/core'

// 应用卸载时调用
window.addEventListener('beforeunload', () => {
  destroyPlatform()
})
```

### restartPlatform()

重启平台（先销毁再初始化）。

**签名**:
```typescript
async function restartPlatform(): Promise<PlatformInstance>
```

**示例**:
```typescript
import { restartPlatform } from '@platform/core'

// 配置更新后重启平台
async function handleConfigUpdate() {
  const platform = await restartPlatform()
  console.log('Platform restarted')
}
```

## 🎯 使用方式

### 1. 在 React 应用中使用

```typescript
// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { PlatformProvider } from '@platform/PlatformProvider'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <PlatformProvider>
        <App />
      </PlatformProvider>
    </BrowserRouter>
  </React.StrictMode>
)
```

### 2. PlatformProvider 实现

```typescript
// src/platform/PlatformProvider.tsx
import React, { useEffect, useState } from 'react'
import { initializePlatform, type PlatformInstance } from '@platform/core'

const PlatformContext = React.createContext<PlatformInstance | null>(null)

export function PlatformProvider({ children }: { children: React.ReactNode }) {
  const [platform, setPlatform] = useState<PlatformInstance | null>(null)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    initializePlatform()
      .then(setPlatform)
      .catch(setError)
  }, [])

  if (error) {
    return <div>Platform initialization failed: {error.message}</div>
  }

  if (!platform) {
    return <div>Initializing platform...</div>
  }

  return (
    <PlatformContext.Provider value={platform}>
      {children}
    </PlatformContext.Provider>
  )
}

export function usePlatform() {
  const context = React.useContext(PlatformContext)
  if (!context) {
    throw new Error('usePlatform must be used within PlatformProvider')
  }
  return context
}
```

### 3. 在组件中使用平台实例

```typescript
import { usePlatform } from '@platform/PlatformProvider'

function MyComponent() {
  const platform = usePlatform()

  useEffect(() => {
    console.log('Platform config:', platform.config)
    console.log('Loaded modules:', platform.modules)
  }, [platform])

  return <div>Platform: {platform.config.name}</div>
}
```

## 📊 初始化状态

### 状态流转

```
initializing  ──────>  ready
     │
     │ (error)
     ↓
   error  ──────>  ready
         (clearError)
```

### 状态定义

```typescript
export type PlatformStatus = 'initializing' | 'ready' | 'error'

export interface PlatformState {
  status: PlatformStatus
  loadedModules: string[]
  activeModule: string | null
  error: Error | null
}
```

### 监听状态变化

```typescript
import { usePlatformStore } from '@platform/core'

function StatusMonitor() {
  const status = usePlatformStore((state) => state.status)
  const error = usePlatformStore((state) => state.error)

  if (status === 'initializing') {
    return <div>Initializing...</div>
  }

  if (status === 'error') {
    return <div>Error: {error?.message}</div>
  }

  return <div>Platform ready</div>
}
```

## 🔔 初始化事件

### 事件时序

```
PLATFORM_INIT
    ↓
MODULE_REGISTER (for each module)
    ↓
PLATFORM_READY
```

### 监听初始化事件

```typescript
import { globalEventBus, PlatformEvents } from '@platform/core'

// 监听平台就绪
globalEventBus.on(PlatformEvents.PLATFORM_READY, (event) => {
  console.log('Platform is ready!')
})

// 监听平台错误
globalEventBus.on(PlatformEvents.PLATFORM_ERROR, (event) => {
  console.error('Platform error:', event.payload.error)
})

// 监听模块注册
globalEventBus.on(PlatformEvents.MODULE_REGISTER, (event) => {
  console.log('Module registered:', event.payload.moduleId)
})
```

## ⚙️ 配置选项

### 平台配置

```typescript
// src/platform/config/platform.config.ts
export const platformConfig: PlatformConfig = {
  name: 'History3D Learning Platform',
  version: '2.1.0-stable',
  mode: 'development',

  shell: {
    port: 5173,
    basePath: '/',
    title: '历史3D学习平台',
    shared: {},
  },

  modules: [],  // 将由 moduleConfigs 填充

  routing: {
    mode: 'browser',
    basename: '/',
    fallback: '/404',
  },

  stateMachine: {
    initialState: 'ready',
    persistState: false,
    devTools: true,
  },

  eventBus: {
    maxListeners: 100,
    enableLogging: true,
  },

  performance: {
    lazyLoad: true,
    preload: [],
    cacheStrategy: 'memory',
  },

  devTools: {
    enabled: true,
    showModuleInfo: true,
    showStateTransitions: true,
  },
}
```

### 模块配置

```typescript
export const moduleConfigs: ModuleConfig[] = [
  {
    id: 'story',
    name: '历史故事',
    version: '1.0.0',
    type: 'local',
    routes: [
      { path: '/stories', component: 'StorySelectionPage' },
      { path: '/story/:storyId', component: 'StoryPlayerPage' },
    ],
    menu: {
      title: '历史故事',
      icon: 'book',
      order: 1,
      visible: true,
    },
    capabilities: {
      provides: ['story.play', 'story.pause'],
      requires: ['platform.eventBus'],
    },
    lifecycle: {},
    config: {},
    state: { namespace: 'story', persist: true },
  },
  // ... 更多模块
]
```

## 🐛 错误处理

### 初始化失败

```typescript
import { initializePlatform } from '@platform/core'

async function bootstrap() {
  try {
    await initializePlatform()
  } catch (error) {
    // 处理初始化错误
    console.error('Failed to initialize platform:', error)

    // 显示错误页面
    showErrorPage(error)

    // 上报错误
    reportError(error)
  }
}
```

### 模块注册失败

```typescript
import { globalEventBus, PlatformEvents } from '@platform/core'

globalEventBus.on(PlatformEvents.MODULE_LOAD_ERROR, (event) => {
  const { moduleId, error } = event.payload
  console.error(`Module ${moduleId} failed to load:`, error)

  // 显示错误提示
  showToast(`模块 ${moduleId} 加载失败`)
})
```

## 🔍 调试技巧

### 1. 查看初始化日志

```typescript
// 在浏览器控制台查看
// [Platform] Initializing...
// [Platform] Registering modules...
// [Platform] Registered module: welcome
// [Platform] Registered module: story
// [Platform] Initialized successfully
```

### 2. 检查平台状态

```typescript
import { usePlatformStore, getSnapshot } from '@platform/core'

// 获取状态快照
const snapshot = getSnapshot()
console.log('Status:', snapshot.value)
console.log('Loaded modules:', snapshot.context.loadedModules)
```

### 3. 监听所有事件

```typescript
import { globalEventBus } from '@platform/core'

globalEventBus.onAll((event) => {
  console.log(`[Event] ${event.type}`, event.payload)
})
```

## ⚠️ 注意事项

### 1. 只初始化一次
平台只能初始化一次，重复调用会抛出错误。如需重启，使用 `restartPlatform()`。

### 2. 等待初始化完成
在使用平台功能前，确保初始化已完成：

```typescript
// ❌ 错误：未等待初始化
const platform = getPlatformInstance()  // 可能抛出错误

// ✅ 正确：等待初始化
await initializePlatform()
const platform = getPlatformInstance()
```

### 3. 错误处理
始终使用 try-catch 处理初始化错误：

```typescript
try {
  await initializePlatform()
} catch (error) {
  // 处理错误
}
```

### 4. 清理资源
应用卸载时调用 `destroyPlatform()` 清理资源。

## 📚 相关文档

- [状态管理](./state-management.md)
- [事件总线](./event-bus.md)
- [模块注册](./module-registry.md)
- [配置系统](./configuration.md)

---

**最后更新**: 2026-01-10
