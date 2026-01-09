---
id: layer-2-code
title: Layer 2 代码层
version: 1.0.0
status: published
layer: 2
created: 2024-01-05
updated: 2024-01-05
---

# Layer 2: 代码层 (Code Layer)

> 提供可复用的代码模板、组件库和技术规范

---

## 概述

代码层是整个系统的技术基础，负责：

1. **React 组件模板** - 标准化的 UI 组件
2. **Three.js 场景组件** - 3D 渲染组件封装
3. **状态管理** - Zustand 全局状态设计
4. **API 规范** - TypeScript 接口定义

---

## 目录结构

```
02-code/
├── README.md                    # 本文件
├── REACT-TEMPLATES.md           # React 组件模板
├── THREEJS-COMPONENTS.md        # Three.js 组件
├── STATE-MANAGEMENT.md          # 状态管理
├── API-SPECIFICATION.md         # API 规范
└── snippets/                    # 代码片段库
    ├── scene-setup.tsx.md
    ├── camera-controls.tsx.md
    ├── model-loader.tsx.md
    ├── gsap-integration.tsx.md
    └── responsive-canvas.tsx.md
```

---

## 🔧 技术栈规范

### 核心依赖

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "three": "^0.160.0",
    "@react-three/fiber": "^8.15.0",
    "@react-three/drei": "^9.92.0",
    "gsap": "^3.12.0",
    "zustand": "^4.4.0",
    "@gsap/react": "^2.1.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "@types/three": "^0.160.0"
  }
}
```

### 可选增强

```json
{
  "optionalDependencies": {
    "@react-three/postprocessing": "^2.16.0",
    "@react-three/rapier": "^1.2.0",
    "leva": "^0.9.35",
    "r3f-perf": "^7.1.2",
    "framer-motion": "^10.16.0"
  }
}
```

---

## 📦 组件分类

### 1. Canvas 核心组件

| 组件          | 职责       | 文件              |
| ------------- | ---------- | ----------------- |
| `Scene`       | 主场景容器 | `Scene.tsx`       |
| `Camera`      | 相机控制   | `Camera.tsx`      |
| `Lights`      | 灯光系统   | `Lights.tsx`      |
| `Controls`    | 交互控制   | `Controls.tsx`    |
| `Environment` | 环境设置   | `Environment.tsx` |

### 2. 3D 对象组件

| 组件        | 职责          | 文件            |
| ----------- | ------------- | --------------- |
| `GLTFModel` | GLTF 模型加载 | `GLTFModel.tsx` |
| `Character` | 历史人物      | `Character.tsx` |
| `Artifact`  | 文物展示      | `Artifact.tsx`  |
| `Building`  | 建筑场景      | `Building.tsx`  |
| `Particles` | 粒子效果      | `Particles.tsx` |

### 3. UI 组件

| 组件       | 职责     | 文件           |
| ---------- | -------- | -------------- |
| `HUD`      | 抬头显示 | `HUD.tsx`      |
| `Timeline` | 时间轴   | `Timeline.tsx` |
| `InfoCard` | 信息卡片 | `InfoCard.tsx` |
| `Dialog`   | 对话框   | `Dialog.tsx`   |
| `Quiz`     | 测验组件 | `Quiz.tsx`     |

### 4. 布局组件

| 组件               | 职责     | 文件                   |
| ------------------ | -------- | ---------------------- |
| `SplitView`        | 分屏布局 | `SplitView.tsx`        |
| `Overlay`          | 覆盖层   | `Overlay.tsx`          |
| `Sidebar`          | 侧边栏   | `Sidebar.tsx`          |
| `FullscreenCanvas` | 全屏画布 | `FullscreenCanvas.tsx` |

---

## 🎨 组件模板示例

### Scene 主场景组件

```tsx
// src/components/canvas/Scene.tsx
import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { Preload } from '@react-three/drei'
import { Camera } from './Camera'
import { Lights } from './Lights'
import { Environment } from './Environment'
import { useSceneStore } from '@/stores/sceneStore'

interface SceneProps {
  children: React.ReactNode
  className?: string
}

export function Scene({ children, className }: SceneProps) {
  const { quality } = useSceneStore()

  return (
    <Canvas
      className={className}
      dpr={quality === 'high' ? [1, 2] : [1, 1.5]}
      gl={{
        antialias: quality !== 'low',
        powerPreference: 'high-performance',
      }}
      camera={{ fov: 50, near: 0.1, far: 1000 }}
    >
      <Suspense fallback={null}>
        <Camera />
        <Lights />
        <Environment />
        {children}
        <Preload all />
      </Suspense>
    </Canvas>
  )
}
```

### GLTF 模型加载组件

```tsx
// src/components/objects/GLTFModel.tsx
import { useRef, useEffect } from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import gsap from 'gsap'
import type { Group } from 'three'

interface GLTFModelProps {
  url: string
  position?: [number, number, number]
  rotation?: [number, number, number]
  scale?: number | [number, number, number]
  animation?: string
  onClick?: () => void
  onHover?: (hovered: boolean) => void
}

export function GLTFModel({
  url,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  animation,
  onClick,
  onHover,
}: GLTFModelProps) {
  const ref = useRef<Group>(null)
  const { scene, animations } = useGLTF(url)
  const { actions } = useAnimations(animations, ref)

  // 播放动画
  useEffect(() => {
    if (animation && actions[animation]) {
      actions[animation]?.play()
    }
  }, [animation, actions])

  // 入场动画
  useEffect(() => {
    if (ref.current) {
      gsap.from(ref.current.position, {
        y: position[1] - 2,
        duration: 1,
        ease: 'power2.out',
      })
      gsap.from(ref.current.scale, {
        x: 0,
        y: 0,
        z: 0,
        duration: 0.8,
        ease: 'back.out(1.7)',
      })
    }
  }, [])

  const scaleArray = Array.isArray(scale) ? scale : [scale, scale, scale]

  return (
    <primitive
      ref={ref}
      object={scene.clone()}
      position={position}
      rotation={rotation}
      scale={scaleArray}
      onClick={onClick}
      onPointerOver={() => onHover?.(true)}
      onPointerOut={() => onHover?.(false)}
    />
  )
}

// 预加载模型
useGLTF.preload('/models/default.glb')
```

### 时间轴组件

```tsx
// src/components/ui/Timeline.tsx
import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useTimelineStore } from '@/stores/timelineStore'

gsap.registerPlugin(ScrollTrigger)

interface TimelineEvent {
  id: string
  year: number
  title: string
  description: string
  icon?: string
  color?: string
}

interface TimelineProps {
  events: TimelineEvent[]
  onEventSelect?: (event: TimelineEvent) => void
}

export function Timeline({ events, onEventSelect }: TimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { currentEventId, setCurrentEvent } = useTimelineStore()

  useEffect(() => {
    if (!containerRef.current) return

    const items = containerRef.current.querySelectorAll('.timeline-item')

    items.forEach((item, index) => {
      gsap.from(item, {
        scrollTrigger: {
          trigger: item,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
        opacity: 0,
        x: index % 2 === 0 ? -50 : 50,
        duration: 0.6,
        ease: 'power2.out',
      })
    })

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill())
    }
  }, [events])

  return (
    <div ref={containerRef} className="timeline-container">
      <div className="timeline-line" />
      {events.map((event, index) => (
        <div
          key={event.id}
          className={`timeline-item ${currentEventId === event.id ? 'active' : ''}`}
          onClick={() => {
            setCurrentEvent(event.id)
            onEventSelect?.(event)
          }}
        >
          <div className="timeline-dot" style={{ backgroundColor: event.color }} />
          <div className="timeline-content">
            <span className="timeline-year">
              {event.year < 0 ? `公元前${Math.abs(event.year)}年` : `${event.year}年`}
            </span>
            <h3 className="timeline-title">{event.title}</h3>
            <p className="timeline-description">{event.description}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
```

---

## 🗃️ 状态管理设计

### Store 结构

```typescript
// src/stores/index.ts
export { useSceneStore } from './sceneStore'
export { useStoryStore } from './storyStore'
export { useTimelineStore } from './timelineStore'
export { useProgressStore } from './progressStore'
export { useUIStore } from './uiStore'
```

### Scene Store

```typescript
// src/stores/sceneStore.ts
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { Vector3Tuple } from 'three'

interface SceneState {
  // 场景状态
  isLoading: boolean
  loadProgress: number
  quality: 'low' | 'medium' | 'high'

  // 相机状态
  cameraPosition: Vector3Tuple
  cameraTarget: Vector3Tuple

  // 选中状态
  selectedObjectId: string | null
  hoveredObjectId: string | null

  // Actions
  setLoading: (loading: boolean) => void
  setProgress: (progress: number) => void
  setQuality: (quality: 'low' | 'medium' | 'high') => void
  setCameraPosition: (position: Vector3Tuple) => void
  setCameraTarget: (target: Vector3Tuple) => void
  selectObject: (id: string | null) => void
  hoverObject: (id: string | null) => void
}

export const useSceneStore = create<SceneState>()(
  devtools(
    (set) => ({
      // 初始状态
      isLoading: true,
      loadProgress: 0,
      quality: 'medium',
      cameraPosition: [0, 5, 10],
      cameraTarget: [0, 0, 0],
      selectedObjectId: null,
      hoveredObjectId: null,

      // Actions
      setLoading: (loading) => set({ isLoading: loading }),
      setProgress: (progress) => set({ loadProgress: progress }),
      setQuality: (quality) => set({ quality }),
      setCameraPosition: (position) => set({ cameraPosition: position }),
      setCameraTarget: (target) => set({ cameraTarget: target }),
      selectObject: (id) => set({ selectedObjectId: id }),
      hoverObject: (id) => set({ hoveredObjectId: id }),
    }),
    { name: 'scene-store' },
  ),
)
```

### Story Store

```typescript
// src/stores/storyStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Story {
  id: string
  title: string
  era: string
  duration: string
  progress: number
}

interface StoryState {
  currentStory: Story | null
  storyList: Story[]

  // Actions
  setCurrentStory: (story: Story) => void
  updateProgress: (storyId: string, progress: number) => void
  loadStoryList: () => Promise<void>
}

export const useStoryStore = create<StoryState>()(
  persist(
    (set, get) => ({
      currentStory: null,
      storyList: [],

      setCurrentStory: (story) => set({ currentStory: story }),

      updateProgress: (storyId, progress) => {
        const { storyList } = get()
        set({
          storyList: storyList.map((s) => (s.id === storyId ? { ...s, progress } : s)),
        })
      },

      loadStoryList: async () => {
        const response = await fetch('/api/stories')
        const stories = await response.json()
        set({ storyList: stories })
      },
    }),
    { name: 'story-store' },
  ),
)
```

---

## 🔌 Hooks 库

### useGSAPAnimation

```typescript
// src/hooks/useGSAPAnimation.ts
import { useRef, useEffect } from 'react'
import gsap from 'gsap'

interface AnimationConfig {
  from?: gsap.TweenVars
  to?: gsap.TweenVars
  duration?: number
  ease?: string
  delay?: number
  onComplete?: () => void
}

export function useGSAPAnimation<T extends HTMLElement>(config: AnimationConfig, deps: any[] = []) {
  const ref = useRef<T>(null)
  const tweenRef = useRef<gsap.core.Tween | null>(null)

  useEffect(() => {
    if (!ref.current) return

    if (config.from && config.to) {
      tweenRef.current = gsap.fromTo(ref.current, config.from, {
        ...config.to,
        duration: config.duration ?? 1,
        ease: config.ease ?? 'power2.out',
        delay: config.delay ?? 0,
        onComplete: config.onComplete,
      })
    } else if (config.to) {
      tweenRef.current = gsap.to(ref.current, {
        ...config.to,
        duration: config.duration ?? 1,
        ease: config.ease ?? 'power2.out',
        delay: config.delay ?? 0,
        onComplete: config.onComplete,
      })
    }

    return () => {
      tweenRef.current?.kill()
    }
  }, deps)

  return ref
}
```

### useThreeAnimation

```typescript
// src/hooks/useThreeAnimation.ts
import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import gsap from 'gsap'
import type { Object3D } from 'three'

interface ThreeAnimationConfig {
  position?: { from: [number, number, number]; to: [number, number, number] }
  rotation?: { from: [number, number, number]; to: [number, number, number] }
  scale?: { from: number; to: number }
  duration?: number
  ease?: string
  loop?: boolean
}

export function useThreeAnimation(config: ThreeAnimationConfig) {
  const ref = useRef<Object3D>(null)
  const timelineRef = useRef<gsap.core.Timeline | null>(null)

  useEffect(() => {
    if (!ref.current) return

    const tl = gsap.timeline({
      repeat: config.loop ? -1 : 0,
      yoyo: config.loop,
    })

    if (config.position) {
      tl.fromTo(
        ref.current.position,
        { x: config.position.from[0], y: config.position.from[1], z: config.position.from[2] },
        {
          x: config.position.to[0],
          y: config.position.to[1],
          z: config.position.to[2],
          duration: config.duration ?? 1,
          ease: config.ease ?? 'power2.inOut',
        },
        0,
      )
    }

    if (config.rotation) {
      tl.fromTo(
        ref.current.rotation,
        { x: config.rotation.from[0], y: config.rotation.from[1], z: config.rotation.from[2] },
        {
          x: config.rotation.to[0],
          y: config.rotation.to[1],
          z: config.rotation.to[2],
          duration: config.duration ?? 1,
          ease: config.ease ?? 'power2.inOut',
        },
        0,
      )
    }

    if (config.scale) {
      tl.fromTo(
        ref.current.scale,
        { x: config.scale.from, y: config.scale.from, z: config.scale.from },
        {
          x: config.scale.to,
          y: config.scale.to,
          z: config.scale.to,
          duration: config.duration ?? 1,
          ease: config.ease ?? 'power2.inOut',
        },
        0,
      )
    }

    timelineRef.current = tl

    return () => {
      tl.kill()
    }
  }, [config])

  return { ref, timeline: timelineRef }
}
```

### useResourceLoader

```typescript
// src/hooks/useResourceLoader.ts
import { useState, useEffect } from 'react'
import { useGLTF, useTexture } from '@react-three/drei'

interface ResourceConfig {
  models?: string[]
  textures?: string[]
  audio?: string[]
}

interface LoadingState {
  isLoading: boolean
  progress: number
  error: Error | null
}

export function useResourceLoader(config: ResourceConfig) {
  const [state, setState] = useState<LoadingState>({
    isLoading: true,
    progress: 0,
    error: null,
  })

  useEffect(() => {
    const totalResources =
      (config.models?.length ?? 0) + (config.textures?.length ?? 0) + (config.audio?.length ?? 0)

    if (totalResources === 0) {
      setState({ isLoading: false, progress: 100, error: null })
      return
    }

    let loadedCount = 0

    const updateProgress = () => {
      loadedCount++
      const progress = (loadedCount / totalResources) * 100
      setState((prev) => ({ ...prev, progress }))

      if (loadedCount === totalResources) {
        setState((prev) => ({ ...prev, isLoading: false }))
      }
    }

    // 预加载模型
    config.models?.forEach((url) => {
      useGLTF.preload(url)
      updateProgress()
    })

    // 预加载纹理
    config.textures?.forEach((url) => {
      useTexture.preload(url)
      updateProgress()
    })

    // 预加载音频
    config.audio?.forEach((url) => {
      const audio = new Audio()
      audio.src = url
      audio.oncanplaythrough = updateProgress
      audio.onerror = () => {
        setState((prev) => ({
          ...prev,
          error: new Error(`Failed to load audio: ${url}`),
        }))
      }
    })
  }, [config])

  return state
}
```

---

## 📐 TypeScript 类型定义

### 场景类型

```typescript
// src/types/scene.types.ts
import type { Vector3Tuple, EulerTuple } from 'three'

export interface SceneConfig {
  meta: SceneMeta
  camera: CameraConfig
  lights: LightsConfig
  objects: ObjectConfig[]
  environment?: EnvironmentConfig
  postProcessing?: PostProcessingConfig
}

export interface SceneMeta {
  name: string
  version: string
  description?: string
  author?: string
}

export interface CameraConfig {
  type: 'perspective' | 'orthographic'
  position: Vector3Tuple
  target: Vector3Tuple
  fov?: number
  near?: number
  far?: number
}

export interface LightsConfig {
  ambient?: AmbientLightConfig
  directional?: DirectionalLightConfig[]
  point?: PointLightConfig[]
  spot?: SpotLightConfig[]
}

export interface ObjectConfig {
  id: string
  type: 'gltf' | 'mesh' | 'particles' | 'text'
  url?: string
  position: Vector3Tuple
  rotation?: EulerTuple
  scale?: number | Vector3Tuple
  material?: MaterialConfig
  animation?: AnimationConfig
  interactive?: InteractiveConfig
}
```

### 故事类型

```typescript
// src/types/story.types.ts
export interface Story {
  id: string
  title: string
  era: string
  duration: string
  difficulty: 'easy' | 'medium' | 'hard'
  tags: string[]
  thumbnail?: string
  scenes: Scene[]
  characters: Character[]
  artifacts: Artifact[]
  timeline: TimelineEvent[]
  quizzes: Quiz[]
}

export interface Scene {
  id: string
  name: string
  environment: string
  lighting: string
  camera: CameraConfig
  model?: string
  music?: string
}

export interface Character {
  id: string
  name: string
  title: string
  role: 'emperor' | 'general' | 'scholar' | 'commoner' | 'narrator'
  model: string
  position: Vector3Tuple
  dialogs?: Dialog[]
}

export interface TimelineEvent {
  id: string
  year: number
  title: string
  description: string
  icon?: string
  color?: string
  highlight?: boolean
}

export interface Quiz {
  id: string
  type: 'multiple-choice' | 'drag-and-match' | 'short-answer'
  question: string
  options?: string[]
  correctAnswer: string | string[]
  explanation?: string
  points: number
}
```

---

## ✅ 代码层检查清单

### 组件完整性

- [ ] Scene 主场景组件
- [ ] Camera 相机控制组件
- [ ] Lights 灯光系统组件
- [ ] GLTFModel 模型加载组件
- [ ] Timeline 时间轴组件
- [ ] InfoCard 信息卡片组件
- [ ] Quiz 测验组件

### 状态管理

- [ ] SceneStore 场景状态
- [ ] StoryStore 故事状态
- [ ] TimelineStore 时间轴状态
- [ ] ProgressStore 进度状态
- [ ] UIStore UI 状态

### Hooks

- [ ] useGSAPAnimation
- [ ] useThreeAnimation
- [ ] useResourceLoader
- [ ] useSceneManager
- [ ] useInteraction

### 类型定义

- [ ] scene.types.ts
- [ ] story.types.ts
- [ ] animation.types.ts
- [ ] events.types.ts

---

## 📚 相关文档

- [REACT-TEMPLATES.md](./REACT-TEMPLATES.md) - React 组件详细模板
- [THREEJS-COMPONENTS.md](./THREEJS-COMPONENTS.md) - Three.js 组件详解
- [STATE-MANAGEMENT.md](./STATE-MANAGEMENT.md) - 状态管理完整指南
- [API-SPECIFICATION.md](./API-SPECIFICATION.md) - API 接口规范

---

**代码层是技术实现的核心，确保组件可复用、类型安全、性能优化！**
