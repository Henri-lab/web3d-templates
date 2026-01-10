# 平台核心系统

> 中台平台的核心系统文档，包含平台初始化、状态管理、事件总线、模块注册等核心功能

## 📖 概述

平台核心系统是整个中台架构的基础，提供了模块化、可扩展的基础设施。核心系统采用配置驱动的设计理念，通过 Zustand 进行状态管理，通过 EventBus 实现模块间解耦通信。

## 🏗️ 核心组件

### 1. 平台初始化 (Platform Initialization)
负责平台的启动、模块注册、资源加载等初始化工作。

**文档**: [platform-initialization.md](./platform-initialization.md)

**核心功能**:
- 平台实例创建
- 模块批量注册
- 状态初始化
- 事件总线启动

### 2. 状态管理 (State Management)
基于 Zustand 的轻量级状态管理系统，替代了早期的 XState 方案。

**文档**: [state-management.md](./state-management.md)

**核心功能**:
- 平台状态管理
- 模块状态隔离
- 状态持久化
- 状态订阅

### 3. 事件总线 (Event Bus)
模块间通信的核心机制，基于 EventEmitter3 实现。

**文档**: [event-bus.md](./event-bus.md)

**核心功能**:
- 事件发布/订阅
- 事件日志记录
- 事件类型定义
- 跨模块通信

### 4. 模块注册中心 (Module Registry)
管理所有模块的注册、加载、卸载等生命周期。

**文档**: [module-registry.md](./module-registry.md)

**核心功能**:
- 模块注册
- 模块查询
- 生命周期管理
- 依赖解析

### 5. 平台 API (Platform API)
统一的平台能力接口，供模块调用。

**文档**: [platform-api.md](./platform-api.md)

**核心功能**:
- 事件总线访问
- 状态管理访问
- 路由控制
- 模块管理
- 工具方法

### 6. 配置系统 (Configuration)
配置驱动的核心，所有模块通过配置文件注册。

**文档**: [configuration.md](./configuration.md)

**核心功能**:
- 平台配置
- 模块配置
- 路由配置
- 类型定义

## 📂 源码位置

```
src/platform/
├── config/                          # 配置系统
│   ├── platform.config.ts           # 平台配置
│   └── types.ts                     # 类型定义
│
└── core/                            # 核心模块
    ├── platform.ts                  # 平台初始化
    ├── platformStore.ts             # 状态管理 (Zustand)
    ├── eventBus.ts                  # 事件总线
    ├── moduleRegistry.ts            # 模块注册中心
    ├── platformAPI.ts               # 平台 API
    └── index.ts                     # 统一导出
```

## 🔄 核心流程

### 平台启动流程

```
1. 应用启动
   ↓
2. 初始化平台 (initializePlatform)
   ↓
3. 创建状态 Store (Zustand)
   ↓
4. 创建事件总线 (EventBus)
   ↓
5. 注册所有模块 (ModuleRegistry)
   ↓
6. 设置平台就绪状态
   ↓
7. 发送 PLATFORM_READY 事件
   ↓
8. 应用可用
```

### 模块加载流程

```
1. 模块配置注册
   ↓
2. 触发 MODULE_REGISTER 事件
   ↓
3. 执行 beforeLoad 生命周期
   ↓
4. 加载模块组件
   ↓
5. 执行 onLoad 生命周期
   ↓
6. 触发 MODULE_LOAD_SUCCESS 事件
   ↓
7. 模块可用
```

### 事件通信流程

```
模块 A                    事件总线                    模块 B
  │                         │                         │
  │──── emit(event) ───────>│                         │
  │                         │                         │
  │                         │──── trigger ──────────>│
  │                         │                         │
  │                         │<──── handler ──────────│
  │                         │                         │
```

## 🎯 设计原则

### 1. 单一职责
每个核心组件只负责一个明确的功能领域。

### 2. 依赖倒置
模块依赖抽象接口，不依赖具体实现。

### 3. 开闭原则
对扩展开放，对修改关闭。

### 4. 最小知识原则
模块只知道必要的信息，通过事件解耦。

## 📊 架构图

### 核心系统架构

```
┌─────────────────────────────────────────────────────────┐
│                    应用层 (App)                          │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │         PlatformProvider (React Context)        │    │
│  └────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                  平台核心层 (Platform Core)              │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ PlatformAPI  │  │  EventBus    │  │ StateStore   │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│         │                  │                  │         │
│         └──────────────────┼──────────────────┘         │
│                            ↓                            │
│                  ┌──────────────────┐                   │
│                  │ ModuleRegistry   │                   │
│                  └──────────────────┘                   │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                    模块层 (Modules)                      │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │ Module A │  │ Module B │  │ Module C │  ...        │
│  └──────────┘  └──────────┘  └──────────┘             │
└─────────────────────────────────────────────────────────┘
```

## 🔧 核心 API 快速参考

### 平台初始化

```typescript
import { initializePlatform, getPlatformInstance } from '@platform/core'

// 初始化平台
const platform = await initializePlatform()

// 获取平台实例
const platform = getPlatformInstance()
```

### 状态管理

```typescript
import { usePlatformStore } from '@platform/core'

// 在组件中使用
const status = usePlatformStore((state) => state.status)
const setReady = usePlatformStore((state) => state.setReady)

// 在非组件中使用
const state = usePlatformStore.getState()
state.setReady()
```

### 事件总线

```typescript
import { globalEventBus, PlatformEvents } from '@platform/core'

// 发送事件
globalEventBus.emit(PlatformEvents.MODULE_MOUNT, { moduleId: 'story' })

// 监听事件
const unsubscribe = globalEventBus.on(PlatformEvents.MODULE_MOUNT, (event) => {
  console.log('Module mounted:', event.payload.moduleId)
})

// 取消监听
unsubscribe()
```

### 平台 API

```typescript
import { usePlatformAPI } from '@platform/core'

function MyComponent() {
  const api = usePlatformAPI()

  // 使用事件总线
  api.eventBus.emit('my-event', { data: 'hello' })

  // 使用路由
  api.router.push('/stories')

  // 使用模块管理
  await api.moduleManager.loadModule('story')
}
```

## 📚 相关文档

- [平台初始化详解](./platform-initialization.md)
- [状态管理详解](./state-management.md)
- [事件总线详解](./event-bus.md)
- [模块注册详解](./module-registry.md)
- [平台 API 详解](./platform-api.md)
- [配置系统详解](./configuration.md)

## 🔍 调试工具

### 查看平台状态

```typescript
import { usePlatformStore, getSnapshot } from '@platform/core'

// 获取状态快照
const snapshot = getSnapshot()
console.log('Platform status:', snapshot.value)
console.log('Loaded modules:', snapshot.context.loadedModules)
```

### 查看事件日志

```typescript
import { globalEventBus } from '@platform/core'

// 获取事件日志
const logs = globalEventBus.getEventLog()
console.log('Event logs:', logs)

// 监听所有事件
globalEventBus.onAll((event) => {
  console.log('Event:', event.type, event.payload)
})
```

### 查看模块信息

```typescript
import { getPlatformInstance } from '@platform/core'

const platform = getPlatformInstance()
console.log('Platform config:', platform.config)
console.log('Registered modules:', platform.modules)
```

## 🚀 性能优化

### 1. 懒加载
模块按需加载，减少初始加载时间。

### 2. 事件节流
高频事件自动节流，避免性能问题。

### 3. 状态缓存
状态变化自动缓存，减少重复计算。

### 4. 内存管理
自动清理未使用的模块和事件监听器。

## ⚠️ 注意事项

### 1. 平台初始化
- 必须在应用启动时调用 `initializePlatform()`
- 只能初始化一次，重复初始化会抛出错误

### 2. 事件命名
- 使用命名空间：`module:action`
- 避免使用通用名称：`update`, `change`
- 使用预定义事件类型：`PlatformEvents`

### 3. 状态管理
- 使用命名空间隔离模块状态
- 避免直接修改状态，使用 actions
- 只持久化必要的状态

### 4. 模块依赖
- 明确声明模块依赖：`capabilities.requires`
- 避免循环依赖
- 使用事件解耦模块

## 📝 更新日志

- **2026-01-10**: 创建核心系统文档
- **2025-12**: 从 XState 迁移到 Zustand
- **2025-11**: 初始版本

---

**最后更新**: 2026-01-10
