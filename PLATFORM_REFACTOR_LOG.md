---
id: platform-refactor-stable-architecture
title: 平台架构稳健版重构记录
version: 1.0.0
status: published
layer: core
created: 2026-01-09
updated: 2026-01-09
author: Codex AI
tags: [platform, refactor, architecture]
---

# 平台架构稳健版重构记录

> 目标：在保留「配置驱动 / 模块化 / 事件总线 / 导航页面」的前提下，将平台从「XState + Module Federation 微前端」切换为「Zustand + 本地模块」的更稳健实现。

---

## 概述

本次重构的背景是你给出的对比表：

| 特性     | 当前架构          | 简化后             |
| -------- | ----------------- | ------------------ |
| 配置驱动 | ✅                | ✅ 保留            |
| 模块化   | ✅                | ✅ 保留            |
| 事件总线 | ✅                | ✅ 保留            |
| 导航页面 | ✅                | ✅ 保留            |
| 状态管理 | XState            | Zustand（更简单）  |
| 微前端   | Module Federation | 本地模块（更可靠） |
| 复杂度   | 🔴 高             | 🟢 低              |
| 调试难度 | 🔴 难             | 🟢 易              |
| 学习成本 | 🔴 高             | 🟢 低              |
| 可靠性   | 🟡 中             | 🟢 高              |

落地目标是：代码运行路径完全切到「Zustand + 本地模块」，XState / Module Federation 只保留在文档和核心文件中作为“进阶参考”，不再影响默认实现和 UI 描述。

---

## 当前架构确认

### 1. 状态管理：已从 XState 切换到 Zustand

- 实际的状态管理现在由 `src/platform/core/platformStore.ts` 提供：
  - `usePlatformStore`：Zustand store
  - `getSnapshot()`：返回 `{ value, context }`，兼容旧的 XState 快照形状
- 平台实例定义在 `src/platform/core/platform.ts:23`：
  - `store: typeof usePlatformStore`
  - `getSnapshot: typeof getSnapshot`
- 平台初始化逻辑：
  - 在 `initializePlatform()` 中，循环 `moduleConfigs` 将模块登记到事件总线，并调用 `store.getState().addLoadedModule(module.id)`。
  - 最后调用 `store.getState().setReady()`，整体状态为 `'ready'`。

**页面使用方式已统一为 Zustand 快照：**

- `src/pages/WelcomePage.tsx`
  - 通过 `const platform = usePlatform()` 获取平台实例。
  - 使用 `const snapshot = platform.getSnapshot()` 获取状态，而不是 `stateService.getSnapshot()`。
  - 状态信息卡片展示 `snapshot.value`、`snapshot.context.loadedModules`、`snapshot.context.activeModule`。
- `src/platform/pages/PlatformHomePage.tsx`
  - 同样使用 `platform.getSnapshot()` 展示当前状态和上下文。
- `src/platform/examples/ExamplesPage.tsx`
  - `handleCheckState` 中使用 `platform.getSnapshot()` 记录当前状态。

> 验证：全局搜索 `stateService` 和 `XState` 已无命中，说明运行时路径已经脱离 XState。

### 2. 微前端：从 Module Federation 切换为本地模块

- 模块配置在 `src/platform/config/platform.config.ts` 中统一管理：
  - `moduleConfigs` 中所有模块的 `type` 均为 `'local'`。
  - 每个模块通过 `routes` 绑定到应用内的本地页面组件（如 `WelcomePage`, `StorySelectionPage`, `ComponentLabPage`, `EarthLabPage`, `PlatformHomePage`, `ExamplesPage` 等）。
- 平台初始化 (`initializePlatform`) 不再发起远程加载：
  - 仅将 `moduleConfigs` 写入 `platformInstance.modules`。
  - 通过事件总线发送 `MODULE_REGISTER` 和 `PLATFORM_READY` 事件。
- 原始的 `ModuleRegistry` 和其 Module Federation 逻辑仍在 `src/platform/core/moduleRegistry.ts` 中保留，但当前配置不会触发远程加载分支，只作为扩展能力存在。

**页面层面统一使用本地模块信息：**

- `src/platform/pages/PlatformHomePage.tsx`
  - `const modules = platform.modules`（直接使用配置中的模块数组）。
  - 卡片上类型标签仍区分 `local`/`remote`，但当前项目中实际均为本地模块。
- `src/pages/WelcomePage.tsx`
  - 注册模块数展示为 `platform.modules.length`。
- `src/platform/examples/ExamplesPage.tsx`
  - 模块列表通过 `platform.modules` 获取，不再调用 `moduleRegistry.getAll()`。

> 验证：全局搜索 `moduleRegistry.getAll` 没有结果，说明 UI 已不依赖动态微前端加载。

### 3. 文案与技术栈描述：已切到稳健版

- `src/platform/pages/PlatformHomePage.tsx`
  - 欢迎文案改为：配置驱动 + Zustand 状态管理 + 事件总线 + 本地模块 的中台架构。
  - 架构特点卡片：
    - 「状态机管理」→「状态管理（Zustand）」。
    - 「独立部署」→「本地模块」。
  - Footer 改为：`Powered by Vite + Zustand + Local Modules`。
- `src/pages/WelcomePage.tsx`
  - 技术栈列表从 `XState`, `Module Federation` 改为 `Zustand`, `Event Bus`。
  - 状态卡片展示「平台状态」而非强调状态机实现。
- `src/platform/examples/ExamplesPage.tsx`
  - 状态相关卡片文案修改为「Zustand 驱动的轻量状态管理」。
- `PLATFORM_ARCHITECTURE.md`
  - 概述改为：默认实现是「配置驱动 + Zustand + 本地模块」，XState + Module Federation 仅作为进阶参考。
  - 状态配置示例与当前代码版本号同步（2.1.0-stable，初始状态 ready，persistState: false）。
- `MIGRATION_GUIDE.md`
  - 开头增加说明：本文基于旧版 XState + Module Federation 方案，当前仓库默认采用稳健版架构，本指南主要作为历史/进阶参考。

---

## 关键改动路径

### 1. 平台实例与状态快照统一

**文件：** `src/platform/core/platform.ts`

- 定义新的 `PlatformInstance` 结构：

```typescript
export interface PlatformInstance {
  config: typeof platformConfig
  modules: ModuleConfig[]
  eventBus: typeof globalEventBus
  store: typeof usePlatformStore
  getSnapshot: typeof getSnapshot
}
```

- 初始化逻辑中：
  - 使用 `usePlatformStore` 代替 XState 服务。
  - 将 `getSnapshot` 暴露在 `platformInstance` 上，供页面统一调用。

**结果：** 页面不再直接依赖 XState 的 `PlatformService`，而是通过 `platform.getSnapshot()` 以统一方式读取状态。

### 2. 页面从 `stateService` / `moduleRegistry` 迁移到新接口

**`src/pages/WelcomePage.tsx`**

- 以前：

```typescript
const platform = usePlatform()
const snapshot = platform.stateService.getSnapshot()
const moduleCount = platform.moduleRegistry.getAll().length
```

- 现在：

```typescript
const platform = usePlatform()
const snapshot = platform.getSnapshot()
const moduleCount = platform.modules.length
```

**`src/platform/pages/PlatformHomePage.tsx`**

- 以前：

```typescript
const modules = platform.moduleRegistry.getAll()
const snapshot = platform.stateService.getSnapshot()
```

- 现在：

```typescript
const modules = platform.modules
const snapshot = platform.getSnapshot()
```

**`src/platform/examples/ExamplesPage.tsx`**

- 模块列表与状态查看均改为使用 `platform.modules` 与 `platform.getSnapshot()`。

**结果：** 上层页面全部脱离 `PlatformService` 和 `ModuleRegistry` 的直接依赖，统一通过简化的 `PlatformInstance` 接口读取数据。

### 3. 配置与文档对齐

**`src/platform/config/platform.config.ts`**

- `platformConfig.version` 更新为 `2.1.0-stable`。
- `stateMachine` 配置改为符合 Zustand 方案：

```typescript
stateMachine: {
  initialState: 'ready',
  persistState: false,
  devTools: true,
}
```

**`PLATFORM_ARCHITECTURE.md` & `MIGRATION_GUIDE.md`**

- 通过轻量修改让文档「明确区分」：
  - 当前默认方案：配置驱动 + Zustand + 本地模块。
  - 旧 / 进阶方案：XState + Module Federation。

---

## 检查清单

### 功能对照表落实情况

- [x] 配置驱动：仍由 `platform.config.ts` + `moduleConfigs` 统一控制。
- [x] 模块化：模块以 `ModuleConfig` 定义，并通过路由挂载页面。
- [x] 事件总线：`globalEventBus` 仍在使用，示例页和平台首页都有测试按钮。
- [x] 导航页面：`WelcomePage` + `PlatformHomePage` + `ExamplesPage` 保留且已适配新接口。
- [x] 状态管理：运行路径使用 Zustand（`platformStore`），页面通过 `platform.getSnapshot()` 访问。
- [x] 微前端：当前实现全部为本地模块，Module Federation 仅保留在核心文件中作为扩展路径。
- [x] 文案 / 技术栈：UI 文案不再展示「XState + Module Federation」作为默认技术栈。

### 代码层安全性

- [x] `src/` 目录中不再出现 `stateService` / `XState` / `Module Federation` 等字样（仅文档中存在）。
- [x] 平台初始化不依赖远程入口，全部可在单仓库内运行。
- [ ] `npm run build` 报错已与平台重构逻辑解耦（主要是 Three.js / DSL / Story 页面未使用变量和类型问题，后续可单独清理）。

---

## 后续可选增强方向

1. **进一步精简核心：**
   - 将 `stateMachine.ts`、Module Federation 相关分支从核心导出中移至 `advanced/` 或 `legacy/` 目录，强化默认方案的简洁性。
2. **平台相关 TS 错误清理：**
   - 当前 TS 报错多集中在动画、DSL、故事播放等模块，可分支单独做一次「类型与未使用代码」清理，让 `npm run build` 完全通过。
3. **文档拆分：**
   - 将旧架构（XState + Module Federation）整理为独立的「进阶微前端架构」文档，避免与默认实现混淆。

---

## 相关文档

- `PLATFORM_ARCHITECTURE.md`：平台整体架构说明（已标注稳健版为默认实现）。
- `MIGRATION_GUIDE.md`：从单体应用迁移到中台架构的指南（基于旧方案，视为进阶参考）。
- `PLATFORM_README.md`：平台快速开始与使用说明。
