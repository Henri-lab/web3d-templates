# 地球可视化模块 (module-earth-history)

> 全球数据可视化展示模块

## 📖 模块概述

地球可视化模块是一个基于 Three.js 的全球数据可视化展示模块，提供了交互式的 3D 地球、数据标注、飞行动画等功能。

### 核心功能

- ✅ **3D 地球渲染** - 高质量的 3D 地球模型
- ✅ **数据可视化** - 在地球上展示数据点
- ✅ **交互控制** - 旋转、缩放、飞行到指定位置
- ✅ **标注系统** - 地点标注和信息展示
- ✅ **飞行动画** - 平滑的相机飞行动画
- ✅ **时间轴** - 历史数据时间轴展示

## 🎯 模块信息

| 属性 | 值 |
|------|-----|
| 模块 ID | `earth` |
| 模块名称 | 地球可视化 |
| 版本 | 1.0.0 |
| 类型 | local |
| 命名空间 | `earth` |

## 📂 目录结构

```
src/
├── pages/
│   └── EarthLabPage.tsx            # 地球主页面
│
├── components/
│   └── three/
│       ├── Earth.tsx               # 地球组件
│       ├── EarthMarker.tsx         # 地球标注
│       ├── EarthControls.tsx       # 地球控制
│       └── DataPoints.tsx          # 数据点
│
└── utils/
    └── earthHelpers.ts             # 地球工具函数
```

## 🏗️ 模块架构

### 组件结构

```
┌─────────────────────────────────────────────────────────┐
│                    地球主页面                            │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │  控制面板                                       │    │
│  │  - 视角控制                                     │    │
│  │  - 数据筛选                                     │    │
│  │  - 时间轴控制                                   │    │
│  └────────────────────────────────────────────────┘    │
│                          ↓                              │
│  ┌────────────────────────────────────────────────┐    │
│  │  3D 地球场景                                    │    │
│  │  ┌──────────────────────────────────────┐     │    │
│  │  │  地球模型                             │     │    │
│  │  │  - 纹理贴图                           │     │    │
│  │  │  - 大气层效果                         │     │    │
│  │  │  - 云层                               │     │    │
│  │  └──────────────────────────────────────┘     │    │
│  │  ┌──────────────────────────────────────┐     │    │
│  │  │  数据层                               │     │    │
│  │  │  - 数据点标注                         │     │    │
│  │  │  - 连接线                             │     │    │
│  │  │  - 信息卡片                           │     │    │
│  │  └──────────────────────────────────────┘     │    │
│  └────────────────────────────────────────────────┘    │
│                          ↓                              │
│  ┌────────────────────────────────────────────────┐    │
│  │  信息面板                                       │    │
│  │  - 选中地点信息                                 │    │
│  │  - 数据详情                                     │    │
│  │  - 相关链接                                     │    │
│  └────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

## 🚀 快速开始

### 访问模块

```
http://localhost:5173/earth
```

### 模块配置

```typescript
// src/platform/config/platform.config.ts
{
  id: 'earth',
  name: '地球可视化',
  description: '全球数据可视化展示',
  version: '1.0.0',
  type: 'local',

  routes: [
    {
      path: '/earth',
      component: 'EarthLabPage',
      meta: { title: '地球可视化' },
    },
  ],

  menu: {
    title: '地球',
    icon: 'globe',
    order: 3,
    visible: true,
  },

  capabilities: {
    provides: ['earth.visualize'],
    requires: ['platform.eventBus'],
  },

  config: { useThreeJS: true },
  state: { namespace: 'earth', persist: false },
}
```

## 🎨 核心功能

### 1. 3D 地球渲染

高质量的 3D 地球模型。

**组件**: `Earth.tsx`

**功能**:
- 地球纹理贴图
- 大气层效果
- 云层动画
- 昼夜效果

**示例代码**:
```typescript
import { useTexture } from '@react-three/drei'

export function Earth() {
  const [colorMap, normalMap, specularMap] = useTexture([
    '/textures/earth-color.jpg',
    '/textures/earth-normal.jpg',
    '/textures/earth-specular.jpg',
  ])

  return (
    <mesh>
      <sphereGeometry args={[1, 64, 64]} />
      <meshStandardMaterial
        map={colorMap}
        normalMap={normalMap}
        roughnessMap={specularMap}
      />
    </mesh>
  )
}
```

### 2. 数据可视化

在地球上展示数据点。

**组件**: `DataPoints.tsx`

**功能**:
- 数据点标注
- 数据连接线
- 数据聚合
- 热力图

**示例代码**:
```typescript
export function DataPoint({ lat, lon, data }: DataPointProps) {
  const position = latLonToVector3(lat, lon, 1.01)

  return (
    <mesh position={position}>
      <sphereGeometry args={[0.01, 16, 16]} />
      <meshBasicMaterial color="red" />
    </mesh>
  )
}
```

### 3. 交互控制

旋转、缩放、飞行到指定位置。

**组件**: `EarthControls.tsx`

**功能**:
- 鼠标拖拽旋转
- 滚轮缩放
- 飞行到指定位置
- 自动旋转

**示例代码**:
```typescript
import { OrbitControls } from '@react-three/drei'

export function EarthControls() {
  return (
    <OrbitControls
      enablePan={false}
      minDistance={1.5}
      maxDistance={5}
      autoRotate
      autoRotateSpeed={0.5}
    />
  )
}
```

### 4. 标注系统

地点标注和信息展示。

**组件**: `EarthMarker.tsx`

**功能**:
- 地点标注
- 信息卡片
- 点击交互
- 标注动画

### 5. 飞行动画

平滑的相机飞行动画。

**功能**:
- 飞行到指定位置
- 平滑过渡
- 自定义飞行路径
- 飞行速度控制

**示例代码**:
```typescript
import { useThree } from '@react-three/fiber'
import { gsap } from 'gsap'

export function flyToLocation(lat: number, lon: number) {
  const { camera } = useThree()
  const targetPosition = latLonToVector3(lat, lon, 2)

  gsap.to(camera.position, {
    x: targetPosition.x,
    y: targetPosition.y,
    z: targetPosition.z,
    duration: 2,
    ease: 'power2.inOut',
  })
}
```

### 6. 时间轴

历史数据时间轴展示。

**功能**:
- 时间轴控制
- 数据回放
- 时间筛选
- 动画播放

## 🔌 事件系统

### 发送的事件

| 事件类型 | 说明 | Payload |
|---------|------|---------|
| `earth:location:select` | 选择地点 | `{ lat: number, lon: number }` |
| `earth:data:load` | 加载数据 | `{ dataType: string }` |
| `earth:timeline:change` | 时间轴变化 | `{ time: number }` |

### 监听的事件

| 事件类型 | 说明 | 处理逻辑 |
|---------|------|---------|
| `platform:ready` | 平台就绪 | 初始化地球 |
| `route:change` | 路由变化 | 更新地球状态 |

## 💾 状态管理

### 模块状态

```typescript
interface EarthState {
  selectedLocation: Location | null
  dataPoints: DataPoint[]
  currentTime: number
  viewMode: 'globe' | 'flat'
}
```

## 🎯 坐标转换

### 经纬度转 3D 坐标

```typescript
export function latLonToVector3(
  lat: number,
  lon: number,
  radius: number = 1
): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lon + 180) * (Math.PI / 180)

  const x = -(radius * Math.sin(phi) * Math.cos(theta))
  const y = radius * Math.cos(phi)
  const z = radius * Math.sin(phi) * Math.sin(theta)

  return new THREE.Vector3(x, y, z)
}
```

### 3D 坐标转经纬度

```typescript
export function vector3ToLatLon(
  position: THREE.Vector3
): { lat: number; lon: number } {
  const radius = position.length()
  const lat = 90 - Math.acos(position.y / radius) * (180 / Math.PI)
  const lon = ((270 + Math.atan2(position.x, position.z) * (180 / Math.PI)) % 360) - 180

  return { lat, lon }
}
```

## 🎨 数据格式

### 数据点格式

```typescript
interface DataPoint {
  id: string
  name: string
  lat: number
  lon: number
  value: number
  type: string
  timestamp: number
  metadata?: Record<string, any>
}
```

### 示例数据

```typescript
const dataPoints: DataPoint[] = [
  {
    id: '1',
    name: '北京',
    lat: 39.9042,
    lon: 116.4074,
    value: 100,
    type: 'city',
    timestamp: Date.now(),
  },
  {
    id: '2',
    name: '纽约',
    lat: 40.7128,
    lon: -74.0060,
    value: 150,
    type: 'city',
    timestamp: Date.now(),
  },
]
```

## 🐛 调试技巧

### 1. 查看坐标

```typescript
console.log('Lat/Lon:', lat, lon)
console.log('3D Position:', latLonToVector3(lat, lon))
```

### 2. 性能优化

```typescript
// 使用 InstancedMesh 优化大量数据点
import { InstancedMesh } from 'three'

const instancedMesh = new InstancedMesh(geometry, material, count)
```

### 3. 调试相机

```typescript
import { useHelper } from '@react-three/drei'
import { CameraHelper } from 'three'

const cameraRef = useRef()
useHelper(cameraRef, CameraHelper)
```

## 📚 相关资源

### 地球纹理
- [NASA Visible Earth](https://visibleearth.nasa.gov/)
- [Natural Earth](https://www.naturalearthdata.com/)

### 数据源
- [World Bank Open Data](https://data.worldbank.org/)
- [UN Data](http://data.un.org/)

## 🔄 版本历史

- **v1.0.0** (2026-01-10) - 初始版本
  - 3D 地球渲染
  - 数据点可视化
  - 交互控制
  - 飞行动画

## 📄 许可证

MIT License

---

**最后更新**: 2026-01-10
**维护者**: Development Team
