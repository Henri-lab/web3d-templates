# 迁移指南 - 从旧架构到中台架构

## 📋 概述

本指南基于最初的 **XState + Module Federation 微前端方案** 编写。
当前示例项目已经提供了一个更稳健的实现：**配置驱动 + Zustand + 本地模块**。
如果你只打算使用当前仓库的内置中台（不拆分为独立部署的远程模块），可以将本指南视为历史/进阶参考。当前实际运行架构以 `src/platform/core/platform.ts` 和 `src/platform/config/platform.config.ts` 为准。

---

## 🎯 迁移目标

### 旧架构

```
单体应用
├── 所有页面在一个项目中
├── 直接使用 Zustand 管理状态
├── 组件间直接依赖
└── 无法独立部署
```

### 新架构

```
中台系统
├── 主应用（Shell）
│   ├── 平台核心
│   ├── 共享组件
│   └── 配置系统
└── 独立模块
    ├── 故事模块（可独立部署）
    ├── 实验室模块（可独立部署）
    └── 地球模块（可独立部署）
```

---

## 📝 迁移步骤

### 第一阶段：准备工作

#### 1. 备份现有代码

```bash
git checkout -b backup/before-migration
git commit -am "Backup before migration"
git checkout main
git checkout -b feature/platform-migration
```

#### 2. 安装新依赖

```bash
npm install xstate @xstate/react @originjs/vite-plugin-federation eventemitter3
```

#### 3. 更新 Vite 配置

已完成 ✅ - 参考 `vite.config.ts`

---

### 第二阶段：迁移状态管理

#### 旧代码（Zustand）

```typescript
// src/stores/appStore.ts
import { create } from 'zustand'

export const useAppStore = create((set) => ({
  state: 'loading',
  transition: (event) => {
    // 状态转换逻辑
  },
}))
```

#### 新代码（XState + 平台API）

```typescript
// 1. 使用平台状态机（已创建）
import { useMachine } from '@xstate/react'
import { platformMachine } from '@platform/core'

function MyComponent() {
  const [state, send] = useMachine(platformMachine)

  // 发送事件
  send({ type: 'INIT_COMPLETE' })

  // 检查状态
  const isReady = state.matches('ready')
}

// 2. 或使用平台状态管理
import { usePlatformState } from '@platform/core'

function MyComponent() {
  const [state, setState] = usePlatformState('myModule', {
    count: 0,
  })

  setState({ count: state.count + 1 })
}
```

#### 迁移清单

- [ ] 将 `appStore.ts` 的状态转换逻辑迁移到 `stateMachine.ts`
- [ ] 将 `storyStore.ts` 改为使用 `usePlatformState('story', ...)`
- [ ] 将 `sceneStore.ts` 改为使用 `usePlatformState('scene', ...)`
- [ ] 将 `progressStore.ts` 改为使用 `usePlatformState('progress', ...)`

---

### 第三阶段：迁移页面组件

#### 旧代码

```typescript
// src/pages/StorySelectionPage.tsx
import { useAppStore } from '@stores/appStore'
import { useStoryStore } from '@stores/storyStore'

export default function StorySelectionPage() {
  const { transition } = useAppStore()
  const { stories } = useStoryStore()

  const handleSelectStory = (storyId) => {
    transition('SELECT_STORY')
    // ...
  }

  return <div>...</div>
}
```

#### 新代码（作为独立模块）

```typescript
// modules/story/src/pages/StorySelectionPage.tsx
import { usePlatformAPI, usePlatformState } from 'shell/PlatformAPI'

export default function StorySelectionPage() {
  const api = usePlatformAPI()
  const [stories] = usePlatformState('story', { stories: [] })

  const handleSelectStory = (storyId) => {
    // 通过事件通知平台
    api.eventBus.emit('story:selected', { storyId })

    // 路由跳转
    api.router.push(`/story/${storyId}`)
  }

  return <div>...</div>
}
```

#### 迁移清单

- [ ] 将 `WelcomePage.tsx` 保留在主应用（本地模块）
- [ ] 将 `StorySelectionPage.tsx` 移到 `modules/story/`
- [ ] 将 `StoryPlayerPage.tsx` 移到 `modules/story/`
- [ ] 将 `ComponentLabPage.tsx` 移到 `modules/lab/`
- [ ] 将 `EarthLabPage.tsx` 移到 `modules/earth/`

---

### 第四阶段：创建独立模块

#### 1. 创建故事模块

```bash
mkdir -p modules/story
cd modules/story
npm init -y
npm install react react-dom react-router-dom
npm install -D vite @vitejs/plugin-react @originjs/vite-plugin-federation typescript
```

#### 2. 配置 `vite.config.ts`

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'story',
      filename: 'remoteEntry.js',
      exposes: {
        './StorySelectionPage': './src/pages/StorySelectionPage.tsx',
        './StoryPlayerPage': './src/pages/StoryPlayerPage.tsx',
      },
      remotes: {
        shell: 'http://localhost:5173/remoteEntry.js',
      },
      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true },
        'react-router-dom': { singleton: true },
        three: { singleton: true },
        '@react-three/fiber': { singleton: true },
        '@react-three/drei': { singleton: true },
      },
    }),
  ],
  server: {
    port: 5174,
    cors: true,
  },
  build: {
    target: 'esnext',
  },
})
```

#### 3. 移动页面文件

```bash
# 从主应用移动到模块
cp ../../src/pages/StorySelectionPage.tsx ./src/pages/
cp ../../src/pages/StoryPlayerPage.tsx ./src/pages/
```

#### 4. 更新导入路径

```typescript
// 旧导入
import { useAppStore } from '@stores/appStore'
import { Button } from '@components/ui/Button'

// 新导入
import { usePlatformAPI } from 'shell/PlatformAPI'
import { Button } from 'shell/SharedComponents'
```

#### 5. 在主应用注册模块

```typescript
// src/platform/config/platform.config.ts
export const moduleConfigs: ModuleConfig[] = [
  {
    id: 'story',
    name: '历史故事',
    version: '1.0.0',
    type: 'remote',
    entry: 'http://localhost:5174/remoteEntry.js',
    routes: [
      {
        path: '/stories',
        component: 'StorySelectionPage',
      },
      {
        path: '/story/:storyId',
        component: 'StoryPlayerPage',
      },
    ],
    // ... 其他配置
  },
]
```

#### 迁移清单

- [ ] 创建 `modules/story/` 目录和配置
- [ ] 创建 `modules/lab/` 目录和配置
- [ ] 创建 `modules/earth/` 目录和配置
- [ ] 移动相关页面文件
- [ ] 更新所有导入路径
- [ ] 在主应用注册所有模块

---

### 第五阶段：迁移组件间通信

#### 旧代码（直接调用）

```typescript
// ComponentA.tsx
import { useStoryStore } from '@stores/storyStore'

function ComponentA() {
  const { playStory } = useStoryStore()

  const handleClick = () => {
    playStory('qin-unification')
  }
}

// ComponentB.tsx
import { useStoryStore } from '@stores/storyStore'

function ComponentB() {
  const { currentStory } = useStoryStore()

  return <div>{currentStory?.name}</div>
}
```

#### 新代码（事件总线）

```typescript
// ComponentA.tsx（发送事件）
import { useEventBus } from '@platform/core'

function ComponentA() {
  const eventBus = useEventBus()

  const handleClick = () => {
    eventBus.emit('story:play', { storyId: 'qin-unification' })
  }
}

// ComponentB.tsx（监听事件）
import { useEventListener, usePlatformState } from '@platform/core'

function ComponentB() {
  const [story, setStory] = usePlatformState('story', null)

  useEventListener('story:play', (event) => {
    // 加载故事
    loadStory(event.payload.storyId).then(setStory)
  })

  return <div>{story?.name}</div>
}
```

#### 迁移清单

- [ ] 识别所有组件间的直接依赖
- [ ] 将直接调用改为事件发送
- [ ] 将状态订阅改为事件监听
- [ ] 定义清晰的事件命名规范

---

### 第六阶段：更新路由系统

#### 旧代码

```typescript
// src/App.tsx
import { Routes, Route } from 'react-router-dom'
import WelcomePage from './pages/WelcomePage'
import StorySelectionPage from './pages/StorySelectionPage'
import StoryPlayerPage from './pages/StoryPlayerPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<WelcomePage />} />
      <Route path="/stories" element={<StorySelectionPage />} />
      <Route path="/story/:storyId" element={<StoryPlayerPage />} />
    </Routes>
  )
}
```

#### 新代码（动态路由）

```typescript
// src/App.tsx
import { Routes, Route } from 'react-router-dom'
import { usePlatformAPI } from '@platform/core'
import { getAllRoutes } from '@platform/config/platform.config'

function App() {
  const api = usePlatformAPI()
  const routes = getAllRoutes()

  return (
    <Routes>
      {routes.map((route) => {
        const module = api.moduleManager.getModule(route.moduleId)
        const Component = module?.component

        return (
          <Route
            key={route.path}
            path={route.path}
            element={Component ? <Component /> : <div>Loading...</div>}
          />
        )
      })}
    </Routes>
  )
}
```

#### 迁移清单

- [ ] 将静态路由改为动态路由
- [ ] 从配置文件读取路由
- [ ] 实现路由懒加载
- [ ] 添加路由守卫（如需要）

---

### 第七阶段：测试和验证

#### 测试清单

- [ ] 主应用可以正常启动
- [ ] 所有模块可以独立启动
- [ ] 模块可以正常加载和卸载
- [ ] 事件通信正常工作
- [ ] 状态管理正常工作
- [ ] 路由跳转正常工作
- [ ] 共享依赖正常工作
- [ ] 构建打包正常

#### 测试命令

```bash
# 测试主应用
npm run dev

# 测试故事模块
cd modules/story
npm run dev

# 测试构建
npm run build
```

---

## 🔧 常见问题

### Q1: 模块加载失败

**问题**: `Failed to load remote module`

**解决方案**:

1. 确保子模块已启动
2. 检查端口是否正确
3. 检查 CORS 配置
4. 检查 `remoteEntry.js` 是否可访问

### Q2: 共享依赖版本冲突

**问题**: `Shared module is not available`

**解决方案**:

1. 确保主应用和子模块使用相同版本的依赖
2. 在 `vite.config.ts` 中配置 `singleton: true`
3. 使用 `requiredVersion` 指定版本范围

### Q3: 类型错误

**问题**: `Cannot find module 'shell/PlatformAPI'`

**解决方案**:

1. 添加类型声明文件

```typescript
// src/types/federation.d.ts
declare module 'shell/PlatformAPI' {
  export * from '@platform/core/platformAPI'
}

declare module 'shell/SharedComponents' {
  export * from '@components/index'
}
```

### Q4: 事件没有触发

**问题**: 发送事件后没有响应

**解决方案**:

1. 检查事件名称是否正确
2. 确保监听器已注册
3. 检查事件总线日志

```typescript
import { globalEventBus } from '@platform/core'

// 查看所有事件
globalEventBus.onAll((event) => {
  console.log('Event:', event)
})
```

---

## 📊 迁移进度追踪

### 主应用

- [x] 安装依赖
- [x] 配置 Vite Module Federation
- [x] 创建平台核心系统
- [x] 创建配置系统
- [ ] 更新 App.tsx
- [ ] 更新路由系统
- [ ] 测试主应用

### 故事模块

- [ ] 创建模块目录
- [ ] 配置 Vite
- [ ] 移动页面文件
- [ ] 更新导入路径
- [ ] 实现事件通信
- [ ] 测试模块

### 实验室模块

- [ ] 创建模块目录
- [ ] 配置 Vite
- [ ] 移动页面文件
- [ ] 更新导入路径
- [ ] 实现事件通信
- [ ] 测试模块

### 地球模块

- [ ] 创建模块目录
- [ ] 配置 Vite
- [ ] 移动页面文件
- [ ] 更新导入路径
- [ ] 实现事件通信
- [ ] 测试模块

---

## 🎉 迁移完成

完成所有步骤后，你将拥有：

✅ 配置驱动的中台系统
✅ 可独立部署的模块
✅ 解耦的模块通信
✅ 可视化的状态管理
✅ 完整的类型安全
✅ 灵活的扩展能力

---

## 📚 下一步

1. 阅读 [PLATFORM_ARCHITECTURE.md](./PLATFORM_ARCHITECTURE.md) 了解架构详情
2. 查看 [ExamplesPage.tsx](./src/platform/examples/ExamplesPage.tsx) 学习使用方法
3. 开始创建新模块
4. 优化性能和用户体验

---

## 🤝 需要帮助？

如果在迁移过程中遇到问题，请：

1. 查看文档和示例代码
2. 检查控制台错误信息
3. 查看事件总线日志
4. 提交 Issue

祝迁移顺利！🚀
