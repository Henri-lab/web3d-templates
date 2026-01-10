# 模块开发指南

> 完整的模块开发指南，从零开始创建一个新模块

## 📖 概述

本指南将帮助你从零开始创建一个新模块，包括模块结构、配置、路由、状态管理、事件通信等所有方面。

## 🎯 模块开发流程

```
1. 规划模块
   ├─ 确定模块功能
   ├─ 设计模块结构
   └─ 定义模块接口
   ↓
2. 创建模块配置
   ├─ 定义模块信息
   ├─ 配置路由
   └─ 配置菜单
   ↓
3. 开发模块页面
   ├─ 创建页面组件
   ├─ 实现业务逻辑
   └─ 添加样式
   ↓
4. 集成平台能力
   ├─ 使用事件总线
   ├─ 使用状态管理
   └─ 使用平台 API
   ↓
5. 测试和调试
   ├─ 单元测试
   ├─ 集成测试
   └─ 调试优化
   ↓
6. 部署上线
   ├─ 构建生产版本
   ├─ 部署到服务器
   └─ 监控运行状态
```

## 📚 文档导航

### 核心文档

1. [模块结构规范](./module-structure.md) - 模块代码组织规范
2. [模块生命周期](./module-lifecycle.md) - 生命周期钩子详解
3. [模块通信](./module-communication.md) - 模块间通信机制
4. [模块路由](./module-routing.md) - 路由配置和管理
5. [模块状态](./module-state.md) - 状态管理方案
6. [最佳实践](./best-practices.md) - 开发建议和规范

## 🚀 快速开始

### 1. 创建模块配置

在 `src/platform/config/platform.config.ts` 中添加模块配置：

```typescript
export const moduleConfigs: ModuleConfig[] = [
  // ... 现有模块

  // 新模块
  {
    id: 'myModule',                    // 模块唯一标识
    name: '我的模块',                   // 模块名称
    description: '这是一个新模块',       // 模块描述
    version: '1.0.0',                  // 模块版本
    type: 'local',                     // 模块类型：local | remote | iframe

    // 路由配置
    routes: [
      {
        path: '/my-module',            // 路由路径
        component: 'MyModulePage',     // 组件名称
        meta: { title: '我的模块' },    // 路由元信息
      },
    ],

    // 菜单配置
    menu: {
      title: '我的模块',                // 菜单标题
      icon: 'star',                    // 菜单图标
      order: 10,                       // 菜单顺序
      visible: true,                   // 是否显示
    },

    // 模块能力
    capabilities: {
      provides: ['myModule.action'],   // 提供的能力
      requires: ['platform.eventBus'], // 依赖的能力
    },

    // 生命周期钩子
    lifecycle: {
      beforeLoad: async () => {
        console.log('Module before load')
      },
      onLoad: async () => {
        console.log('Module loaded')
      },
      onMount: async () => {
        console.log('Module mounted')
      },
      onUnmount: async () => {
        console.log('Module unmounted')
      },
    },

    // 模块配置
    config: {
      enableFeatureA: true,
      maxItems: 100,
    },

    // 状态配置
    state: {
      namespace: 'myModule',           // 状态命名空间
      persist: false,                  // 是否持久化
    },
  },
]
```

### 2. 创建页面组件

在 `src/pages/` 目录下创建页面组件：

```typescript
// src/pages/MyModulePage.tsx
import React, { useEffect } from 'react'
import { globalEventBus, PlatformEvents } from '@platform/core'

export default function MyModulePage() {
  useEffect(() => {
    // 发送模块挂载事件
    globalEventBus.emit(PlatformEvents.MODULE_MOUNT, {
      moduleId: 'myModule',
    })

    // 清理：发送模块卸载事件
    return () => {
      globalEventBus.emit(PlatformEvents.MODULE_UNMOUNT, {
        moduleId: 'myModule',
      })
    }
  }, [])

  return (
    <div className="min-h-screen bg-neutral-900 text-white p-8">
      <h1 className="text-4xl font-bold mb-4">我的模块</h1>
      <p className="text-neutral-400">这是一个新模块的页面</p>
    </div>
  )
}
```

### 3. 添加路由

在 `src/App.tsx` 中添加路由：

```typescript
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

启动开发服务器，访问 `http://localhost:5173/my-module`

## 🏗️ 模块结构

### 推荐的模块结构

```
src/
├── pages/
│   └── MyModulePage.tsx           # 模块主页面
│
├── components/
│   └── myModule/                  # 模块组件
│       ├── MyComponent.tsx
│       └── MyOtherComponent.tsx
│
├── stores/
│   └── myModuleStore.ts           # 模块状态
│
├── hooks/
│   └── useMyModule.ts             # 模块 Hooks
│
└── utils/
    └── myModuleUtils.ts           # 模块工具函数
```

### 模块组件示例

```typescript
// src/components/myModule/MyComponent.tsx
import React from 'react'
import { globalEventBus } from '@platform/core'

interface MyComponentProps {
  title: string
  onAction?: () => void
}

export function MyComponent({ title, onAction }: MyComponentProps) {
  const handleClick = () => {
    // 发送事件
    globalEventBus.emit('myModule:action', { title })

    // 调用回调
    onAction?.()
  }

  return (
    <div className="p-4 bg-neutral-800 rounded-lg">
      <h2 className="text-2xl font-bold mb-2">{title}</h2>
      <button
        onClick={handleClick}
        className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-600"
      >
        执行操作
      </button>
    </div>
  )
}
```

## 🔌 集成平台能力

### 1. 使用事件总线

```typescript
import { globalEventBus, PlatformEvents } from '@platform/core'

// 发送事件
globalEventBus.emit('myModule:action', { data: 'hello' })

// 监听事件
useEffect(() => {
  const unsubscribe = globalEventBus.on('myModule:action', (event) => {
    console.log('Action triggered:', event.payload)
  })

  return unsubscribe
}, [])
```

### 2. 使用状态管理

```typescript
import { create } from 'zustand'

interface MyModuleState {
  data: any[]
  loading: boolean
  setData: (data: any[]) => void
  setLoading: (loading: boolean) => void
}

export const useMyModuleStore = create<MyModuleState>((set) => ({
  data: [],
  loading: false,
  setData: (data) => set({ data }),
  setLoading: (loading) => set({ loading }),
}))

// 在组件中使用
function MyComponent() {
  const data = useMyModuleStore((state) => state.data)
  const setData = useMyModuleStore((state) => state.setData)

  return <div>Data: {data.length}</div>
}
```

### 3. 使用平台 API

```typescript
import { usePlatformAPI } from '@platform/core'

function MyComponent() {
  const api = usePlatformAPI()

  const handleAction = () => {
    // 使用事件总线
    api.eventBus.emit('myModule:action', { data: 'hello' })

    // 使用路由
    api.router.push('/other-page')

    // 使用模块管理
    api.moduleManager.loadModule('otherModule')
  }

  return <button onClick={handleAction}>执行操作</button>
}
```

## 🎨 样式开发

### 使用 Tailwind CSS

```typescript
export function MyComponent() {
  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-4">标题</h1>
        <p className="text-neutral-400">内容</p>
      </div>
    </div>
  )
}
```

### 使用 CSS Modules

```typescript
// MyComponent.module.css
.container {
  min-height: 100vh;
  background-color: #171717;
  color: white;
}

// MyComponent.tsx
import styles from './MyComponent.module.css'

export function MyComponent() {
  return <div className={styles.container}>内容</div>
}
```

## 🧪 测试

### 单元测试

```typescript
// MyComponent.test.tsx
import { render, screen } from '@testing-library/react'
import { MyComponent } from './MyComponent'

describe('MyComponent', () => {
  it('renders title', () => {
    render(<MyComponent title="Test" />)
    expect(screen.getByText('Test')).toBeInTheDocument()
  })

  it('calls onAction when button clicked', () => {
    const onAction = vi.fn()
    render(<MyComponent title="Test" onAction={onAction} />)

    screen.getByRole('button').click()
    expect(onAction).toHaveBeenCalled()
  })
})
```

### 集成测试

```typescript
// MyModulePage.test.tsx
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { PlatformProvider } from '@platform/PlatformProvider'
import MyModulePage from './MyModulePage'

describe('MyModulePage', () => {
  it('renders page', () => {
    render(
      <BrowserRouter>
        <PlatformProvider>
          <MyModulePage />
        </PlatformProvider>
      </BrowserRouter>
    )

    expect(screen.getByText('我的模块')).toBeInTheDocument()
  })
})
```

## 🐛 调试

### 1. 使用 console.log

```typescript
console.log('[MyModule] Component mounted')
console.log('[MyModule] Data:', data)
```

### 2. 使用 React DevTools

- 查看组件树
- 查看 Props 和 State
- 查看 Hooks 状态

### 3. 使用事件日志

```typescript
import { globalEventBus } from '@platform/core'

// 监听所有事件
globalEventBus.onAll((event) => {
  if (event.type.startsWith('myModule:')) {
    console.log('[MyModule Event]', event)
  }
})
```

## 📦 构建和部署

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

### 部署到服务器

```bash
# 将 dist 目录部署到服务器
scp -r dist/* user@server:/var/www/html/
```

## 📚 相关文档

- [模块结构规范](./module-structure.md)
- [模块生命周期](./module-lifecycle.md)
- [模块通信](./module-communication.md)
- [模块路由](./module-routing.md)
- [模块状态](./module-state.md)
- [最佳实践](./best-practices.md)

## 🎯 下一步

1. 阅读[模块结构规范](./module-structure.md)了解代码组织
2. 阅读[模块生命周期](./module-lifecycle.md)了解生命周期钩子
3. 阅读[最佳实践](./best-practices.md)了解开发建议
4. 查看[示例代码](../06-examples/README.md)学习实际案例

---

**最后更新**: 2026-01-10
