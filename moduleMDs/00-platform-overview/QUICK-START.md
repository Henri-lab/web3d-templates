# 快速开始

> 5分钟快速上手 History3D Learning Platform

## 📋 前置要求

### 环境要求

- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0 (或 yarn/pnpm)
- **浏览器**: 支持 ES2020+ 的现代浏览器

### 推荐工具

- **IDE**: VSCode + 以下插件
  - ESLint
  - Prettier
  - TypeScript Vue Plugin (Volar)
- **浏览器**: Chrome/Edge (支持 React DevTools)

## 🚀 快速启动

### 1. 克隆项目

```bash
git clone <repository-url>
cd web3d-templates
```

### 2. 安装依赖

```bash
npm install
```

### 3. 启动开发服务器

```bash
npm run dev
```

应用将在 `http://localhost:5173` 启动。

### 4. 访问应用

打开浏览器访问：
- 首页: http://localhost:5173/
- 平台管理: http://localhost:5173/platform
- API 演示: http://localhost:5173/platform-examples

## 📁 项目结构

```
web3d-templates/
├── src/
│   ├── platform/              # 平台核心
│   │   ├── config/            # 配置文件
│   │   ├── core/              # 核心模块
│   │   └── PlatformProvider.tsx
│   │
│   ├── pages/                 # 业务页面
│   ├── components/            # 共享组件
│   ├── stores/                # 状态管理
│   ├── App.tsx                # 应用入口
│   └── main.tsx               # 主入口
│
├── moduleMDs/                 # 文档目录
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## 🎯 核心概念

### 1. 平台初始化

平台在应用启动时自动初始化：

```typescript
// src/main.tsx
import { PlatformProvider } from '@platform/PlatformProvider'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <PlatformProvider>
    <App />
  </PlatformProvider>
)
```

### 2. 模块配置

所有模块在配置文件中注册：

```typescript
// src/platform/config/platform.config.ts
export const moduleConfigs: ModuleConfig[] = [
  {
    id: 'story',
    name: '历史故事',
    type: 'local',
    routes: [
      { path: '/stories', component: 'StorySelectionPage' },
    ],
    menu: {
      title: '历史故事',
      icon: 'book',
      order: 1,
      visible: true,
    },
  },
]
```

### 3. 事件通信

模块间通过事件总线通信：

```typescript
import { globalEventBus, PlatformEvents } from '@platform/core'

// 发送事件
globalEventBus.emit('story:play', { storyId: 'qin-unification' })

// 监听事件
globalEventBus.on('story:play', (event) => {
  console.log('Playing story:', event.payload.storyId)
})
```

### 4. 状态管理

使用 Zustand 管理状态：

```typescript
import { usePlatformStore } from '@platform/core'

function MyComponent() {
  const status = usePlatformStore((state) => state.status)
  const setReady = usePlatformStore((state) => state.setReady)

  return <div>Status: {status}</div>
}
```

## 📝 常用命令

### 开发

```bash
# 启动开发服务器
npm run dev

# 启动开发服务器（指定端口）
npm run dev -- --port 3000
```

### 构建

```bash
# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

### 代码质量

```bash
# 运行 ESLint
npm run lint

# 格式化代码
npm run format

# 检查格式
npm run format:check
```

### 测试

```bash
# 运行测试
npm run test

# 运行测试（UI 模式）
npm run test:ui
```

## 🎨 开发第一个模块

### 1. 创建页面组件

```typescript
// src/pages/MyModulePage.tsx
import React from 'react'
import { globalEventBus } from '@platform/core'

export default function MyModulePage() {
  React.useEffect(() => {
    globalEventBus.emit('module:mount', { moduleId: 'myModule' })
  }, [])

  return (
    <div className="min-h-screen bg-neutral-900 text-white p-8">
      <h1 className="text-4xl font-bold mb-4">我的模块</h1>
      <p>这是一个新模块的页面</p>
    </div>
  )
}
```

### 2. 注册模块

```typescript
// src/platform/config/platform.config.ts
export const moduleConfigs: ModuleConfig[] = [
  // ... 现有模块

  // 新模块
  {
    id: 'myModule',
    name: '我的模块',
    description: '这是一个新模块',
    version: '1.0.0',
    type: 'local',

    routes: [
      {
        path: '/my-module',
        component: 'MyModulePage',
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
    state: { namespace: 'myModule', persist: false },
  },
]
```

### 3. 添加路由

```typescript
// src/App.tsx
import MyModulePage from '@/pages/MyModulePage'

function App() {
  return (
    <Routes>
      {/* 现有路由 */}
      <Route path="/" element={<WelcomePage />} />

      {/* 新模块路由 */}
      <Route path="/my-module" element={<MyModulePage />} />
    </Routes>
  )
}
```

### 4. 访问模块

打开浏览器访问 `http://localhost:5173/my-module`

## 🔍 调试技巧

### 1. 查看平台状态

```typescript
import { usePlatformStore, getSnapshot } from '@platform/core'

// 在组件中
const status = usePlatformStore((state) => state.status)
console.log('Platform status:', status)

// 在非组件中
const snapshot = getSnapshot()
console.log('Platform snapshot:', snapshot)
```

### 2. 查看事件日志

```typescript
import { globalEventBus } from '@platform/core'

// 获取事件日志
const logs = globalEventBus.getEventLog()
console.log('Event logs:', logs)

// 监听所有事件
globalEventBus.onAll((event) => {
  console.log(`[Event] ${event.type}`, event.payload)
})
```

### 3. 使用 React DevTools

安装 React DevTools 浏览器扩展，可以查看：
- 组件树
- Props 和 State
- Hooks 状态
- 性能分析

### 4. 使用 Zustand DevTools

```typescript
import { devtools } from 'zustand/middleware'

export const usePlatformStore = create(
  devtools<PlatformState>(
    (set) => ({
      // ... 状态和动作
    }),
    { name: 'PlatformStore' }
  )
)
```

## 📚 下一步

### 学习核心概念

1. [平台架构](./ARCHITECTURE.md) - 了解整体架构设计
2. [平台初始化](../01-platform-core/platform-initialization.md) - 深入了解启动流程
3. [状态管理](../01-platform-core/state-management.md) - 掌握 Zustand 使用
4. [事件总线](../01-platform-core/event-bus.md) - 学习模块间通信

### 开发新模块

1. [模块开发指南](../02-module-development/README.md) - 完整的开发指南
2. [模块结构规范](../02-module-development/module-structure.md) - 代码组织规范
3. [模块生命周期](../02-module-development/module-lifecycle.md) - 生命周期钩子
4. [最佳实践](../02-module-development/best-practices.md) - 开发建议

### 查看示例

1. [平台管理页](http://localhost:5173/platform) - 查看平台状态
2. [API 演示页](http://localhost:5173/platform-examples) - 查看 API 使用示例
3. [示例代码](../06-examples/README.md) - 查看完整示例

## ❓ 常见问题

### Q: 如何添加新模块？

A: 只需在 `platform.config.ts` 中添加模块配置，然后在 `App.tsx` 中添加路由即可。

### Q: 如何在模块间通信？

A: 使用事件总线：`globalEventBus.emit()` 发送事件，`globalEventBus.on()` 监听事件。

### Q: 如何管理模块状态？

A: 可以使用平台提供的 Zustand store，或为模块创建独立的 store。

### Q: 如何调试事件？

A: 使用 `globalEventBus.onAll()` 监听所有事件，或查看 `globalEventBus.getEventLog()`。

### Q: 如何部署到生产环境？

A: 运行 `npm run build` 构建生产版本，然后部署 `dist` 目录。

## 🆘 获取帮助

### 文档

- [完整文档](../README.md)
- [API 参考](../03-api-reference/README.md)
- [故障排查](../05-deployment/troubleshooting.md)

### 社区

- GitHub Issues
- 团队内部文档
- 技术分享会

---

**最后更新**: 2026-01-10
