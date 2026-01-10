# 技术栈说明

> History3D Learning Platform 使用的技术栈详解

## 📚 技术栈总览

### 核心技术

| 技术 | 版本 | 用途 | 官方文档 |
|------|------|------|---------|
| React | 18.2+ | UI 框架 | [react.dev](https://react.dev) |
| TypeScript | 5.3+ | 类型系统 | [typescriptlang.org](https://www.typescriptlang.org) |
| Vite | 5.0+ | 构建工具 | [vitejs.dev](https://vitejs.dev) |
| Zustand | 4.4+ | 状态管理 | [github.com/pmndrs/zustand](https://github.com/pmndrs/zustand) |
| EventEmitter3 | - | 事件总线 | [github.com/primus/eventemitter3](https://github.com/primus/eventemitter3) |
| React Router | 6.21+ | 路由管理 | [reactrouter.com](https://reactrouter.com) |

### 3D 技术

| 技术 | 版本 | 用途 | 官方文档 |
|------|------|------|---------|
| Three.js | 0.160+ | 3D 渲染引擎 | [threejs.org](https://threejs.org) |
| React Three Fiber | 8.15+ | React Three.js 集成 | [docs.pmnd.rs/react-three-fiber](https://docs.pmnd.rs/react-three-fiber) |
| React Three Drei | 9.92+ | Three.js 辅助库 | [github.com/pmndrs/drei](https://github.com/pmndrs/drei) |
| React Three Postprocessing | 2.15+ | 后期处理效果 | [github.com/pmndrs/react-postprocessing](https://github.com/pmndrs/react-postprocessing) |

### UI 技术

| 技术 | 版本 | 用途 | 官方文档 |
|------|------|------|---------|
| Tailwind CSS | 3.4+ | 样式框架 | [tailwindcss.com](https://tailwindcss.com) |
| Framer Motion | 10.16+ | 动画库 | [framer.com/motion](https://www.framer.com/motion) |
| GSAP | 3.12+ | 高级动画 | [greensock.com/gsap](https://greensock.com/gsap) |
| Leva | 0.9+ | 调试面板 | [github.com/pmndrs/leva](https://github.com/pmndrs/leva) |

### 工具链

| 技术 | 版本 | 用途 | 官方文档 |
|------|------|------|---------|
| ESLint | 8.55+ | 代码检查 | [eslint.org](https://eslint.org) |
| Prettier | 3.7+ | 代码格式化 | [prettier.io](https://prettier.io) |
| Vitest | 1.1+ | 单元测试 | [vitest.dev](https://vitest.dev) |

## 🎯 技术选型理由

### React 18

**为什么选择 React？**

- ✅ 成熟稳定的生态系统
- ✅ 强大的组件化能力
- ✅ 优秀的性能（Concurrent Mode）
- ✅ 丰富的第三方库
- ✅ 团队熟悉度高

**React 18 新特性**

- Concurrent Rendering
- Automatic Batching
- Transitions API
- Suspense 改进

### TypeScript

**为什么选择 TypeScript？**

- ✅ 类型安全，减少运行时错误
- ✅ 优秀的 IDE 支持
- ✅ 代码可维护性高
- ✅ 重构更安全
- ✅ 团队协作更高效

**TypeScript 配置**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "jsx": "react-jsx"
  }
}
```

### Vite

**为什么选择 Vite？**

- ✅ 极快的冷启动速度
- ✅ 即时的热模块替换（HMR）
- ✅ 优化的生产构建
- ✅ 丰富的插件生态
- ✅ 原生 ESM 支持

**Vite vs Webpack**

| 特性 | Vite | Webpack |
|------|------|---------|
| 启动速度 | 极快 | 较慢 |
| HMR 速度 | 极快 | 较慢 |
| 配置复杂度 | 简单 | 复杂 |
| 生态成熟度 | 快速增长 | 非常成熟 |

### Zustand

**为什么选择 Zustand？**

- ✅ 简单直观的 API
- ✅ 轻量级（~1KB）
- ✅ 无需 Provider 包裹
- ✅ TypeScript 友好
- ✅ 支持中间件

**Zustand vs Redux vs MobX**

| 特性 | Zustand | Redux | MobX |
|------|---------|-------|------|
| 学习曲线 | 低 | 高 | 中 |
| 代码量 | 少 | 多 | 中 |
| 性能 | 优秀 | 良好 | 优秀 |
| TypeScript | 优秀 | 良好 | 良好 |
| 生态 | 增长中 | 成熟 | 成熟 |

**为什么不用 XState？**

早期版本使用了 XState，但发现：
- 学习曲线较陡
- 代码量较大
- 对于简单状态管理过于复杂

因此迁移到了 Zustand。

### EventEmitter3

**为什么选择 EventEmitter3？**

- ✅ 性能优异
- ✅ API 简单
- ✅ 体积小
- ✅ 兼容 Node.js EventEmitter
- ✅ 无依赖

**EventEmitter3 vs 其他方案**

| 特性 | EventEmitter3 | RxJS | mitt |
|------|---------------|------|------|
| 性能 | 优秀 | 良好 | 优秀 |
| 体积 | 小 | 大 | 极小 |
| 功能 | 完整 | 强大 | 简单 |
| 学习曲线 | 低 | 高 | 低 |

### Three.js

**为什么选择 Three.js？**

- ✅ 最流行的 WebGL 库
- ✅ 功能强大
- ✅ 文档完善
- ✅ 社区活跃
- ✅ 丰富的示例

**Three.js 生态**

- **React Three Fiber**: React 集成
- **React Three Drei**: 辅助组件库
- **React Three Postprocessing**: 后期处理
- **Leva**: 调试面板

### Tailwind CSS

**为什么选择 Tailwind CSS？**

- ✅ 原子化 CSS，开发效率高
- ✅ 无需命名 class
- ✅ 响应式设计简单
- ✅ 生产构建体积小
- ✅ 可定制性强

**Tailwind CSS 配置**

```javascript
// tailwind.config.js
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#4CAF50',
        secondary: '#2196F3',
      },
    },
  },
  plugins: [],
}
```

## 🔧 开发工具

### VSCode 推荐插件

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "Vue.volar",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

### 浏览器扩展

- **React DevTools**: 调试 React 组件
- **Redux DevTools**: 调试 Zustand（通过 devtools 中间件）
- **Three.js Inspector**: 调试 Three.js 场景

## 📊 性能优化

### 构建优化

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    target: 'esnext',
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'three-vendor': ['three', '@react-three/fiber', '@react-three/drei'],
        },
      },
    },
  },
})
```

### 代码分割

```typescript
// 路由懒加载
const StoryPlayerPage = lazy(() => import('@/pages/StoryPlayerPage'))

// 组件懒加载
const HeavyComponent = lazy(() => import('@/components/HeavyComponent'))
```

### 资源优化

- **图片**: 使用 WebP 格式
- **模型**: 使用 glTF/GLB 格式
- **字体**: 使用 woff2 格式
- **代码**: Tree-shaking 和 minify

## 🔄 技术演进

### 版本历史

| 版本 | 时间 | 主要变化 |
|------|------|---------|
| v2.1.0 | 2026-01 | 迁移到 Zustand，简化架构 |
| v2.0.0 | 2025-12 | 引入 Module Federation 和 XState |
| v1.0.0 | 2025-11 | 初始版本 |

### 未来计划

- [ ] 支持 React Server Components
- [ ] 引入 Suspense for Data Fetching
- [ ] 升级到 React 19
- [ ] 支持 WebGPU
- [ ] 引入 AI 辅助功能

## 📚 学习资源

### 官方文档

- [React 官方文档](https://react.dev)
- [TypeScript 官方文档](https://www.typescriptlang.org)
- [Vite 官方文档](https://vitejs.dev)
- [Three.js 官方文档](https://threejs.org)
- [Tailwind CSS 官方文档](https://tailwindcss.com)

### 推荐教程

- [React Three Fiber 教程](https://docs.pmnd.rs/react-three-fiber/getting-started/introduction)
- [Zustand 教程](https://github.com/pmndrs/zustand/wiki)
- [Three.js Journey](https://threejs-journey.com)

### 社区资源

- [React 中文社区](https://react.docschina.org)
- [Three.js 中文网](http://www.webgl3d.cn)
- [掘金前端](https://juejin.cn/frontend)

## 🔍 技术对比

### 状态管理对比

```typescript
// Zustand (当前使用)
const useStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}))

// Redux (未使用)
const counterSlice = createSlice({
  name: 'counter',
  initialState: { count: 0 },
  reducers: {
    increment: (state) => {
      state.count += 1
    },
  },
})

// MobX (未使用)
class CounterStore {
  @observable count = 0
  @action increment() {
    this.count++
  }
}
```

### 3D 渲染对比

```typescript
// React Three Fiber (当前使用)
<Canvas>
  <mesh>
    <boxGeometry />
    <meshStandardMaterial />
  </mesh>
</Canvas>

// 原生 Three.js (未使用)
const scene = new THREE.Scene()
const geometry = new THREE.BoxGeometry()
const material = new THREE.MeshStandardMaterial()
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)
```

## ⚠️ 注意事项

### 版本兼容性

- Node.js >= 18.0.0
- 浏览器需支持 ES2020+
- Three.js 版本需与 React Three Fiber 兼容

### 已知问题

- Three.js 在某些移动设备上性能较差
- Vite HMR 在大型项目中可能较慢
- Tailwind CSS 在开发环境下 CSS 文件较大

### 最佳实践

- 使用 TypeScript strict 模式
- 遵循 ESLint 规则
- 使用 Prettier 格式化代码
- 编写单元测试
- 使用 Git Hooks 检查代码质量

---

**最后更新**: 2026-01-10
