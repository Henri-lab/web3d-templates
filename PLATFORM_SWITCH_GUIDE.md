---
id: platform-architecture-switch
title: 平台架构切换与升级指南
version: 1.0.0
status: draft
layer: core
created: 2026-01-09
updated: 2026-01-09
author: Codex AI
tags: [platform, xstate, module-federation, zustand]
---

# 平台架构切换与升级指南

> 目标：在不改业务模块页面代码的前提下，在「稳健版（Zustand + 本地模块）」和「高级版（XState + Module Federation 微前端）」之间平滑切换。

---

## 概述

当前仓库默认启用的是**稳健版架构**：

- 状态管理：Zustand（`src/platform/core/platformStore.ts`）
- 模块接入：本地模块（`moduleConfigs` 中全部 `type: 'local'`）
- 平台实例：`src/platform/core/platform.ts`（`getSnapshot + modules`）

高级版架构（保留为进阶选项）：

- 状态管理：XState 状态机（`src/platform/core/stateMachine.ts`）
- 模块接入：Module Federation 远程模块（`remoteEntry.js` + `type: 'remote'`）

这两套架构已经按「核心 + 扩展」拆分，**业务模块页面（`src/pages/*`）可以保持不变**，只要它们：

- 通过路由路径挂在 `ModuleConfig.routes` 上；
- 不直接依赖 Module Federation 容器 / XState 内部 API。

当前代码已满足这一点，所以后续升级主要改动集中在平台核心和配置层。

---

## 切换前提与约束

### 业务模块代码的约束

为了保证切换时不改业务模块代码，建议模块遵守：

- 页面作为普通 React 组件存在于主仓库（例如 `src/pages/StorySelectionPage.tsx`）。  
- 依赖平台的方式只通过：
  - React Router 路径（`/stories`、`/lab`、`/earth` 等）；
  - 可选：平台提供的 Hook（未来如果启用 `usePlatformAPI` 等）。
- 模块内部不：
  - 直接操作 Module Federation 容器（`window[xxx]`、`__webpack_share_scopes__`）；  
  - 直接依赖 XState 的 `PlatformService` 或 actor 实例。

当前仓库的模块已经按这种方式实现，所以**切换/升级时，无需改这些模块页面代码**。

### 何时需要真的拆成「独立模块仓库」

只有当你满足以下需求之一时，才需要考虑从本地模块升级为远程模块：

- 不同团队拥有自己的仓库和部署流水线；  
- 某些模块需要单独灰度、单独回滚、甚至使用不同技术栈；  
- 你希望这个中台壳接入外部团队自研的“插件模块”。

在此之前，保持「本地模块 + 单仓」会更简单、更好调试。

---

## 切换路径概览

从当前稳健版（Zustand + 本地模块）升级到高级版（XState + Module Federation）时，核心步骤集中在 4 个文件：

1. `src/platform/core/platform.ts`  
   - 决定平台初始化用的是 Zustand 还是 XState。
2. `src/platform/core/moduleRegistry.ts`  
   - 决定是否启用远程模块加载（Module Federation / iframe 等）。
3. `src/platform/config/platform.config.ts`  
   - 决定模块是 `local` 还是 `remote`，以及远程入口 `entry`。
4. `src/platform/core/platformAPI.ts`（可选）  
   - 如果你想让模块通过 Platform API 操作状态/路由，在这里挂桥。

业务模块（`src/pages/*`）无需改动，只要它们仍然通过路由路径挂载即可。

---

## 步骤一：保持当前稳健版的入口不动

当前稳健版已经生效，无需操作，只作为对照说明：

- 平台实例（`src/platform/core/platform.ts`）：
  - 使用 `usePlatformStore` + `getSnapshot()` 管理状态；
  - 在 `initializePlatform()` 中遍历 `moduleConfigs`，全部视为本地模块；
  - `PlatformInstance` 暴露：
    - `config`
    - `modules`
    - `eventBus`
    - `store`（Zustand）
    - `getSnapshot`（兼容 XState 快照形状）。

- 平台页面依赖：
  - `const platform = usePlatform()`
  - `const snapshot = platform.getSnapshot()`
  - `const modules = platform.modules`

这保证了：只要你后面把 `getSnapshot` 换成 XState 版本，对页面来说是透明的。

---

## 步骤二：切换到 XState 状态机（可选升级）

当你需要更复杂的状态图/流程时，可以考虑启用 XState：

1. 打开 `src/platform/core/stateMachine.ts`，确认状态机定义符合你的平台流程需求。  
2. 在 `src/platform/core/platform.ts` 中：
   - 引入并创建 `PlatformService`：
     ```ts
     import { createPlatformService } from './stateMachine'
     ```
   - 在 `initializePlatform()` 中，用 XState service 代替当前的 `usePlatformStore` 状态：
     - 将注册模块、发事件的逻辑迁移为对状态机的 `send` 操作（例如 `send({ type: 'MODULE_LOADED', moduleId })`）。  
3. 保持 `PlatformInstance.getSnapshot()` 的接口不变：
   - 让它返回 `stateService.getSnapshot()` 的 `{ value, context }`。  

只要 `getSnapshot()` 的返回结构保持一致，`WelcomePage` / `PlatformHomePage` / `ExamplesPage` 就不需要改。

> 建议：如果你只是想在局部实验状态机，可以在新模块中使用 XState，而平台本身暂时继续用 Zustand，避免一次性切换太多东西。

---

## 步骤三：从本地模块升级为远程模块（Module Federation）

当你需要把某个模块从「本地页面」升级为「独立部署的远程模块」时，可以按下面的流程逐个模块进行，不影响其他本地模块。

### 3.1 为目标模块准备远程入口

在目标模块的独立仓库中：

1. 使用 Vite + Module Federation 插件（参考 `MIGRATION_GUIDE.md` 的配置示例）。  
2. 在该模块仓库中暴露页面组件：

   ```ts
   // modules/story/vite.config.ts
   federation({
     name: 'story',
     filename: 'remoteEntry.js',
     exposes: {
       './StorySelectionPage': './src/pages/StorySelectionPage.tsx',
       './StoryPlayerPage': './src/pages/StoryPlayerPage.tsx',
     },
     // ...
   })
   ```

3. 部署后，能通过 `http://host:port/remoteEntry.js` 访问到该远程入口。

### 3.2 修改平台模块配置为 `remote`

在主仓库的 `src/platform/config/platform.config.ts` 中，把该模块的配置从：

```ts
{
  id: 'story',
  type: 'local',
  // ...
}
```

改成：

```ts
{
  id: 'story',
  type: 'remote',
  entry: 'http://localhost:5174/remoteEntry.js',
  // 其余字段保持不变（routes/menu/capabilities/state 等）
}
```

业务路由（`/stories`、`/story/:storyId`）保持原样，无需改用方代码。

### 3.3 恢复 `ModuleRegistry` 的远程加载逻辑

在 `src/platform/core/moduleRegistry.ts` 中：

1. 恢复 `load()` 中的类型分支：

```ts
switch (instance.config.type) {
  case 'local':
    await this.loadLocalModule(instance)
    break
  case 'remote':
    await this.loadRemoteModule(instance)
    break
  case 'iframe':
    await this.loadIframeModule(instance)
    break
  default:
    throw new Error(`Unknown module type: ${instance.config.type}`)
}
```

2. 恢复或重写 `loadRemoteModule` 与 `loadIframeModule` 的实现（可以参考过去版本或 `MIGRATION_GUIDE.md` 中的示例）。

做到这里，**平台壳的页面/导航/事件总线仍然不需要改动**；唯一的区别是：

- 对于 `type: 'remote'` 的模块，`ModuleRegistry` 在第一次加载时会通过 Module Federation 拉远程组件；
- 对于 `type: 'local'` 的模块，仍从当前仓库的 `src/pages/*` 中动态加载组件。

---

## 步骤四：验证与回滚

### 验证步骤

1. 启动主应用：`npm run dev`。  
2. 确认平台首页/导航中仍能看到所有模块卡片。  
3. 手动点击升级为 `remote` 的模块，观察：
   - 首次加载时是否发起了对 `remoteEntry.js` 的网络请求；  
   - 控制台是否有 Module Federation 相关错误；  
   - 页面组件是否正常渲染。

如有问题，可以逐项检查：

- `entry` URL 是否正确；  
- 远程仓库的 `exposes` 名称是否与本地 `routes[*].component` 一致；  
- Webpack/Vite 的共享依赖配置是否正确（尤其是 React/ReactDOM）。

### 回滚方案

如果升级过程中出现难以迅速解决的问题，可以按以下方式回滚到稳健版：

1. 将对应模块的 `type` 从 `'remote'` 改回 `'local'`，移除 `entry` 字段。  
2. 将 `ModuleRegistry.load()` 中远程加载分支改回“仅本地模块”的实现。  
3. 如有对 XState 平台状态机的修改，可先退回到 `platformStore + getSnapshot()` 的实现。

由于业务模块页面都还在本仓库内，而且路由结构保持不变，回滚只涉及平台核心和配置文件。

---

## 检查清单

### 升级前

- [ ] 所有业务模块页面均通过路由挂载，不依赖 Module Federation / XState 内部实现。  
- [ ] 平台已在稳健版架构下运行稳定（Zustand + 本地模块）。  
- [ ] 拟升级为远程模块的功能已从逻辑上划分清晰（例如整个 Story 子系统）。

### 升级到 XState 时

- [ ] 在 `platform.ts` 中正确创建并启动 `PlatformService`。  
- [ ] `PlatformInstance.getSnapshot()` 返回 XState 快照 `{ value, context }`，与页面预期一致。  
- [ ] 关键平台事件（模块注册 / 加载 / 错误）通过 XState 事件驱动，而不是直接改 Zustand。

### 升级到 Module Federation 时

- [ ] 远程模块仓库可以独立启动和构建，并暴露 `remoteEntry.js`。  
- [ ] 平台 `moduleConfigs` 中正确设置 `type: 'remote'` 和 `entry`。  
- [ ] `ModuleRegistry` 中恢复了 `loadRemoteModule`，并能在调试时看到正确的加载流程。  
- [ ] 升级失败时，能够按「回滚方案」快速回到稳健版。

---

## 相关文档

- `PLATFORM_REFACTOR_LOG.md`：当前稳健版重构记录与解读。  
- `PLATFORM_ARCHITECTURE.md`：整体架构说明（含高级版设计思路）。  
- `MIGRATION_GUIDE.md`：从单体应用迁移到中台 + 微前端的历史文档（适合作为高级方案参考）。  

