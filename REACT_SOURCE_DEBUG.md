# React 源码调试指南

本指南帮助你在浏览器中直接调试 React 原始源码（非编译版本）。

## 方案 1: 使用 React DevTools + Source Maps（推荐，最简单）

### 步骤

1. **安装 React DevTools 浏览器扩展**
   - Chrome: https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi
   - Firefox: https://addons.mozilla.org/en-US/firefox/addon/react-devtools/

2. **启动开发服务器**

   ```bash
   npm run dev
   ```

3. **在浏览器中调试**
   - 打开 React Test 页面
   - 按 F12 打开 DevTools
   - 点击 "React 源码调试" 实验
   - 点击调试按钮，在 debugger 断点处暂停
   - 使用 F11 单步进入 React 源码

### 优点

- ✅ 无需额外配置
- ✅ 可以看到调用栈和运行时状态
- ✅ 虽然是编译后的代码（var），但逻辑完全相同

### 缺点

- ❌ 代码使用 var 而非 const/let
- ❌ 变量名可能被混淆

---

## 方案 2: 本地构建 React 源码（最接近原始代码）

### 步骤

#### 1. 克隆 React 源码

```bash
# 在项目根目录创建 react-source 目录
mkdir -p react-source
cd react-source

# 克隆 React 仓库（浅克隆以节省空间）
git clone --depth 1 --branch main https://github.com/facebook/react.git .
```

#### 2. 安装依赖并构建

```bash
# 安装依赖（需要 Node.js 18+）
yarn install

# 构建开发版本（保留源码可读性）
yarn build react/index,react-dom/index --type=NODE_DEV
```

构建完成后，产物在 `build/node_modules/` 目录下。

#### 3. 配置 Vite 使用本地 React

编辑 `vite.config.ts`：

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      // ... 其他别名

      // 使用本地构建的 React 源码
      react: resolve(__dirname, 'react-source/build/node_modules/react'),
      'react-dom': resolve(__dirname, 'react-source/build/node_modules/react-dom'),
    },
  },
  // ... 其他配置
})
```

#### 4. 重启开发服务器

```bash
npm run dev
```

### 优点

- ✅ 可以看到更接近原始的代码
- ✅ 可以修改 React 源码并实时看到效果
- ✅ 完整的调试体验

### 缺点

- ❌ 需要额外的磁盘空间（~500MB）
- ❌ 构建时间较长（5-10分钟）
- ❌ 即使是开发版本，也会经过 Babel 编译

---

## 方案 3: 直接阅读 GitHub 源码 + 浏览器调试（推荐，最高效）

### 双屏学习法

```
┌─────────────────────────┐         ┌─────────────────────────┐
│   左屏：GitHub 源码     │         │   右屏：浏览器调试      │
│                         │         │                         │
│  const fiber = {        │  对照   │  var fiber = {          │
│    memoizedState: null, │  学习   │    memoizedState: null, │
│    updateQueue: null    │         │    updateQueue: null    │
│  }                      │         │  }                      │
│                         │         │                         │
│  ✅ 现代语法，易读      │         │  ✅ 运行时状态          │
│  ✅ 完整注释            │         │  ✅ 调用栈追踪          │
│  ✅ 理解算法逻辑        │         │  ✅ 变量监视            │
└─────────────────────────┘         └─────────────────────────┘
```

### 步骤

1. **左屏：在 GitHub 阅读源码**
   - 访问 https://github.com/facebook/react/tree/main/packages
   - 阅读关键文件（见下方列表）
   - 理解算法和数据结构

2. **右屏：在浏览器调试**
   - 打开 React Test 页面
   - 点击调试按钮触发 debugger
   - 查看 Call Stack 调用链
   - 监视关键变量（fiber.memoizedState 等）

3. **对照学习**
   - 在 GitHub 找到对应的函数
   - 在浏览器中观察运行时行为
   - 理解代码如何执行

### 关键源码文件

| 文件                    | 说明           | GitHub 链接                                                                                               |
| ----------------------- | -------------- | --------------------------------------------------------------------------------------------------------- |
| ReactHooks.js           | Hooks API 入口 | [查看](https://github.com/facebook/react/blob/main/packages/react/src/ReactHooks.js)                      |
| ReactFiberHooks.js      | Hooks 实现核心 | [查看](https://github.com/facebook/react/blob/main/packages/react-reconciler/src/ReactFiberHooks.js)      |
| ReactFiberWorkLoop.js   | Fiber 工作循环 | [查看](https://github.com/facebook/react/blob/main/packages/react-reconciler/src/ReactFiberWorkLoop.js)   |
| ReactFiberBeginWork.js  | Fiber 节点处理 | [查看](https://github.com/facebook/react/blob/main/packages/react-reconciler/src/ReactFiberBeginWork.js)  |
| ReactFiberCommitWork.js | Commit 阶段    | [查看](https://github.com/facebook/react/blob/main/packages/react-reconciler/src/ReactFiberCommitWork.js) |
| ReactChildFiber.js      | Diff 算法      | [查看](https://github.com/facebook/react/blob/main/packages/react-reconciler/src/ReactChildFiber.js)      |
| Scheduler.js            | 调度器         | [查看](https://github.com/facebook/react/blob/main/packages/scheduler/src/forks/Scheduler.js)             |

### 优点

- ✅ 最高效的学习方式
- ✅ 无需额外配置
- ✅ 同时获得源码可读性和运行时调试能力
- ✅ 不占用磁盘空间

---

## 调试技巧

### 1. 使用条件断点

在 DevTools 中右键断点 → Edit breakpoint → 添加条件：

```javascript
// 只在 count > 5 时暂停
count > 5

// 只在特定 Fiber 类型时暂停
fiber.type.name === 'ReactDebugDemo'
```

### 2. 监视关键变量

在 Watch 面板添加表达式：

```javascript
fiber.memoizedState // Hook 状态链表
fiber.updateQueue // 更新队列
workInProgress // 当前工作的 Fiber
currentHook // 当前 Hook
```

### 3. 查看调用栈

Call Stack 面板显示完整的函数调用链：

```
dispatchSetState          ← 你的 setState 调用
scheduleUpdateOnFiber     ← 调度更新
performSyncWorkOnRoot     ← 同步工作
renderRootSync            ← 渲染根节点
workLoopSync              ← 工作循环
performUnitOfWork         ← 处理单个 Fiber
beginWork                 ← 开始工作
updateFunctionComponent   ← 更新函数组件
renderWithHooks           ← 渲染 Hooks
```

### 4. 使用 console.log 追踪

在调试按钮的回调中已经添加了详细的 console.log：

```javascript
const debugUseState = () => {
  console.log('=== useState 调试开始 ===')
  debugger
  setCount((c) => {
    console.log('当前值:', c, '→ 新值:', c + 1)
    return c + 1
  })
}
```

---

## 学习路径

### 第 1 阶段：Hooks 实现（1-2 周）

**目标**：理解 useState、useEffect 的底层机制

**关键概念**：

- Hook 链表结构
- memoizedState 存储
- 更新队列（updateQueue）
- 依赖比较算法

**关键函数**：

- `mountState` / `updateState`
- `mountEffect` / `updateEffect`
- `pushEffect`
- `areHookInputsEqual`

### 第 2 阶段：Fiber 架构（2-3 周）

**目标**：掌握 Fiber 节点结构和遍历算法

**关键概念**：

- Fiber 数据结构
- 双缓冲技术（current / workInProgress）
- 深度优先遍历
- beginWork / completeWork

**关键函数**：

- `createFiber`
- `beginWork`
- `completeWork`
- `performUnitOfWork`

### 第 3 阶段：调度器（1-2 周）

**目标**：学习优先级调度和时间切片

**关键概念**：

- Lane 模型（优先级系统）
- 时间切片（Time Slicing）
- 任务调度
- 可中断渲染

**关键函数**：

- `scheduleUpdateOnFiber`
- `ensureRootIsScheduled`
- `performConcurrentWorkOnRoot`
- `shouldYield`

### 第 4 阶段：Diff 算法（1-2 周）

**目标**：深入理解 reconcileChildren 的优化策略

**关键概念**：

- 单节点 Diff
- 多节点 Diff
- key 的作用
- 复用策略

**关键函数**：

- `reconcileChildFibers`
- `reconcileSingleElement`
- `reconcileChildrenArray`
- `placeChild`

---

## 常见问题

### Q: 为什么浏览器中看到的是 var？

**A**: React 源码经过 Babel 编译成 ES5 代码，为了兼容性和性能使用 var。这是正常的，不影响学习核心逻辑。

### Q: 如何找到对应的源码位置？

**A**:

1. 在 debugger 断点处查看 Call Stack
2. 记下函数名（如 `updateState`）
3. 在 GitHub 搜索该函数名
4. 对照阅读源码

### Q: 变量名被混淆了怎么办？

**A**:

1. 使用我们配置的开发模式（已禁用压缩）
2. 查看 Call Stack 中的函数名
3. 在 GitHub 源码中找到对应函数
4. 对照理解变量含义

### Q: 如何验证我的理解是否正确？

**A**:

1. 修改调试代码，观察行为变化
2. 在 Console 打印关键变量
3. 使用 Watch 面板监视表达式
4. 阅读 React 官方文档和博客

---

## 推荐资源

### 官方资源

- [React 源码仓库](https://github.com/facebook/react)
- [React 官方博客](https://react.dev/blog)
- [React 18 工作组讨论](https://github.com/reactwg/react-18/discussions)

### 社区资源

- [React 技术揭秘](https://react.iamkasong.com/)
- [图解 React 原理系列](https://7km.top/)
- [Build your own React](https://pomb.us/build-your-own-react/)

### 视频教程

- [React Fiber 架构解析](https://www.youtube.com/watch?v=ZCuYPiUIONs)
- [Deep Dive into React Hooks](https://www.youtube.com/watch?v=dpw9EHDh2bM)

---

## 总结

**最推荐的方式**：方案 3（双屏学习法）

- 左屏：GitHub 阅读源码（理解算法）
- 右屏：浏览器调试（观察行为）
- 不纠结 var/let，专注核心逻辑
- 使用调用栈追踪执行流程
- 监视关键变量理解状态变化

这种方式结合了源码可读性和运行时调试能力，是最高效的 React 源码学习方法！
