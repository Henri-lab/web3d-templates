# 模块开发模板

> 最后更新: 2026-01-19
> 作者: AI Assistant
> 状态: 已发布

---

## 📋 概述

这是一个标准的模块开发模板，帮助你快速创建符合项目规范的新模块。

---

## 🎯 模块基本信息

### 模块元数据

```typescript
// 文件: src/modules/your-module/module.config.ts

import { ModuleConfig } from '@/platform/types'

export const moduleConfig: ModuleConfig = {
  // 模块唯一标识符（必需）
  id: 'your-module',

  // 模块显示名称（必需）
  name: '你的模块名称',

  // 模块描述（必需）
  description: '简短描述模块的功能和用途',

  // 模块版本（必需）
  version: '1.0.0',

  // 模块图标（可选）
  icon: '🎨',

  // 模块路由前缀（必需）
  path: '/your-module',

  // 是否启用（可选，默认true）
  enabled: true,

  // 模块作者（可选）
  author: 'Your Name',

  // 模块标签（可选）
  tags: ['category', 'feature'],

  // 依赖的其他模块（可选）
  dependencies: [],

  // 模块权限要求（可选）
  permissions: [],
}
```

---

## 📂 目录结构

```
src/modules/your-module/
├── module.config.ts          # 模块配置
├── index.ts                  # 模块入口
│
├── pages/                    # 页面组件
│   ├── index.ts
│   ├── HomePage.tsx
│   └── DetailPage.tsx
│
├── components/               # 模块专用组件
│   ├── index.ts
│   ├── Header.tsx
│   └── Card.tsx
│
├── hooks/                    # 自定义Hooks
│   ├── index.ts
│   ├── useModuleData.ts
│   └── useModuleState.ts
│
├── stores/                   # 状态管理
│   ├── index.ts
│   └── moduleStore.ts
│
├── services/                 # 业务逻辑/API
│   ├── index.ts
│   └── api.ts
│
├── types/                    # TypeScript类型
│   └── index.ts
│
├── utils/                    # 工具函数
│   └── index.ts
│
├── constants/                # 常量定义
│   └── index.ts
│
├── styles/                   # 样式文件（如需要）
│   └── module.css
│
└── assets/                   # 静态资源
    ├── images/
    └── icons/
```

---

## 🔧 核心文件模板

### 1. 模块入口 (index.ts)

```typescript
// 文件: src/modules/your-module/index.ts

import { lazy } from 'react'
import { moduleConfig } from './module.config'
import type { Module } from '@/platform/types'

// 懒加载页面组件
const HomePage = lazy(() => import('./pages/HomePage'))
const DetailPage = lazy(() => import('./pages/DetailPage'))

// 模块路由配置
const routes = [
  {
    path: '/',
    element: HomePage,
    meta: {
      title: '首页',
      requireAuth: false,
    },
  },
  {
    path: '/detail/:id',
    element: DetailPage,
    meta: {
      title: '详情页',
      requireAuth: false,
    },
  },
]

// 模块生命周期钩子
const module: Module = {
  ...moduleConfig,
  routes,

  // 模块初始化
  async onInit() {
    console.log(`[${moduleConfig.id}] Module initializing...`)
    // 初始化逻辑：加载配置、注册服务等
  },

  // 模块挂载
  async onMount() {
    console.log(`[${moduleConfig.id}] Module mounted`)
    // 挂载逻辑：订阅事件、启动服务等
  },

  // 模块卸载
  async onUnmount() {
    console.log(`[${moduleConfig.id}] Module unmounting...`)
    // 清理逻辑：取消订阅、清理资源等
  },

  // 模块销毁
  async onDestroy() {
    console.log(`[${moduleConfig.id}] Module destroyed`)
    // 销毁逻辑：释放内存、关闭连接等
  },
}

export default module
```

---

### 2. 页面组件模板 (HomePage.tsx)

```typescript
// 文件: src/modules/your-module/pages/HomePage.tsx

import { useEffect } from 'react'
import { useModuleStore } from '../stores'
import { useEventBus } from '@/platform/hooks'

export default function HomePage() {
  const { data, loading, fetchData } = useModuleStore()
  const eventBus = useEventBus()

  useEffect(() => {
    // 组件挂载时获取数据
    fetchData()

    // 监听平台事件
    const unsubscribe = eventBus.on('platform:theme-changed', (theme) => {
      console.log('Theme changed:', theme)
    })

    // 清理
    return () => {
      unsubscribe()
    }
  }, [])

  // 发送模块事件
  const handleAction = () => {
    eventBus.emit('your-module:action-triggered', {
      timestamp: Date.now(),
    })
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">
        模块首页
      </h1>

      <button
        onClick={handleAction}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        触发事件
      </button>

      <div className="mt-4">
        {/* 你的内容 */}
      </div>
    </div>
  )
}
```

---

### 3. 状态管理模板 (moduleStore.ts)

```typescript
// 文件: src/modules/your-module/stores/moduleStore.ts

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface ModuleState {
  // 状态
  data: any[]
  loading: boolean
  error: string | null

  // 操作
  fetchData: () => Promise<void>
  updateData: (data: any) => void
  reset: () => void
}

const initialState = {
  data: [],
  loading: false,
  error: null,
}

export const useModuleStore = create<ModuleState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // 获取数据
      fetchData: async () => {
        set({ loading: true, error: null })

        try {
          // 模拟API调用
          const response = await fetch('/api/your-module/data')
          const data = await response.json()

          set({ data, loading: false })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Unknown error',
            loading: false
          })
        }
      },

      // 更新数据
      updateData: (newData) => {
        set((state) => ({
          data: [...state.data, newData]
        }))
      },

      // 重置状态
      reset: () => {
        set(initialState)
      },
    }),
    { name: 'your-module-store' }
  )
)
```

---

### 4. 自定义Hook模板 (useModuleData.ts)

```typescript
// 文件: src/modules/your-module/hooks/useModuleData.ts

import { useState, useEffect } from 'react'
import { useEventBus } from '@/platform/hooks'

export function useModuleData(id?: string) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const eventBus = useEventBus()

  useEffect(() => {
    if (!id) return

    const fetchData = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/your-module/${id}`)
        const result = await response.json()
        setData(result)

        // 发送数据加载完成事件
        eventBus.emit('your-module:data-loaded', { id, data: result })
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'))
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  return { data, loading, error }
}
```

---

### 5. API服务模板 (api.ts)

```typescript
// 文件: src/modules/your-module/services/api.ts

import type { ApiResponse, ModuleData } from '../types'

const BASE_URL = import.meta.env.VITE_API_URL || '/api'

class ModuleAPI {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = `${baseUrl}/your-module`
  }

  // GET请求
  async getData(id: string): Promise<ModuleData> {
    const response = await fetch(`${this.baseUrl}/data/${id}`)

    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.statusText}`)
    }

    return response.json()
  }

  // POST请求
  async createData(data: Partial<ModuleData>): Promise<ModuleData> {
    const response = await fetch(`${this.baseUrl}/data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`Failed to create data: ${response.statusText}`)
    }

    return response.json()
  }

  // PUT请求
  async updateData(id: string, data: Partial<ModuleData>): Promise<ModuleData> {
    const response = await fetch(`${this.baseUrl}/data/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`Failed to update data: ${response.statusText}`)
    }

    return response.json()
  }

  // DELETE请求
  async deleteData(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/data/${id}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      throw new Error(`Failed to delete data: ${response.statusText}`)
    }
  }
}

export const moduleAPI = new ModuleAPI(BASE_URL)
```

---

### 6. TypeScript类型定义 (types/index.ts)

```typescript
// 文件: src/modules/your-module/types/index.ts

// 模块数据类型
export interface ModuleData {
  id: string
  name: string
  description: string
  createdAt: Date
  updatedAt: Date
}

// API响应类型
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// 模块配置类型
export interface ModuleConfig {
  apiUrl: string
  timeout: number
  retryCount: number
}

// 模块事件类型
export interface ModuleEvents {
  'data-loaded': { id: string; data: ModuleData }
  'data-updated': { id: string; data: ModuleData }
  'action-triggered': { timestamp: number }
}

// 导出所有类型
export type * from './events'
export type * from './api'
```

---

## 🔔 事件系统集成

### 发送事件

```typescript
import { useEventBus } from '@/platform/hooks'

function MyComponent() {
  const eventBus = useEventBus()

  const handleClick = () => {
    // 发送模块事件
    eventBus.emit('your-module:button-clicked', {
      buttonId: 'submit',
      timestamp: Date.now(),
    })
  }

  return <button onClick={handleClick}>Click Me</button>
}
```

### 监听事件

```typescript
import { useEffect } from 'react'
import { useEventBus } from '@/platform/hooks'

function MyComponent() {
  const eventBus = useEventBus()

  useEffect(() => {
    // 监听平台事件
    const unsubscribe = eventBus.on('platform:theme-changed', (theme) => {
      console.log('Theme changed to:', theme)
    })

    // 监听其他模块事件
    const unsubscribe2 = eventBus.on('other-module:data-updated', (data) => {
      console.log('Other module data updated:', data)
    })

    // 清理订阅
    return () => {
      unsubscribe()
      unsubscribe2()
    }
  }, [])

  return <div>My Component</div>
}
```

---

## 🎨 样式规范

### Tailwind CSS（推荐）

```tsx
// 使用Tailwind工具类
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md">
  <h2 className="text-xl font-bold text-gray-800">标题</h2>
  <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
    按钮
  </button>
</div>
```

### CSS Modules（可选）

```tsx
// 文件: src/modules/your-module/styles/module.module.css
.container {
  padding: 1rem;
  background: white;
}

.title {
  font-size: 1.5rem;
  font-weight: bold;
}

// 使用
import styles from './styles/module.module.css'

<div className={styles.container}>
  <h2 className={styles.title}>标题</h2>
</div>
```

---

## 🧪 测试模板

### 单元测试

```typescript
// 文件: src/modules/your-module/__tests__/moduleStore.test.ts

import { renderHook, act } from '@testing-library/react'
import { useModuleStore } from '../stores/moduleStore'

describe('ModuleStore', () => {
  beforeEach(() => {
    // 重置状态
    const { result } = renderHook(() => useModuleStore())
    act(() => {
      result.current.reset()
    })
  })

  it('should fetch data successfully', async () => {
    const { result } = renderHook(() => useModuleStore())

    await act(async () => {
      await result.current.fetchData()
    })

    expect(result.current.loading).toBe(false)
    expect(result.current.data).toBeDefined()
    expect(result.current.error).toBeNull()
  })

  it('should update data', () => {
    const { result } = renderHook(() => useModuleStore())
    const newData = { id: '1', name: 'Test' }

    act(() => {
      result.current.updateData(newData)
    })

    expect(result.current.data).toContain(newData)
  })
})
```

### 组件测试

```typescript
// 文件: src/modules/your-module/__tests__/HomePage.test.tsx

import { render, screen, fireEvent } from '@testing-library/react'
import HomePage from '../pages/HomePage'

describe('HomePage', () => {
  it('should render correctly', () => {
    render(<HomePage />)

    expect(screen.getByText('模块首页')).toBeInTheDocument()
  })

  it('should handle button click', () => {
    render(<HomePage />)

    const button = screen.getByRole('button')
    fireEvent.click(button)

    // 验证事件触发或状态变化
  })
})
```

---

## 📝 文档模板

### 模块README

```markdown
# 你的模块名称

> 模块版本: 1.0.0
> 最后更新: 2026-01-19

## 概述

简短描述模块的功能和用途。

## 功能特性

- ✅ 功能1
- ✅ 功能2
- ✅ 功能3

## 快速开始

\`\`\`typescript
import YourModule from '@/modules/your-module'

// 使用示例
\`\`\`

## API文档

### 组件

#### ComponentName

**Props:**
- `prop1` (string): 描述
- `prop2` (number, optional): 描述

**示例:**
\`\`\`tsx
<ComponentName prop1="value" />
\`\`\`

### Hooks

#### useModuleData

**参数:**
- `id` (string): 数据ID

**返回:**
- `data`: 数据对象
- `loading`: 加载状态
- `error`: 错误信息

**示例:**
\`\`\`typescript
const { data, loading, error } = useModuleData('123')
\`\`\`

## 事件

### 发送的事件

- `your-module:data-loaded` - 数据加载完成
- `your-module:action-triggered` - 操作触发

### 监听的事件

- `platform:theme-changed` - 主题变更

## 配置

\`\`\`typescript
{
  apiUrl: '/api/your-module',
  timeout: 5000,
  retryCount: 3
}
\`\`\`

## 依赖

- 无外部依赖

## 许可证

MIT
```

---

## ✅ 检查清单

在提交模块之前，请确保：

### 代码质量
- [ ] 所有TypeScript类型定义完整
- [ ] 没有any类型（除非必要）
- [ ] 代码通过ESLint检查
- [ ] 代码格式化（Prettier）

### 功能完整性
- [ ] 模块配置正确
- [ ] 路由配置正确
- [ ] 生命周期钩子实现
- [ ] 事件发送/监听正确

### 文档
- [ ] README.md完整
- [ ] API文档清晰
- [ ] 示例代码可运行
- [ ] 注释充分

### 测试
- [ ] 单元测试覆盖核心逻辑
- [ ] 组件测试覆盖主要交互
- [ ] 所有测试通过

### 性能
- [ ] 使用懒加载
- [ ] 避免不必要的重渲染
- [ ] 资源优化（图片、字体等）

### 兼容性
- [ ] 与平台核心兼容
- [ ] 与其他模块无冲突
- [ ] 浏览器兼容性测试

---

## 🚀 部署步骤

### 1. 注册模块

```typescript
// 文件: src/platform/modules.ts

import yourModule from '@/modules/your-module'

export const modules = [
  // ... 其他模块
  yourModule,
]
```

### 2. 更新路由

模块路由会自动注册，无需手动配置。

### 3. 构建测试

```bash
npm run build
npm run preview
```

### 4. 提交代码

```bash
git add .
git commit -m "feat: add your-module"
git push
```

---

## 📚 相关资源

- [模块开发指南](./README.md)
- [最佳实践](./BEST_PRACTICES.md)
- [平台API文档](../03-api-reference/PLATFORM_API.md)
- [事件系统文档](../04-event-system/README.md)

---

## 💡 提示

### 命名规范
- 模块ID: kebab-case (`your-module`)
- 组件名: PascalCase (`HomePage`)
- 函数名: camelCase (`fetchData`)
- 常量名: UPPER_SNAKE_CASE (`API_URL`)

### 最佳实践
- 保持模块独立性，避免直接依赖其他模块
- 使用事件总线进行模块间通信
- 合理使用状态管理，避免过度设计
- 编写清晰的注释和文档
- 遵循项目的代码风格

### 常见问题
- **Q: 如何访问其他模块的数据？**
  - A: 通过事件总线通信，不要直接导入其他模块的store

- **Q: 如何处理模块间的路由跳转？**
  - A: 使用React Router的`useNavigate`钩子

- **Q: 如何共享组件？**
  - A: 将通用组件放在`src/components`目录

---

**模板版本**: 1.0.0
**最后更新**: 2026-01-19
**维护者**: Development Team
