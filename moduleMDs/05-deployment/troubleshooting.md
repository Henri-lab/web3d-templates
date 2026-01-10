# 故障排查指南

> 常见问题和解决方案

## 📖 概述

本文档提供了中台平台开发和部署过程中常见问题的排查方法和解决方案。

## 🔍 问题分类

### 平台初始化问题

#### 1. 平台初始化失败

**症状**:
- 应用启动时卡在加载页面
- 控制台显示 "Platform initialization failed"

**可能原因**:
- 模块配置错误
- 依赖加载失败
- 网络问题

**解决方案**:

```typescript
// 1. 检查模块配置
import { moduleConfigs } from '@platform/config/platform.config'
console.log('Module configs:', moduleConfigs)

// 2. 检查平台状态
import { usePlatformStore } from '@platform/core'
const state = usePlatformStore.getState()
console.log('Platform state:', state)

// 3. 查看错误信息
if (state.error) {
  console.error('Platform error:', state.error)
}
```

#### 2. 模块注册失败

**症状**:
- 某个模块无法访问
- 控制台显示 "Module not found"

**可能原因**:
- 模块配置缺失
- 路由配置错误
- 组件导入失败

**解决方案**:

```typescript
// 1. 检查模块是否注册
import { getPlatformInstance } from '@platform/core'
const platform = getPlatformInstance()
console.log('Registered modules:', platform.modules.map(m => m.id))

// 2. 检查路由配置
import { getAllRoutes } from '@platform/config/platform.config'
console.log('All routes:', getAllRoutes())

// 3. 检查组件导入
// 确保组件文件存在且导出正确
```

### 事件系统问题

#### 1. 事件未触发

**症状**:
- 发送事件后没有响应
- 事件监听器未执行

**可能原因**:
- 事件名称拼写错误
- 监听器未正确注册
- 监听器被过早清理

**解决方案**:

```typescript
// 1. 检查事件名称
import { PlatformEvents } from '@platform/core'
console.log('Available events:', PlatformEvents)

// 2. 监听所有事件进行调试
import { globalEventBus } from '@platform/core'
globalEventBus.onAll((event) => {
  console.log('[Event]', event.type, event.payload)
})

// 3. 检查监听器数量
const count = globalEventBus.getListenerCount('your-event')
console.log('Listener count:', count)

// 4. 确保监听器正确清理
useEffect(() => {
  const unsubscribe = globalEventBus.on('event', handler)
  return unsubscribe // 重要：返回清理函数
}, [])
```

#### 2. 事件循环

**症状**:
- 浏览器卡死
- 控制台大量重复日志

**可能原因**:
- 事件 A 触发事件 B，事件 B 又触发事件 A

**解决方案**:

```typescript
// 使用标志位避免循环
let isProcessing = false

globalEventBus.on('event-a', () => {
  if (isProcessing) return
  isProcessing = true
  globalEventBus.emit('event-b')
  isProcessing = false
})
```

### 状态管理问题

#### 1. 状态未更新

**症状**:
- 调用 setState 后组件未重新渲染
- 状态值未改变

**可能原因**:
- 直接修改状态对象
- 选择器返回相同引用
- 状态更新被批处理

**解决方案**:

```typescript
// ❌ 错误：直接修改状态
set((state) => {
  state.items.push(newItem) // 不会触发更新
  return state
})

// ✅ 正确：返回新对象
set((state) => ({
  items: [...state.items, newItem]
}))

// 使用 shallow 比较
import { shallow } from 'zustand/shallow'
const { status, error } = usePlatformStore(
  (state) => ({ status: state.status, error: state.error }),
  shallow
)
```

#### 2. 状态持久化失败

**症状**:
- 刷新页面后状态丢失
- localStorage 中没有数据

**可能原因**:
- persist 中间件配置错误
- localStorage 被禁用
- 存储空间已满

**解决方案**:

```typescript
// 1. 检查 persist 配置
import { persist } from 'zustand/middleware'

export const useStore = create(
  persist(
    (set) => ({
      // 状态和动作
    }),
    {
      name: 'my-storage', // localStorage key
      partialize: (state) => ({ count: state.count }), // 只持久化部分状态
    }
  )
)

// 2. 检查 localStorage
console.log('Storage:', localStorage.getItem('my-storage'))

// 3. 清理 localStorage
localStorage.removeItem('my-storage')
```

### Three.js 问题

#### 1. 场景不渲染

**症状**:
- Canvas 显示空白
- 没有 3D 内容

**可能原因**:
- Canvas 尺寸为 0
- 相机位置错误
- 光照缺失

**解决方案**:

```typescript
// 1. 检查 Canvas 尺寸
<Canvas style={{ width: '100%', height: '100vh' }}>
  {/* 场景内容 */}
</Canvas>

// 2. 检查相机位置
<Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
  {/* 场景内容 */}
</Canvas>

// 3. 添加光照
<Canvas>
  <ambientLight intensity={0.5} />
  <directionalLight position={[10, 10, 5]} />
  {/* 场景内容 */}
</Canvas>
```

#### 2. 性能问题

**症状**:
- FPS 低
- 页面卡顿

**可能原因**:
- 几何体过于复杂
- 材质过于复杂
- 没有使用 InstancedMesh

**解决方案**:

```typescript
// 1. 降低几何体复杂度
<sphereGeometry args={[1, 16, 16]} /> // 减少分段数

// 2. 使用简单材质
<meshBasicMaterial /> // 代替 meshStandardMaterial

// 3. 使用 InstancedMesh
import { Instances, Instance } from '@react-three/drei'

<Instances limit={1000}>
  <sphereGeometry />
  <meshBasicMaterial />
  {data.map((item, i) => (
    <Instance key={i} position={item.position} />
  ))}
</Instances>

// 4. 使用 Stats 监控性能
import { Stats } from '@react-three/drei'
<Canvas>
  <Stats />
  {/* 场景内容 */}
</Canvas>
```

### 路由问题

#### 1. 路由 404

**症状**:
- 刷新页面时出现 404
- 直接访问路由时 404

**可能原因**:
- 服务器配置错误
- base 路径配置错误

**解决方案**:

```nginx
# Nginx 配置
location / {
    try_files $uri $uri/ /index.html;
}
```

```typescript
// vite.config.ts
export default defineConfig({
  base: '/', // 确保 base 路径正确
})
```

#### 2. 路由跳转失败

**症状**:
- 点击链接无反应
- 路由未改变

**可能原因**:
- 使用了 `<a>` 标签而非 `<Link>`
- 路由路径错误

**解决方案**:

```typescript
// ❌ 错误
<a href="/stories">故事</a>

// ✅ 正确
import { Link } from 'react-router-dom'
<Link to="/stories">故事</Link>

// 或使用 navigate
import { useNavigate } from 'react-router-dom'
const navigate = useNavigate()
navigate('/stories')
```

### 构建问题

#### 1. 构建失败

**症状**:
- `npm run build` 报错
- TypeScript 类型错误

**可能原因**:
- 类型定义缺失
- 导入路径错误
- 依赖版本冲突

**解决方案**:

```bash
# 1. 清理缓存
rm -rf node_modules
rm package-lock.json
npm install

# 2. 检查 TypeScript 错误
npx tsc --noEmit

# 3. 检查 ESLint 错误
npm run lint

# 4. 更新依赖
npm update
```

#### 2. 构建产物过大

**症状**:
- dist 目录过大
- 加载时间长

**可能原因**:
- 未进行代码分割
- 未压缩资源
- 包含了不必要的依赖

**解决方案**:

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'three-vendor': ['three', '@react-three/fiber'],
        },
      },
    },
  },
})

// 分析构建产物
npm run build -- --mode analyze
```

## 🔧 调试工具

### 1. React DevTools

安装 React DevTools 浏览器扩展，查看：
- 组件树
- Props 和 State
- Hooks 状态

### 2. Redux DevTools

配置 Zustand DevTools：

```typescript
import { devtools } from 'zustand/middleware'

export const useStore = create(
  devtools(
    (set) => ({
      // 状态和动作
    }),
    { name: 'MyStore' }
  )
)
```

### 3. 性能分析

```typescript
// 使用 React Profiler
import { Profiler } from 'react'

function onRenderCallback(
  id: string,
  phase: 'mount' | 'update',
  actualDuration: number
) {
  console.log(`${id} ${phase} took ${actualDuration}ms`)
}

<Profiler id="MyComponent" onRender={onRenderCallback}>
  <MyComponent />
</Profiler>
```

## 📝 日志记录

### 添加日志

```typescript
// src/utils/logger.ts
export const logger = {
  log: (...args: any[]) => {
    if (import.meta.env.DEV) {
      console.log('[LOG]', ...args)
    }
  },
  warn: (...args: any[]) => {
    console.warn('[WARN]', ...args)
  },
  error: (...args: any[]) => {
    console.error('[ERROR]', ...args)
    // 发送到错误追踪服务
  },
}

// 使用
import { logger } from '@/utils/logger'
logger.log('Platform initialized')
```

## 🆘 获取帮助

### 1. 查看文档

- [完整文档](../README.md)
- [API 参考](../03-api-reference/README.md)
- [示例代码](../06-examples/README.md)

### 2. 查看日志

```typescript
// 查看事件日志
import { globalEventBus } from '@platform/core'
console.log('Event logs:', globalEventBus.getEventLog())

// 查看平台状态
import { getSnapshot } from '@platform/core'
console.log('Platform snapshot:', getSnapshot())
```

### 3. 社区支持

- GitHub Issues
- 团队内部文档
- 技术分享会

## 📚 相关文档

- [部署指南](./README.md)
- [本地开发](./local-development.md)
- [生产构建](./production-build.md)

---

**最后更新**: 2026-01-10
