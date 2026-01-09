# React 源码调试 - 快速开始

## 🎯 目标

在浏览器中调试 React 原始源码，而不是编译后的代码。

## 📋 三种方案对比

| 方案                               | 难度        | 效果             | 推荐度     |
| ---------------------------------- | ----------- | ---------------- | ---------- |
| **方案 1: DevTools + Source Maps** | ⭐ 简单     | 可调试，但是 var | ⭐⭐⭐     |
| **方案 2: 本地构建 React**         | ⭐⭐⭐ 复杂 | 更接近原始代码   | ⭐⭐       |
| **方案 3: 双屏学习法**             | ⭐ 简单     | 最佳学习体验     | ⭐⭐⭐⭐⭐ |

## 🚀 推荐方案：双屏学习法

### 为什么推荐？

- ✅ **无需配置**：直接开始
- ✅ **最高效**：同时获得源码可读性和运行时调试
- ✅ **零成本**：不占用磁盘空间
- ✅ **最佳实践**：这是 React 核心团队成员推荐的学习方式

### 使用方法

```
┌─────────────────────────┐         ┌─────────────────────────┐
│   左屏：GitHub 源码     │         │   右屏：浏览器调试      │
│                         │         │                         │
│  const fiber = {        │  对照   │  var fiber = {          │
│    memoizedState: null, │  学习   │    memoizedState: null, │
│  }                      │         │  }                      │
│                         │         │                         │
│  ✅ 现代语法，易读      │         │  ✅ 运行时状态          │
│  ✅ 完整注释            │         │  ✅ 调用栈追踪          │
└─────────────────────────┘         └─────────────────────────┘
```

### 步骤

1. **启动项目**

   ```bash
   npm run dev
   ```

2. **打开 React Test 页面**
   - 访问 http://localhost:3000
   - 点击 "React Test"
   - 选择 "React 源码调试"

3. **左屏：GitHub 源码**
   - 点击页面中的 "GitHub 源码" 按钮
   - 或访问：https://github.com/facebook/react/tree/main/packages

4. **右屏：浏览器调试**
   - 按 F12 打开 DevTools
   - 点击调试按钮（如 "1️⃣ useState 更新队列"）
   - 在 debugger 断点处暂停
   - 查看 Call Stack 和变量

5. **对照学习**
   - 在 Call Stack 中找到函数名（如 `updateState`）
   - 在 GitHub 搜索该函数
   - 对照阅读源码和运行时行为

## 🛠️ 方案 2：本地构建 React（可选）

如果你想在浏览器中看到更接近原始的代码，可以本地构建 React。

### 快速设置

```bash
# 1. 运行自动化设置脚本
./setup-react-source.sh

# 2. 按照提示配置 vite.config.ts
# 添加以下别名：
# 'react': resolve(__dirname, 'react-source/build/node_modules/react'),
# 'react-dom': resolve(__dirname, 'react-source/build/node_modules/react-dom'),

# 3. 重启开发服务器
npm run dev
```

### 详细文档

查看 [REACT_SOURCE_DEBUG.md](./REACT_SOURCE_DEBUG.md) 了解：

- 完整的设置步骤
- 3 种调试方案的详细对比
- 调试技巧和最佳实践
- 学习路径（4 个阶段）
- 常见问题解答

## 📚 学习资源

### 关键源码文件

| 文件                   | 说明           | 链接                                                                                                     |
| ---------------------- | -------------- | -------------------------------------------------------------------------------------------------------- |
| ReactHooks.js          | Hooks API 入口 | [查看](https://github.com/facebook/react/blob/main/packages/react/src/ReactHooks.js)                     |
| ReactFiberHooks.js     | Hooks 实现核心 | [查看](https://github.com/facebook/react/blob/main/packages/react-reconciler/src/ReactFiberHooks.js)     |
| ReactFiberWorkLoop.js  | Fiber 工作循环 | [查看](https://github.com/facebook/react/blob/main/packages/react-reconciler/src/ReactFiberWorkLoop.js)  |
| ReactFiberBeginWork.js | Fiber 节点处理 | [查看](https://github.com/facebook/react/blob/main/packages/react-reconciler/src/ReactFiberBeginWork.js) |

### 调试功能

页面提供了 4 个调试入口：

1. **useState 更新队列** - 理解状态更新机制
2. **批量更新机制** - 观察 React 如何合并多次 setState
3. **Fiber 调和算法** - 深入 Fiber 树的遍历过程
4. **优先级调度** - 学习 React 的任务调度系统

每个按钮都包含：

- ✅ `debugger` 断点
- ✅ 详细的 console.log
- ✅ 实时日志显示

### 额外功能

- **Fiber 节点检查器** - 提取当前组件的 Fiber 信息
- **实时状态监控** - 显示 count、渲染次数、日志条数
- **学习路径指南** - 4 阶段循序渐进
- **调试技巧** - 条件断点、监视表达式等

## ❓ 常见问题

### Q: 为什么浏览器中看到的是 var？

**A**: React 源码经过 Babel 编译成 ES5，为了兼容性使用 var。这是正常的，不影响学习核心逻辑。

### Q: 我必须本地构建 React 吗？

**A**: 不需要！推荐使用双屏学习法：

- 左屏：GitHub 阅读源码（const/let，易读）
- 右屏：浏览器调试（运行时行为）

### Q: 如何找到对应的源码位置？

**A**:

1. 在 debugger 断点处查看 Call Stack
2. 记下函数名（如 `updateState`）
3. 在 GitHub 搜索该函数名
4. 对照阅读源码

### Q: 本地构建需要多久？

**A**:

- 克隆仓库：2-5 分钟
- 安装依赖：5-10 分钟
- 构建：5-10 分钟
- 总计：15-25 分钟
- 磁盘占用：~500MB

## 🎓 学习路径

### 第 1 阶段：Hooks 实现（1-2 周）

- 理解 useState、useEffect 的底层机制
- 关键概念：Hook 链表、memoizedState、更新队列

### 第 2 阶段：Fiber 架构（2-3 周）

- 掌握 Fiber 节点结构和遍历算法
- 关键概念：双缓冲、beginWork、completeWork

### 第 3 阶段：调度器（1-2 周）

- 学习优先级调度和时间切片
- 关键概念：Lane 模型、时间切片、可中断渲染

### 第 4 阶段：Diff 算法（1-2 周）

- 深入理解 reconcileChildren 的优化策略
- 关键概念：单节点 Diff、多节点 Diff、key 的作用

## 📖 更多文档

- [REACT_SOURCE_DEBUG.md](./REACT_SOURCE_DEBUG.md) - 完整的调试指南
- [setup-react-source.sh](./setup-react-source.sh) - 自动化设置脚本

## 🚀 开始学习

```bash
# 1. 启动项目
npm run dev

# 2. 访问 http://localhost:3000

# 3. 点击 "React Test" → "React 源码调试"

# 4. 开始你的 React 源码学习之旅！
```

---

**祝你学习愉快！** 🎉

如有问题，请查看 [REACT_SOURCE_DEBUG.md](./REACT_SOURCE_DEBUG.md) 获取详细帮助。
