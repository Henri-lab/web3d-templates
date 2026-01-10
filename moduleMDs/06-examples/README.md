# 代码示例

> 完整的代码示例和最佳实践

## 📖 概述

本目录包含了中台平台的完整代码示例，涵盖了模块开发、事件通信、状态管理等各个方面。

## 📚 示例分类

### 基础示例

1. [基础模块示例](./basic-module/) - 创建一个简单的模块
2. [事件通信示例](./event-communication/) - 模块间事件通信
3. [状态管理示例](./state-management/) - 使用 Zustand 管理状态
4. [路由示例](./routing/) - 路由配置和导航

### 进阶示例

1. [高级模式示例](./advanced-patterns/) - 高级开发模式
2. [Three.js 集成](./threejs-integration/) - Three.js 组件开发
3. [性能优化](./performance-optimization/) - 性能优化技巧
4. [测试示例](./testing/) - 单元测试和集成测试

## 🚀 快速开始

### 1. 基础模块示例

创建一个最简单的模块。

**文件**: `basic-module/MyModule.tsx`

```typescript
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
      <p className="text-neutral-400">这是一个基础模块示例</p>
    </div>
  )
}
```

**配置**: `platform.config.ts`

```typescript
{
  id: 'myModule',
  name: '我的模块',
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
}
```

### 2. 事件通信示例

模块间通过事件通信。

**发送方**: `ModuleA.tsx`

```typescript
import React from 'react'
import { globalEventBus } from '@platform/core'

export default function ModuleA() {
  const handleSendMessage = () => {
    globalEventBus.emit('moduleA:message', {
      text: 'Hello from Module A',
      timestamp: Date.now(),
    })
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Module A</h1>
      <button
        onClick={handleSendMessage}
        className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-600"
      >
        发送消息
      </button>
    </div>
  )
}
```

**接收方**: `ModuleB.tsx`

```typescript
import React, { useEffect, useState } from 'react'
import { globalEventBus } from '@platform/core'

export default function ModuleB() {
  const [messages, setMessages] = useState<string[]>([])

  useEffect(() => {
    // 监听事件
    const unsubscribe = globalEventBus.on('moduleA:message', (event) => {
      const { text, timestamp } = event.payload
      setMessages((prev) => [...prev, `${text} (${new Date(timestamp).toLocaleTimeString()})`])
    })

    // 清理
    return unsubscribe
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Module B</h1>
      <div className="space-y-2">
        {messages.map((msg, index) => (
          <div key={index} className="p-2 bg-neutral-800 rounded">
            {msg}
          </div>
        ))}
      </div>
    </div>
  )
}
```

### 3. 状态管理示例

使用 Zustand 管理模块状态。

**创建 Store**: `myModuleStore.ts`

```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface MyModuleState {
  // 状态
  count: number
  items: string[]
  loading: boolean

  // 动作
  increment: () => void
  decrement: () => void
  addItem: (item: string) => void
  removeItem: (index: number) => void
  setLoading: (loading: boolean) => void
  reset: () => void
}

export const useMyModuleStore = create<MyModuleState>()(
  persist(
    (set) => ({
      // 初始状态
      count: 0,
      items: [],
      loading: false,

      // 动作
      increment: () => set((state) => ({ count: state.count + 1 })),
      decrement: () => set((state) => ({ count: state.count - 1 })),
      addItem: (item) => set((state) => ({ items: [...state.items, item] })),
      removeItem: (index) =>
        set((state) => ({
          items: state.items.filter((_, i) => i !== index),
        })),
      setLoading: (loading) => set({ loading }),
      reset: () => set({ count: 0, items: [], loading: false }),
    }),
    {
      name: 'my-module-storage',
      partialize: (state) => ({ count: state.count, items: state.items }),
    }
  )
)
```

**使用 Store**: `MyComponent.tsx`

```typescript
import React from 'react'
import { useMyModuleStore } from './myModuleStore'

export default function MyComponent() {
  const count = useMyModuleStore((state) => state.count)
  const items = useMyModuleStore((state) => state.items)
  const increment = useMyModuleStore((state) => state.increment)
  const decrement = useMyModuleStore((state) => state.decrement)
  const addItem = useMyModuleStore((state) => state.addItem)

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">状态管理示例</h1>

      {/* 计数器 */}
      <div className="mb-4">
        <p className="text-lg mb-2">Count: {count}</p>
        <button onClick={increment} className="px-4 py-2 bg-blue-500 rounded mr-2">
          +1
        </button>
        <button onClick={decrement} className="px-4 py-2 bg-red-500 rounded">
          -1
        </button>
      </div>

      {/* 列表 */}
      <div>
        <p className="text-lg mb-2">Items: {items.length}</p>
        <button
          onClick={() => addItem(`Item ${items.length + 1}`)}
          className="px-4 py-2 bg-green-500 rounded mb-2"
        >
          添加项目
        </button>
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={index} className="p-2 bg-neutral-800 rounded">
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

### 4. Three.js 集成示例

创建一个 Three.js 组件。

**基础组件**: `RotatingCube.tsx`

```typescript
import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Box } from '@react-three/drei'
import * as THREE from 'three'

export function RotatingCube() {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta
      meshRef.current.rotation.y += delta * 0.5
    }
  })

  return (
    <Box ref={meshRef} args={[1, 1, 1]}>
      <meshStandardMaterial color="orange" />
    </Box>
  )
}
```

**场景组件**: `ThreeScene.tsx`

```typescript
import React from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import { RotatingCube } from './RotatingCube'

export default function ThreeScene() {
  return (
    <div className="w-full h-screen">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        {/* 光照 */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />

        {/* 场景内容 */}
        <RotatingCube />

        {/* 环境 */}
        <Environment preset="sunset" />

        {/* 控制器 */}
        <OrbitControls />
      </Canvas>
    </div>
  )
}
```

### 5. 自定义 Hook 示例

创建可复用的 Hook。

**事件监听 Hook**: `useEventListener.ts`

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
```

**使用示例**:

```typescript
import React from 'react'
import { useEventListener } from './useEventListener'

export default function MyComponent() {
  useEventListener('story:play', (event) => {
    console.log('Story playing:', event.payload.storyId)
  })

  return <div>Listening to story events...</div>
}
```

### 6. 表单处理示例

处理表单输入和验证。

```typescript
import React, { useState } from 'react'
import { globalEventBus } from '@platform/core'

interface FormData {
  name: string
  email: string
  message: string
}

export default function ContactForm() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    message: '',
  })
  const [errors, setErrors] = useState<Partial<FormData>>({})

  const validate = (): boolean => {
    const newErrors: Partial<FormData> = {}

    if (!formData.name.trim()) {
      newErrors.name = '请输入姓名'
    }

    if (!formData.email.trim()) {
      newErrors.email = '请输入邮箱'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '邮箱格式不正确'
    }

    if (!formData.message.trim()) {
      newErrors.message = '请输入消息'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validate()) {
      // 发送事件
      globalEventBus.emit('form:submit', formData)

      // 重置表单
      setFormData({ name: '', email: '', message: '' })
      setErrors({})
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // 清除错误
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-8">
      <div className="mb-4">
        <label className="block mb-2">姓名</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="w-full px-4 py-2 bg-neutral-800 rounded"
        />
        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
      </div>

      <div className="mb-4">
        <label className="block mb-2">邮箱</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full px-4 py-2 bg-neutral-800 rounded"
        />
        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
      </div>

      <div className="mb-4">
        <label className="block mb-2">消息</label>
        <textarea
          name="message"
          value={formData.message}
          onChange={handleChange}
          rows={4}
          className="w-full px-4 py-2 bg-neutral-800 rounded"
        />
        {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
      </div>

      <button
        type="submit"
        className="w-full px-4 py-2 bg-blue-500 rounded hover:bg-blue-600"
      >
        提交
      </button>
    </form>
  )
}
```

## 📚 更多示例

查看各个子目录获取更多详细示例：

1. [基础模块示例](./basic-module/)
2. [事件通信示例](./event-communication/)
3. [状态管理示例](./state-management/)
4. [高级模式示例](./advanced-patterns/)

## 🎯 运行示例

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

### 4. 访问示例

打开浏览器访问对应的路由查看示例效果。

## 📝 贡献示例

欢迎贡献新的示例！请遵循以下规范：

1. 代码清晰易懂
2. 添加必要的注释
3. 提供完整的类型定义
4. 包含使用说明

---

**最后更新**: 2026-01-10
