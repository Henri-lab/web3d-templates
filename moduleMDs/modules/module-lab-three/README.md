# Three.js 实验室模块 (module-lab-three)

> Three.js 组件展示与实验模块

## 📖 模块概述

Three.js 实验室模块是一个用于展示和实验 Three.js 组件的模块，提供了丰富的 3D 组件示例、交互式调试工具和实时参数调整功能。

### 核心功能

- ✅ **组件展示** - 展示各种 Three.js 组件和效果
- ✅ **实时调试** - 使用 Leva 进行实时参数调整
- ✅ **代码示例** - 提供完整的代码示例
- ✅ **性能监控** - 实时 FPS 和性能监控
- ✅ **场景切换** - 快速切换不同的示例场景
- ✅ **响应式设计** - 适配不同屏幕尺寸

## 🎯 模块信息

| 属性 | 值 |
|------|-----|
| 模块 ID | `lab` |
| 模块名称 | 组件实验室 |
| 版本 | 1.0.0 |
| 类型 | local |
| 命名空间 | `lab` |

## 📂 目录结构

```
src/
├── pages/
│   └── ComponentLabPage.tsx        # 实验室主页面
│
├── components/
│   └── three/                      # Three.js 组件
│       ├── BasicCube.tsx           # 基础立方体
│       ├── AnimatedSphere.tsx      # 动画球体
│       ├── ParticleSystem.tsx      # 粒子系统
│       ├── CustomShader.tsx        # 自定义着色器
│       └── PostProcessing.tsx      # 后期处理
│
└── utils/
    └── threeHelpers.ts             # Three.js 工具函数
```

## 🏗️ 模块架构

### 组件分类

```
┌─────────────────────────────────────────────────────────┐
│                    实验室主页面                          │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │  场景选择器                                     │    │
│  │  - 基础几何体                                   │    │
│  │  - 材质和纹理                                   │    │
│  │  - 光照和阴影                                   │    │
│  │  - 动画和交互                                   │    │
│  │  - 粒子系统                                     │    │
│  │  - 后期处理                                     │    │
│  └────────────────────────────────────────────────┘    │
│                          ↓                              │
│  ┌────────────────────────────────────────────────┐    │
│  │  3D 场景渲染                                    │    │
│  │  - Canvas (React Three Fiber)                   │    │
│  │  - 相机控制                                     │    │
│  │  - 组件渲染                                     │    │
│  └────────────────────────────────────────────────┘    │
│                          ↓                              │
│  ┌────────────────────────────────────────────────┐    │
│  │  调试面板 (Leva)                                │    │
│  │  - 实时参数调整                                 │    │
│  │  - 性能监控                                     │    │
│  │  - 代码查看                                     │    │
│  └────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

## 🚀 快速开始

### 访问模块

```
http://localhost:5173/lab
```

### 模块配置

```typescript
// src/platform/config/platform.config.ts
{
  id: 'lab',
  name: '组件实验室',
  description: 'Three.js组件展示与实验',
  version: '1.0.0',
  type: 'local',

  routes: [
    {
      path: '/lab',
      component: 'ComponentLabPage',
      meta: { title: '组件实验室' },
    },
  ],

  menu: {
    title: '实验室',
    icon: 'flask',
    order: 2,
    visible: true,
  },

  capabilities: {
    provides: ['lab.showcase'],
    requires: ['platform.eventBus'],
  },

  config: { enableLeva: true },
  state: { namespace: 'lab', persist: false },
}
```

## 🎨 核心功能

### 1. 基础几何体

展示 Three.js 的基础几何体。

**组件**: `BasicCube.tsx`, `BasicSphere.tsx`, `BasicPlane.tsx`

**功能**:
- 立方体、球体、平面等基础几何体
- 实时调整尺寸和位置
- 不同材质效果

**示例代码**:
```typescript
import { Box } from '@react-three/drei'

export function BasicCube() {
  return (
    <Box args={[1, 1, 1]}>
      <meshStandardMaterial color="orange" />
    </Box>
  )
}
```

### 2. 材质和纹理

展示不同的材质和纹理效果。

**组件**: `MaterialShowcase.tsx`

**功能**:
- MeshBasicMaterial
- MeshStandardMaterial
- MeshPhysicalMaterial
- 纹理贴图
- 环境贴图

### 3. 光照和阴影

展示光照和阴影效果。

**组件**: `LightingDemo.tsx`

**功能**:
- 环境光
- 点光源
- 聚光灯
- 平行光
- 阴影效果

### 4. 动画和交互

展示动画和交互效果。

**组件**: `AnimatedSphere.tsx`, `InteractiveBox.tsx`

**功能**:
- 旋转动画
- 缩放动画
- 鼠标交互
- 键盘控制

**示例代码**:
```typescript
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'

export function AnimatedSphere() {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta
    }
  })

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial color="blue" />
    </mesh>
  )
}
```

### 5. 粒子系统

展示粒子系统效果。

**组件**: `ParticleSystem.tsx`

**功能**:
- 粒子生成
- 粒子动画
- 粒子颜色
- 性能优化

### 6. 后期处理

展示后期处理效果。

**组件**: `PostProcessing.tsx`

**功能**:
- Bloom 效果
- 景深效果
- 色彩校正
- 抗锯齿

## 🔌 事件系统

### 发送的事件

| 事件类型 | 说明 | Payload |
|---------|------|---------|
| `lab:scene:change` | 切换场景 | `{ sceneId: string }` |
| `lab:component:load` | 加载组件 | `{ componentId: string }` |
| `lab:performance:update` | 性能更新 | `{ fps: number, memory: number }` |

### 监听的事件

| 事件类型 | 说明 | 处理逻辑 |
|---------|------|---------|
| `platform:ready` | 平台就绪 | 初始化实验室 |
| `route:change` | 路由变化 | 更新场景状态 |

## 💾 状态管理

### 模块状态

```typescript
interface LabState {
  currentScene: string | null
  enableLeva: boolean
  showStats: boolean
  scenes: Scene[]
}
```

## 🎯 使用 Leva 调试

### 基本用法

```typescript
import { useControls } from 'leva'

export function MyComponent() {
  const { color, scale, rotation } = useControls({
    color: '#ff0000',
    scale: { value: 1, min: 0.1, max: 2, step: 0.1 },
    rotation: { value: 0, min: 0, max: Math.PI * 2, step: 0.1 },
  })

  return (
    <mesh scale={scale} rotation={[0, rotation, 0]}>
      <boxGeometry />
      <meshStandardMaterial color={color} />
    </mesh>
  )
}
```

## 🎨 示例场景

### 1. 旋转立方体

```typescript
export function RotatingCube() {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta
      meshRef.current.rotation.y += delta * 0.5
    }
  })

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="orange" />
    </mesh>
  )
}
```

### 2. 粒子星空

```typescript
export function ParticleStars() {
  const count = 5000
  const positions = useMemo(() => {
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10
    }
    return positions
  }, [])

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.01} color="white" />
    </points>
  )
}
```

## 🐛 调试技巧

### 1. 性能监控

```typescript
import { Stats } from '@react-three/drei'

<Canvas>
  <Stats />
  {/* 场景内容 */}
</Canvas>
```

### 2. 查看场景树

使用 React DevTools 查看组件树和 props。

### 3. 使用 Leva 调试

实时调整参数，无需重新加载页面。

## 📚 相关资源

### 官方文档
- [Three.js 文档](https://threejs.org/docs/)
- [React Three Fiber 文档](https://docs.pmnd.rs/react-three-fiber)
- [React Three Drei 文档](https://github.com/pmndrs/drei)
- [Leva 文档](https://github.com/pmndrs/leva)

### 学习资源
- [Three.js Journey](https://threejs-journey.com)
- [React Three Fiber 示例](https://docs.pmnd.rs/react-three-fiber/getting-started/examples)

## 🔄 版本历史

- **v1.0.0** (2026-01-10) - 初始版本
  - 基础几何体展示
  - 材质和光照示例
  - Leva 调试集成
  - 性能监控

## 📄 许可证

MIT License

---

**最后更新**: 2026-01-10
**维护者**: Development Team
