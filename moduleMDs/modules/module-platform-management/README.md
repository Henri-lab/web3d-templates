# 平台管理模块 (module-platform-management)

> 平台配置与状态管理模块

## 📖 模块概述

平台管理模块提供了平台配置、状态监控、模块管理等功能，是平台的管理中心。

### 核心功能

- ✅ **平台状态监控** - 实时查看平台状态
- ✅ **模块管理** - 查看和管理所有模块
- ✅ **事件日志** - 查看事件历史
- ✅ **配置管理** - 查看和修改配置
- ✅ **性能监控** - 查看性能指标
- ✅ **API 演示** - 平台 API 使用示例

## 🎯 模块信息

| 属性 | 值 |
|------|-----|
| 模块 ID | `platform` |
| 模块名称 | 平台管理 |
| 版本 | 1.0.0 |
| 类型 | local |
| 命名空间 | `platform` |

## 🚀 快速开始

### 访问模块

```
http://localhost:5173/platform          # 平台管理页
http://localhost:5173/platform-examples # API 演示页
```

### 模块配置

```typescript
{
  id: 'platform',
  name: '平台管理',
  description: '平台配置与状态管理',
  version: '1.0.0',
  type: 'local',

  routes: [
    {
      path: '/platform',
      component: 'PlatformHomePage',
      meta: { title: '平台管理' },
    },
    {
      path: '/platform-examples',
      component: 'ExamplesPage',
      meta: { title: 'API演示' },
    },
  ],

  menu: {
    title: '平台管理',
    icon: 'settings',
    order: 99,
    visible: true,
  },
}
```

## 🎨 核心功能

### 1. 平台状态监控

实时查看平台状态。

**功能**:
- 平台状态（initializing/ready/error）
- 已加载模块列表
- 活跃模块
- 错误信息

**示例代码**:
```typescript
import { usePlatformStore } from '@platform/core'

function PlatformStatus() {
  const status = usePlatformStore((state) => state.status)
  const loadedModules = usePlatformStore((state) => state.loadedModules)

  return (
    <div>
      <p>Status: {status}</p>
      <p>Loaded Modules: {loadedModules.length}</p>
    </div>
  )
}
```

### 2. 模块管理

查看和管理所有模块。

**功能**:
- 模块列表
- 模块详情
- 模块状态
- 模块配置

### 3. 事件日志

查看事件历史。

**功能**:
- 事件列表
- 事件筛选
- 事件详情
- 事件统计

**示例代码**:
```typescript
import { globalEventBus } from '@platform/core'

function EventLog() {
  const logs = globalEventBus.getEventLog()

  return (
    <div>
      {logs.map((event, index) => (
        <div key={index}>
          <span>{event.type}</span>
          <span>{new Date(event.timestamp).toLocaleString()}</span>
        </div>
      ))}
    </div>
  )
}
```

### 4. API 演示

平台 API 使用示例。

**功能**:
- 事件总线示例
- 状态管理示例
- 路由示例
- 模块管理示例

## 🔌 事件系统

### 发送的事件

| 事件类型 | 说明 | Payload |
|---------|------|---------|
| `platform:config:update` | 配置更新 | `{ config: any }` |
| `platform:module:reload` | 重新加载模块 | `{ moduleId: string }` |

---

**最后更新**: 2026-01-10
