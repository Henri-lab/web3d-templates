# 中台平台系统 - 快速开始

## 🎉 恭喜！

你的项目已经成功升级为**配置驱动 + 状态机 + 微前端**的中台架构！

---

## 📦 已完成的工作

### ✅ 核心系统

1. **平台配置系统** (`src/platform/config/`)
   - `platform.config.ts` - 平台和模块配置
   - `types.ts` - 完整的TypeScript类型定义

2. **平台核心** (`src/platform/core/`)
   - `platform.ts` - 平台初始化和生命周期
   - `stateMachine.ts` - XState状态机
   - `eventBus.ts` - 事件总线系统
   - `moduleRegistry.ts` - 模块注册中心
   - `platformAPI.ts` - 统一的平台API

3. **Vite配置**
   - Module Federation 配置完成
   - 共享依赖配置完成
   - 路径别名添加 `@platform`

4. **文档**
   - `PLATFORM_ARCHITECTURE.md` - 完整的架构文档
   - `MIGRATION_GUIDE.md` - 详细的迁移指南
   - `ExamplesPage.tsx` - 5个实用示例

---

## 🚀 快速开始

### 1. 查看架构文档

```bash
# 阅读架构设计
cat PLATFORM_ARCHITECTURE.md

# 阅读迁移指南
cat MIGRATION_GUIDE.md
```

### 2. 启动主应用

```bash
npm run dev
```

访问 http://localhost:5173

### 3. 查看示例

访问示例页面查看如何使用平台功能：

- 平台API使用
- 事件总线通信
- 模块管理
- 状态管理
- 跨模块通信

---

## 📚 核心概念

### 配置驱动

所有模块通过配置文件注册：

```typescript
// src/platform/config/platform.config.ts
export const moduleConfigs: ModuleConfig[] = [
  {
    id: 'story',
    name: '历史故事',
    type: 'remote',
    entry: 'http://localhost:5174/remoteEntry.js',
    routes: [{ path: '/stories', component: 'StorySelectionPage' }],
    // ...
  },
]
```

### 状态机管理

使用XState实现可视化状态管理：

```typescript
import { useMachine } from '@xstate/react'
import { platformMachine } from '@platform/core'

const [state, send] = useMachine(platformMachine)
send({ type: 'INIT_COMPLETE' })
```

### 事件总线

模块间通过事件解耦通信：

```typescript
import { useEventBus } from '@platform/core'

const eventBus = useEventBus()

// 发送事件
eventBus.emit('story:play', { storyId: 'qin' })

// 监听事件
eventBus.on('story:play', (event) => {
  console.log(event.payload)
})
```

### 微前端

支持多种模块接入方式：

- **Local** - 本地模块（如欢迎页）
- **Remote** - Module Federation远程模块
- **Iframe** - iframe嵌入

---

## 🎯 下一步

### 选项1: 继续使用当前单体架构

如果你暂时不需要微前端，可以：

1. 使用平台API替代直接的store调用
2. 使用事件总线实现组件解耦
3. 使用XState管理复杂状态
4. 保持所有代码在主应用中

**优势**: 简单、快速、无需拆分模块

### 选项2: 逐步迁移到微前端

按照 `MIGRATION_GUIDE.md` 逐步迁移：

1. 先迁移状态管理（Zustand → XState + PlatformAPI）
2. 再迁移组件通信（直接调用 → 事件总线）
3. 最后拆分独立模块（创建 modules/ 目录）

**优势**: 渐进式、风险低、可随时回退

### 选项3: 完全重构为微前端

创建独立的模块仓库：

```bash
# 创建故事模块
mkdir -p modules/story
cd modules/story
npm init -y
# 配置 vite.config.ts
# 移动相关代码
npm run dev  # 端口 5174

# 创建实验室模块
mkdir -p modules/lab
cd modules/lab
npm init -y
# 配置 vite.config.ts
# 移动相关代码
npm run dev  # 端口 5175
```

**优势**: 完全解耦、独立部署、团队协作

---

## 📖 文档索引

### 架构文档

- [PLATFORM_ARCHITECTURE.md](./PLATFORM_ARCHITECTURE.md) - 完整的架构设计和API文档

### 迁移指南

- [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) - 从旧架构迁移到新架构的详细步骤

### 代码示例

- [ExamplesPage.tsx](./src/platform/examples/ExamplesPage.tsx) - 5个实用示例

### 配置文件

- [platform.config.ts](./src/platform/config/platform.config.ts) - 平台和模块配置
- [types.ts](./src/platform/config/types.ts) - TypeScript类型定义

### 核心代码

- [platform.ts](./src/platform/core/platform.ts) - 平台初始化
- [stateMachine.ts](./src/platform/core/stateMachine.ts) - XState状态机
- [eventBus.ts](./src/platform/core/eventBus.ts) - 事件总线
- [moduleRegistry.ts](./src/platform/core/moduleRegistry.ts) - 模块注册中心
- [platformAPI.ts](./src/platform/core/platformAPI.ts) - 平台API

---

## 🔧 常用命令

```bash
# 开发
npm run dev              # 启动主应用（端口 5173）

# 构建
npm run build            # 构建主应用

# 测试
npm run test             # 运行测试

# 代码检查
npm run lint             # ESLint检查
```

---

## 🎨 架构优势

### 1. 配置优先

- ✅ 所有模块通过配置注册
- ✅ 无需修改代码即可添加/删除模块
- ✅ 配置即文档

### 2. 状态机驱动

- ✅ 可视化状态流转
- ✅ 可预测的状态管理
- ✅ 易于测试和调试

### 3. 事件解耦

- ✅ 模块间零依赖
- ✅ 灵活的通信方式
- ✅ 易于扩展

### 4. 微前端

- ✅ 独立开发和部署
- ✅ 技术栈无关
- ✅ 团队协作友好

### 5. 类型安全

- ✅ 完整的TypeScript类型
- ✅ 编译时错误检查
- ✅ 智能代码提示

---

## 🌟 核心特性

### 配置驱动

```typescript
// 添加新模块只需配置
moduleConfigs.push({
  id: 'newModule',
  name: '新模块',
  type: 'remote',
  entry: 'http://localhost:5177/remoteEntry.js',
  // ...
})
```

### 状态机

```typescript
// 可视化状态管理
const [state, send] = useMachine(platformMachine)
send({ type: 'LOAD_MODULE', moduleId: 'story' })
```

### 事件总线

```typescript
// 解耦的模块通信
eventBus.emit('module:event', { data: '...' })
eventBus.on('module:event', handler)
```

### 平台API

```typescript
// 统一的平台能力
const api = usePlatformAPI()
api.router.push('/stories')
api.moduleManager.loadModule('story')
```

---

## 🤝 贡献

欢迎提交Issue和Pull Request！

---

## 📄 许可证

MIT

---

## 🎉 开始使用

现在你可以：

1. **阅读文档** - 了解架构设计和API
2. **查看示例** - 学习如何使用平台功能
3. **开始迁移** - 按照迁移指南逐步升级
4. **创建模块** - 开发新的独立模块

祝你使用愉快！🚀
