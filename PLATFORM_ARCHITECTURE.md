# 中台平台架构文档

## 📖 概述

默认实现是一个基于 **配置驱动 + Zustand + 本地模块** 的稳健中台系统，采用配置驱动、状态管理、事件总线通信的现代化架构。
文档中仍保留最初的 **Vite Module Federation + XState** 方案，作为进阶微前端参考。

### 核心特性

- ✅ **配置驱动** - 所有模块通过配置文件注册和管理
- ✅ **状态管理** - 使用 Zustand 实现轻量状态管理（早期版本使用 XState）
- ✅ **事件总线** - 模块间通过事件解耦通信
- ✅ **模块接入** - 默认使用本地模块，可扩展支持 Module Federation、iframe 等方式
- ✅ **类型安全** - 完整的 TypeScript 类型系统
- ✅ **独立部署** - 每个模块可以独立开发和部署
- ✅ **热插拔** - 支持模块动态加载和卸载

---

## 🏗️ 架构设计

### 整体架构

```
┌─────────────────────────────────────────────────────────┐
│                    主应用 (Shell)                        │
│  ┌─────────────────────────────────────────────────┐   │
│  │  平台核心 (Platform Core)                        │   │
│  │  - 状态管理 (Zustand)                            │   │
│  │  - 事件总线 (EventBus)                           │   │
│  │  - 模块注册中心 (ModuleRegistry)                 │   │
│  │  - 平台API (PlatformAPI)                         │   │
│  └─────────────────────────────────────────────────┘   │
│                          ↓                              │
│  ┌─────────────────────────────────────────────────┐   │
│  │  配置系统 (Config)                               │   │
│  │  - platform.config.ts (平台配置)                 │   │
│  │  - types.ts (类型定义)                           │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          ↓
        ┌─────────────────┼─────────────────┐
        ↓                 ↓                 ↓
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│  故事模块      │  │  实验室模块    │  │  地球模块      │
│  (Story)      │  │  (Lab)        │  │  (Earth)      │
│               │  │               │  │               │
│  独立仓库      │  │  独立仓库      │  │  独立仓库      │
│  独立部署      │  │  独立部署      │  │  独立部署      │
│  端口: 5174    │  │  端口: 5175    │  │  端口: 5176    │
└───────────────┘  └───────────────┘  └───────────────┘
```

### 目录结构

```
src/
├── platform/                    # 平台核心
│   ├── config/                  # 配置系统
│   │   ├── platform.config.ts   # 平台配置
│   │   └── types.ts             # 类型定义
│   │
│   └── core/                    # 核心模块
│       ├── platform.ts          # 平台初始化
│       ├── stateMachine.ts      # XState 状态机
│       ├── eventBus.ts          # 事件总线
│       ├── moduleRegistry.ts    # 模块注册中心
│       ├── platformAPI.ts       # 平台 API
│       └── index.ts             # 统一导出
│
├── pages/                       # 页面组件
├── components/                  # 共享组件
├── stores/                      # 状态管理
└── ...
```

---

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 启动主应用

```bash
npm run dev
```

主应用将在 `http://localhost:5173` 启动。

### 3. 启动子模块（可选）

如果你有独立的子模块，需要分别启动：

```bash
# 故事模块
cd modules/story
npm run dev  # 端口 5174

# 实验室模块
cd modules/lab
npm run dev  # 端口 5175

# 地球模块
cd modules/earth
npm run dev  # 端口 5176
```

---

## 📝 配置说明

### 平台配置 (`platform.config.ts`)

```typescript
export const platformConfig: PlatformConfig = {
  name: 'History3D Learning Platform',
  version: '2.1.0-stable',
  mode: 'development',

  // 主应用配置
  shell: {
    port: 5173,
    basePath: '/',
    title: '历史3D学习平台',
    shared: {
      /* 共享依赖 */
    },
  },

  // 模块注册表
  modules: [],

  // 路由配置
  routing: {
    mode: 'browser',
    basename: '/',
    fallback: '/404',
  },

  // 状态配置（简化版，使用Zustand）
  stateMachine: {
    initialState: 'ready',
    persistState: false,
    devTools: true,
  },

  // 事件总线配置
  eventBus: {
    maxListeners: 100,
    enableLogging: true,
  },

  // 性能配置
  performance: {
    lazyLoad: true,
    preload: ['story'],
    cacheStrategy: 'memory',
  },
}
```

### 模块配置

```typescript
const storyModule: ModuleConfig = {
  id: 'story',
  name: '历史故事',
  version: '1.0.0',
  type: 'remote', // 'local' | 'remote' | 'iframe'

  // 远程入口（Module Federation）
  entry: 'http://localhost:5174/remoteEntry.js',

  // 路由配置
  routes: [
    {
      path: '/stories',
      component: 'StorySelectionPage',
      meta: { title: '选择故事' },
    },
  ],

  // 导航菜单
  menu: {
    title: '历史故事',
    icon: 'book',
    order: 1,
    visible: true,
  },

  // 模块能力
  capabilities: {
    provides: ['story.play', 'story.pause'],
    requires: ['platform.eventBus'],
  },

  // 生命周期钩子
  lifecycle: {
    beforeLoad: async () => {},
    onLoad: async () => {},
    onMount: async () => {},
    onUnmount: async () => {},
    onError: async (error) => {},
  },

  // 模块配置
  config: {
    maxStories: 100,
    autoSave: true,
  },

  // 状态配置
  state: {
    namespace: 'story',
    persist: true,
  },
}
```

---

## 🔧 核心API

### 平台初始化

```typescript
import { initializePlatform } from '@platform/core'

// 初始化平台
const platform = await initializePlatform()

// 获取平台实例
import { getPlatformInstance } from '@platform/core'
const platform = getPlatformInstance()
```

### 使用平台API（React Hook）

```typescript
import { usePlatformAPI } from '@platform/core'

function MyComponent() {
  const api = usePlatformAPI()

  // 发送事件
  api.eventBus.emit('my-event', { data: 'hello' })

  // 监听事件
  React.useEffect(() => {
    const unsubscribe = api.eventBus.on('my-event', (event) => {
      console.log(event.payload)
    })
    return unsubscribe
  }, [])

  // 路由跳转
  const handleClick = () => {
    api.router.push('/stories')
  }

  // 加载模块
  const loadStoryModule = async () => {
    await api.moduleManager.loadModule('story')
  }

  return <div>...</div>
}
```

### 事件总线

```typescript
import { useEventBus, useEventListener } from '@platform/core'

function MyComponent() {
  const eventBus = useEventBus()

  // 发送事件
  eventBus.emit('user:login', { userId: '123' })

  // 监听事件（Hook）
  useEventListener('user:login', (event) => {
    console.log('User logged in:', event.payload)
  })

  return <div>...</div>
}
```

### 状态管理

```typescript
import { usePlatformState } from '@platform/core'

function MyComponent() {
  const [state, setState] = usePlatformState('myModule', {
    count: 0,
  })

  const increment = () => {
    setState({ count: state.count + 1 })
  }

  return (
    <div>
      <p>Count: {state.count}</p>
      <button onClick={increment}>Increment</button>
    </div>
  )
}
```

### 模块管理

```typescript
import { useModule } from '@platform/core'

function MyComponent() {
  const { module, loading, error, load, unload, reload } = useModule('story')

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div>
      <p>Module: {module?.config.name}</p>
      <p>Status: {module?.status}</p>
      <button onClick={load}>Load</button>
      <button onClick={unload}>Unload</button>
      <button onClick={reload}>Reload</button>
    </div>
  )
}
```

---

## 🎯 状态机

### 状态图

```
┌─────────────────────────────────────────────────────────┐
│                      Platform                            │
│                                                          │
│  ┌──────────┐  INIT_COMPLETE  ┌──────────┐             │
│  │ loading  │ ──────────────> │  ready   │             │
│  └──────────┘                 └──────────┘             │
│       │                            │                    │
│       │ INIT_ERROR                 │ LOAD_MODULE        │
│       ↓                            ↓                    │
│  ┌──────────┐                 ┌──────────┐             │
│  │  error   │                 │ loading  │             │
│  └──────────┘                 │  module  │             │
│       │                        └──────────┘             │
│       │ CLEAR_ERROR                 │                   │
│       └─────────────────────────────┘                   │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### 使用状态机

```typescript
import { useMachine } from '@xstate/react'
import { platformMachine } from '@platform/core'

function MyComponent() {
  const [state, send] = useMachine(platformMachine)

  // 检查状态
  const isReady = state.matches('ready')
  const isLoading = state.matches('initializing')

  // 发送事件
  const handleInit = () => {
    send({ type: 'INIT_COMPLETE' })
  }

  return <div>State: {JSON.stringify(state.value)}</div>
}
```

---

## 📦 模块开发

### 创建新模块

1. **创建模块目录**

```bash
mkdir -p modules/my-module
cd modules/my-module
npm init -y
```

2. **安装依赖**

```bash
npm install react react-dom
npm install -D vite @vitejs/plugin-react @originjs/vite-plugin-federation
```

3. **配置 `vite.config.ts`**

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'myModule',
      filename: 'remoteEntry.js',
      exposes: {
        './MyPage': './src/pages/MyPage.tsx',
      },
      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true },
      },
    }),
  ],
  server: {
    port: 5177,
    cors: true,
  },
  build: {
    target: 'esnext',
  },
})
```

4. **创建页面组件**

```typescript
// src/pages/MyPage.tsx
import React from 'react'
import { usePlatformAPI } from 'shell/PlatformAPI'

export default function MyPage() {
  const api = usePlatformAPI()

  React.useEffect(() => {
    api.eventBus.emit('module:mounted', { moduleId: 'myModule' })
  }, [])

  return <div>My Module Page</div>
}
```

5. **在主应用注册模块**

```typescript
// src/platform/config/platform.config.ts
export const moduleConfigs: ModuleConfig[] = [
  // ... 其他模块
  {
    id: 'myModule',
    name: '我的模块',
    version: '1.0.0',
    type: 'remote',
    entry: 'http://localhost:5177/remoteEntry.js',
    routes: [
      {
        path: '/my-module',
        component: 'MyPage',
        meta: { title: '我的模块' },
      },
    ],
    menu: {
      title: '我的模块',
      icon: 'star',
      order: 10,
      visible: true,
    },
    capabilities: {
      provides: [],
      requires: ['platform.eventBus'],
    },
    lifecycle: {},
    config: {},
    state: {
      namespace: 'myModule',
      persist: false,
    },
  },
]
```

---

## 🔌 事件系统

### 预定义事件

```typescript
import { PlatformEvents } from '@platform/core'

// 平台生命周期
PlatformEvents.PLATFORM_INIT
PlatformEvents.PLATFORM_READY
PlatformEvents.PLATFORM_ERROR

// 模块生命周期
PlatformEvents.MODULE_REGISTER
PlatformEvents.MODULE_LOAD_START
PlatformEvents.MODULE_LOAD_SUCCESS
PlatformEvents.MODULE_LOAD_ERROR
PlatformEvents.MODULE_MOUNT
PlatformEvents.MODULE_UNMOUNT

// 路由事件
PlatformEvents.ROUTE_CHANGE
PlatformEvents.ROUTE_BEFORE_CHANGE

// 用户事件
PlatformEvents.USER_LOGIN
PlatformEvents.USER_LOGOUT

// UI事件
PlatformEvents.UI_SHOW_MODAL
PlatformEvents.UI_HIDE_MODAL
PlatformEvents.UI_SHOW_TOAST
```

### 自定义事件

```typescript
// 发送自定义事件
eventBus.emit('my-module:data-loaded', {
  data: [...],
  timestamp: Date.now(),
})

// 监听自定义事件
eventBus.on('my-module:data-loaded', (event) => {
  console.log('Data loaded:', event.payload.data)
})
```

---

## 🎨 最佳实践

### 1. 模块解耦

- ✅ 模块间通过事件总线通信，不直接依赖
- ✅ 使用平台API访问共享能力
- ✅ 避免直接访问其他模块的内部状态

### 2. 配置优先

- ✅ 所有模块通过配置文件注册
- ✅ 使用配置控制功能开关
- ✅ 避免硬编码配置

### 3. 状态管理

- ✅ 使用命名空间隔离模块状态
- ✅ 只持久化必要的状态
- ✅ 使用状态机管理复杂状态流转

### 4. 错误处理

- ✅ 模块错误不影响其他模块
- ✅ 提供错误恢复机制
- ✅ 记录错误日志

### 5. 性能优化

- ✅ 使用懒加载减少初始加载时间
- ✅ 预加载关键模块
- ✅ 共享依赖避免重复加载

---

## 🐛 调试

### 查看状态机

访问 [XState Visualizer](https://stately.ai/viz) 可视化状态机。

### 查看事件日志

```typescript
import { globalEventBus } from '@platform/core'

// 获取事件日志
const logs = globalEventBus.getEventLog()
console.log(logs)

// 监听所有事件
globalEventBus.onAll((event) => {
  console.log('Event:', event)
})
```

### 查看模块状态

```typescript
import { getPlatformInstance } from '@platform/core'

const platform = getPlatformInstance()
const modules = platform.moduleRegistry.getAll()

console.log('Modules:', modules)
```

---

## 📚 参考资料

- [XState 文档](https://xstate.js.org/)
- [Module Federation 文档](https://module-federation.github.io/)
- [Vite 文档](https://vitejs.dev/)
- [React Router 文档](https://reactrouter.com/)

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

## 📄 许可证

MIT
