---
id: layer-5-animation
title: Layer 5 动效层
version: 1.0.0
status: published
layer: 5
created: 2024-01-05
updated: 2024-01-05
---

# Layer 5: 动效层 (Animation Layer)

> 提供丝滑的动画效果、视觉特效和转场系统

---

## 概述

动效层是实现"酷炫"视觉体验的关键，负责：

1. **GSAP 动画模板** - 2D UI 动画库
2. **Three.js 特效** - 3D 视觉效果
3. **转场系统** - 页面/场景切换效果
4. **微交互** - 细节动画反馈

---

## 目录结构

```
05-animation/
├── README.md                 # 本文件
├── GSAP-TEMPLATES.md         # GSAP 动画模板库
├── THREEJS-EFFECTS.md        # Three.js 视觉特效
├── TRANSITIONS.md            # 转场效果系统
├── MICRO-INTERACTIONS.md     # 微交互动画
└── presets/                  # 动效预设
    ├── entrance.preset.md    # 入场动画预设
    ├── scroll.preset.md      # 滚动动画预设
    ├── hover.preset.md       # 悬停效果预设
    └── page-transition.preset.md  # 页面转场预设
```

---

## 🚀 GSAP 动画模板库

### 核心配置

```typescript
// src/config/gsap.config.ts
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { CustomEase } from 'gsap/CustomEase'

// 注册插件
gsap.registerPlugin(ScrollTrigger, CustomEase)

// 自定义缓动函数
CustomEase.create('smoothOut', 'M0,0 C0.25,0.1 0.25,1 1,1')
CustomEase.create('bounceOut', 'M0,0 C0.5,1.5 0.75,1 1,1')
CustomEase.create('elastic', 'M0,0 C0.5,1.8 0.75,0.9 1,1')
CustomEase.create('dramatic', 'M0,0 C0.7,0 0.3,1 1,1')

// 全局默认配置
gsap.defaults({
  duration: 0.8,
  ease: 'smoothOut',
})

// 性能配置
gsap.config({
  force3D: true,
  nullTargetWarn: false,
})

export { gsap, ScrollTrigger, CustomEase }
```

### 入场动画预设

```typescript
// src/animations/entrance.ts
import gsap from 'gsap'

export const entrancePresets = {
  // 淡入上移
  fadeInUp: (element: HTMLElement | string, options = {}) => {
    return gsap.from(element, {
      opacity: 0,
      y: 60,
      duration: 0.8,
      ease: 'smoothOut',
      ...options,
    })
  },

  // 淡入缩放
  fadeInScale: (element: HTMLElement | string, options = {}) => {
    return gsap.from(element, {
      opacity: 0,
      scale: 0.8,
      duration: 0.6,
      ease: 'back.out(1.7)',
      ...options,
    })
  },

  // 从左侧滑入
  slideInLeft: (element: HTMLElement | string, options = {}) => {
    return gsap.from(element, {
      opacity: 0,
      x: -100,
      duration: 0.7,
      ease: 'power3.out',
      ...options,
    })
  },

  // 从右侧滑入
  slideInRight: (element: HTMLElement | string, options = {}) => {
    return gsap.from(element, {
      opacity: 0,
      x: 100,
      duration: 0.7,
      ease: 'power3.out',
      ...options,
    })
  },

  // 弹性缩放
  popIn: (element: HTMLElement | string, options = {}) => {
    return gsap.from(element, {
      opacity: 0,
      scale: 0,
      duration: 0.5,
      ease: 'elastic.out(1, 0.5)',
      ...options,
    })
  },

  // 旋转入场
  rotateIn: (element: HTMLElement | string, options = {}) => {
    return gsap.from(element, {
      opacity: 0,
      rotation: -180,
      scale: 0.5,
      duration: 0.8,
      ease: 'back.out(1.7)',
      ...options,
    })
  },

  // 模糊淡入
  blurIn: (element: HTMLElement | string, options = {}) => {
    return gsap.from(element, {
      opacity: 0,
      filter: 'blur(20px)',
      duration: 0.8,
      ease: 'power2.out',
      ...options,
    })
  },

  // 文字逐字显示
  textReveal: (element: HTMLElement | string, options = {}) => {
    const target = typeof element === 'string' ? document.querySelector(element) : element
    if (!target) return null

    const text = target.textContent || ''
    target.innerHTML = text.split('').map(char =>
      `<span class="char">${char === ' ' ? '&nbsp;' : char}</span>`
    ).join('')

    return gsap.from(target.querySelectorAll('.char'), {
      opacity: 0,
      y: 20,
      stagger: 0.03,
      duration: 0.4,
      ease: 'power2.out',
      ...options,
    })
  },

  // 分组交错入场
  staggerIn: (elements: HTMLElement[] | string, options = {}) => {
    return gsap.from(elements, {
      opacity: 0,
      y: 40,
      stagger: {
        amount: 0.6,
        from: 'start',
      },
      duration: 0.6,
      ease: 'power3.out',
      ...options,
    })
  },
}
```

### 滚动触发动画

```typescript
// src/animations/scroll.ts
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export const scrollPresets = {
  // 滚动淡入
  scrollFadeIn: (element: HTMLElement | string, options = {}) => {
    return gsap.from(element, {
      scrollTrigger: {
        trigger: element,
        start: 'top 80%',
        end: 'bottom 20%',
        toggleActions: 'play none none reverse',
        ...options.scrollTrigger,
      },
      opacity: 0,
      y: 60,
      duration: 0.8,
      ease: 'power2.out',
    })
  },

  // 视差效果
  parallax: (element: HTMLElement | string, options = {}) => {
    return gsap.to(element, {
      scrollTrigger: {
        trigger: element,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1,
        ...options.scrollTrigger,
      },
      y: options.distance || -100,
      ease: 'none',
    })
  },

  // 水平滚动
  horizontalScroll: (container: HTMLElement | string, options = {}) => {
    const sections = gsap.utils.toArray(`${container} > *`)

    return gsap.to(sections, {
      xPercent: -100 * (sections.length - 1),
      ease: 'none',
      scrollTrigger: {
        trigger: container,
        pin: true,
        scrub: 1,
        snap: 1 / (sections.length - 1),
        end: () => '+=' + document.querySelector(container)?.scrollWidth,
        ...options.scrollTrigger,
      },
    })
  },

  // 进度条动画
  progressBar: (element: HTMLElement | string, options = {}) => {
    return gsap.to(element, {
      scrollTrigger: {
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.3,
      },
      scaleX: 1,
      transformOrigin: 'left center',
      ease: 'none',
    })
  },

  // 固定元素渐变
  pinWithFade: (element: HTMLElement | string, options = {}) => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: element,
        start: 'top top',
        end: '+=200%',
        pin: true,
        scrub: 1,
        ...options.scrollTrigger,
      },
    })

    tl.to(element, { opacity: 1, duration: 0.5 })
      .to(element, { opacity: 1, duration: 1 })
      .to(element, { opacity: 0, duration: 0.5 })

    return tl
  },

  // 时间轴滚动联动
  timelineScrub: (container: HTMLElement | string, items: HTMLElement[] | string) => {
    const elements = typeof items === 'string'
      ? gsap.utils.toArray(items)
      : items

    return gsap.to(elements, {
      scrollTrigger: {
        trigger: container,
        start: 'top center',
        end: 'bottom center',
        scrub: 1,
      },
      opacity: 1,
      y: 0,
      stagger: 0.2,
    })
  },
}
```

### 悬停效果

```typescript
// src/animations/hover.ts
import gsap from 'gsap'

export const hoverPresets = {
  // 缩放悬停
  scaleHover: (element: HTMLElement | string) => {
    const target = typeof element === 'string' ? document.querySelector(element) : element
    if (!target) return

    target.addEventListener('mouseenter', () => {
      gsap.to(target, { scale: 1.05, duration: 0.3, ease: 'power2.out' })
    })

    target.addEventListener('mouseleave', () => {
      gsap.to(target, { scale: 1, duration: 0.3, ease: 'power2.out' })
    })
  },

  // 发光悬停
  glowHover: (element: HTMLElement | string) => {
    const target = typeof element === 'string' ? document.querySelector(element) : element
    if (!target) return

    target.addEventListener('mouseenter', () => {
      gsap.to(target, {
        boxShadow: '0 0 30px rgba(255, 200, 100, 0.5)',
        duration: 0.3,
      })
    })

    target.addEventListener('mouseleave', () => {
      gsap.to(target, {
        boxShadow: '0 0 0px rgba(255, 200, 100, 0)',
        duration: 0.3,
      })
    })
  },

  // 3D 倾斜效果
  tiltHover: (element: HTMLElement) => {
    const handleMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const centerX = rect.width / 2
      const centerY = rect.height / 2
      const rotateX = (y - centerY) / 10
      const rotateY = (centerX - x) / 10

      gsap.to(element, {
        rotateX,
        rotateY,
        duration: 0.3,
        ease: 'power2.out',
        transformPerspective: 1000,
      })
    }

    const handleLeave = () => {
      gsap.to(element, {
        rotateX: 0,
        rotateY: 0,
        duration: 0.5,
        ease: 'power2.out',
      })
    }

    element.addEventListener('mousemove', handleMove)
    element.addEventListener('mouseleave', handleLeave)

    return () => {
      element.removeEventListener('mousemove', handleMove)
      element.removeEventListener('mouseleave', handleLeave)
    }
  },

  // 磁性吸附效果
  magneticHover: (element: HTMLElement) => {
    const handleMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect()
      const x = e.clientX - rect.left - rect.width / 2
      const y = e.clientY - rect.top - rect.height / 2

      gsap.to(element, {
        x: x * 0.3,
        y: y * 0.3,
        duration: 0.3,
        ease: 'power2.out',
      })
    }

    const handleLeave = () => {
      gsap.to(element, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: 'elastic.out(1, 0.5)',
      })
    }

    element.addEventListener('mousemove', handleMove)
    element.addEventListener('mouseleave', handleLeave)

    return () => {
      element.removeEventListener('mousemove', handleMove)
      element.removeEventListener('mouseleave', handleLeave)
    }
  },
}
```

---

## 🌟 Three.js 视觉特效

### 粒子系统

```typescript
// src/components/effects/Particles.tsx
import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface ParticlesProps {
  count?: number
  size?: number
  color?: string
  spread?: number
  speed?: number
}

export function Particles({
  count = 1000,
  size = 0.02,
  color = '#ffffff',
  spread = 10,
  speed = 0.001,
}: ParticlesProps) {
  const meshRef = useRef<THREE.Points>(null)

  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const velocities = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * spread
      positions[i * 3 + 1] = (Math.random() - 0.5) * spread
      positions[i * 3 + 2] = (Math.random() - 0.5) * spread

      velocities[i * 3] = (Math.random() - 0.5) * speed
      velocities[i * 3 + 1] = (Math.random() - 0.5) * speed
      velocities[i * 3 + 2] = (Math.random() - 0.5) * speed
    }

    return { positions, velocities }
  }, [count, spread, speed])

  useFrame(() => {
    if (!meshRef.current) return

    const positions = meshRef.current.geometry.attributes.position.array as Float32Array

    for (let i = 0; i < count; i++) {
      positions[i * 3] += particles.velocities[i * 3]
      positions[i * 3 + 1] += particles.velocities[i * 3 + 1]
      positions[i * 3 + 2] += particles.velocities[i * 3 + 2]

      // 边界检测
      if (Math.abs(positions[i * 3]) > spread / 2) {
        particles.velocities[i * 3] *= -1
      }
      if (Math.abs(positions[i * 3 + 1]) > spread / 2) {
        particles.velocities[i * 3 + 1] *= -1
      }
      if (Math.abs(positions[i * 3 + 2]) > spread / 2) {
        particles.velocities[i * 3 + 2] *= -1
      }
    }

    meshRef.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particles.positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={size}
        color={color}
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  )
}
```

### 发光轮廓效果

```typescript
// src/components/effects/GlowOutline.tsx
import { useRef, useEffect } from 'react'
import { useThree, extend } from '@react-three/fiber'
import { EffectComposer, SelectiveBloom } from '@react-three/postprocessing'
import * as THREE from 'three'

interface GlowOutlineProps {
  children: React.ReactNode
  intensity?: number
  color?: string
  enabled?: boolean
}

export function GlowOutline({
  children,
  intensity = 2,
  color = '#ffcc00',
  enabled = true,
}: GlowOutlineProps) {
  const groupRef = useRef<THREE.Group>(null)

  if (!enabled) return <>{children}</>

  return (
    <>
      <group ref={groupRef}>
        {children}
      </group>
      <EffectComposer>
        <SelectiveBloom
          lights={[]}
          selection={groupRef}
          intensity={intensity}
          luminanceThreshold={0.1}
          luminanceSmoothing={0.9}
        />
      </EffectComposer>
    </>
  )
}
```

### 相机动画

```typescript
// src/hooks/useCameraAnimation.ts
import { useRef, useCallback } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import gsap from 'gsap'
import * as THREE from 'three'

interface CameraAnimationConfig {
  position?: [number, number, number]
  target?: [number, number, number]
  duration?: number
  ease?: string
  onComplete?: () => void
}

export function useCameraAnimation() {
  const { camera } = useThree()
  const targetRef = useRef(new THREE.Vector3())
  const isAnimatingRef = useRef(false)

  const animateTo = useCallback((config: CameraAnimationConfig) => {
    const {
      position,
      target,
      duration = 1.5,
      ease = 'power2.inOut',
      onComplete,
    } = config

    isAnimatingRef.current = true

    const tl = gsap.timeline({
      onComplete: () => {
        isAnimatingRef.current = false
        onComplete?.()
      },
    })

    if (position) {
      tl.to(camera.position, {
        x: position[0],
        y: position[1],
        z: position[2],
        duration,
        ease,
      }, 0)
    }

    if (target) {
      tl.to(targetRef.current, {
        x: target[0],
        y: target[1],
        z: target[2],
        duration,
        ease,
        onUpdate: () => {
          camera.lookAt(targetRef.current)
        },
      }, 0)
    }

    return tl
  }, [camera])

  const shake = useCallback((intensity = 0.1, duration = 0.5) => {
    const originalPos = camera.position.clone()

    return gsap.to(camera.position, {
      x: `+=${Math.random() * intensity - intensity / 2}`,
      y: `+=${Math.random() * intensity - intensity / 2}`,
      duration: 0.05,
      repeat: duration / 0.05,
      yoyo: true,
      ease: 'none',
      onComplete: () => {
        camera.position.copy(originalPos)
      },
    })
  }, [camera])

  const orbit = useCallback((
    center: [number, number, number],
    radius: number,
    duration = 10,
    loops = -1
  ) => {
    let angle = 0

    return gsap.to({}, {
      duration,
      repeat: loops,
      ease: 'none',
      onUpdate: function() {
        angle = this.progress() * Math.PI * 2
        camera.position.x = center[0] + Math.cos(angle) * radius
        camera.position.z = center[2] + Math.sin(angle) * radius
        camera.lookAt(center[0], center[1], center[2])
      },
    })
  }, [camera])

  return { animateTo, shake, orbit, isAnimating: isAnimatingRef.current }
}
```

---

## 🔄 转场效果系统

### 页面转场

```typescript
// src/animations/transitions.ts
import gsap from 'gsap'

export const pageTransitions = {
  // 淡入淡出
  fade: {
    enter: (element: HTMLElement) => {
      return gsap.fromTo(element,
        { opacity: 0 },
        { opacity: 1, duration: 0.5, ease: 'power2.inOut' }
      )
    },
    exit: (element: HTMLElement) => {
      return gsap.to(element, { opacity: 0, duration: 0.5, ease: 'power2.inOut' })
    },
  },

  // 滑动转场
  slide: {
    enter: (element: HTMLElement, direction: 'left' | 'right' = 'right') => {
      const x = direction === 'right' ? '100%' : '-100%'
      return gsap.fromTo(element,
        { x, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }
      )
    },
    exit: (element: HTMLElement, direction: 'left' | 'right' = 'left') => {
      const x = direction === 'left' ? '-100%' : '100%'
      return gsap.to(element, { x, opacity: 0, duration: 0.6, ease: 'power3.in' })
    },
  },

  // 缩放转场
  zoom: {
    enter: (element: HTMLElement) => {
      return gsap.fromTo(element,
        { scale: 1.2, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.6, ease: 'power2.out' }
      )
    },
    exit: (element: HTMLElement) => {
      return gsap.to(element, { scale: 0.8, opacity: 0, duration: 0.4, ease: 'power2.in' })
    },
  },

  // 遮罩转场
  curtain: {
    enter: async (element: HTMLElement) => {
      const curtain = document.createElement('div')
      curtain.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: #000;
        z-index: 9999;
      `
      document.body.appendChild(curtain)

      gsap.set(element, { opacity: 1 })

      await gsap.to(curtain, {
        scaleY: 0,
        transformOrigin: 'top center',
        duration: 0.6,
        ease: 'power3.inOut',
      })

      curtain.remove()
    },
    exit: async (element: HTMLElement) => {
      const curtain = document.createElement('div')
      curtain.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: #000;
        z-index: 9999;
        transform: scaleY(0);
        transform-origin: bottom center;
      `
      document.body.appendChild(curtain)

      await gsap.to(curtain, {
        scaleY: 1,
        duration: 0.6,
        ease: 'power3.inOut',
      })
    },
  },

  // 圆形遮罩转场
  circleReveal: {
    enter: async (element: HTMLElement, originX = 50, originY = 50) => {
      const mask = document.createElement('div')
      mask.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: radial-gradient(circle at ${originX}% ${originY}%, transparent 0%, #000 0%);
        z-index: 9999;
      `
      document.body.appendChild(mask)

      gsap.set(element, { opacity: 1 })

      await gsap.to(mask, {
        background: `radial-gradient(circle at ${originX}% ${originY}%, transparent 150%, #000 150%)`,
        duration: 0.8,
        ease: 'power3.inOut',
      })

      mask.remove()
    },
  },
}
```

### 3D 场景转场

```typescript
// src/animations/sceneTransitions.ts
import gsap from 'gsap'
import * as THREE from 'three'

export const sceneTransitions = {
  // 相机推进转场
  dollyIn: (camera: THREE.Camera, targetPosition: THREE.Vector3, duration = 1.5) => {
    return gsap.to(camera.position, {
      x: targetPosition.x,
      y: targetPosition.y,
      z: targetPosition.z,
      duration,
      ease: 'power2.inOut',
    })
  },

  // 相机环绕转场
  orbitTransition: (
    camera: THREE.Camera,
    center: THREE.Vector3,
    startAngle: number,
    endAngle: number,
    radius: number,
    duration = 2
  ) => {
    return gsap.to({ angle: startAngle }, {
      angle: endAngle,
      duration,
      ease: 'power2.inOut',
      onUpdate: function() {
        const angle = this.targets()[0].angle
        camera.position.x = center.x + Math.cos(angle) * radius
        camera.position.z = center.z + Math.sin(angle) * radius
        camera.lookAt(center)
      },
    })
  },

  // 场景淡入淡出
  sceneFade: (scene: THREE.Scene, fadeIn: boolean, duration = 0.5) => {
    const materials: THREE.Material[] = []
    scene.traverse((obj) => {
      if ((obj as THREE.Mesh).material) {
        const material = (obj as THREE.Mesh).material as THREE.Material
        if (!materials.includes(material)) {
          materials.push(material)
        }
      }
    })

    return gsap.to(materials, {
      opacity: fadeIn ? 1 : 0,
      duration,
      ease: 'power2.inOut',
    })
  },

  // 物体飞入效果
  objectFlyIn: (objects: THREE.Object3D[], origin: THREE.Vector3, stagger = 0.1) => {
    const targets = objects.map(obj => ({
      obj,
      targetPos: obj.position.clone(),
    }))

    targets.forEach(({ obj }) => {
      obj.position.copy(origin)
    })

    return gsap.to(targets, {
      duration: 1,
      stagger,
      ease: 'back.out(1.7)',
      onUpdate: function() {
        targets.forEach(({ obj, targetPos }, i) => {
          const progress = this.progress()
          obj.position.lerpVectors(origin, targetPos, progress)
        })
      },
    })
  },
}
```

---

## ✨ 微交互动画

### 按钮交互

```typescript
// src/components/ui/AnimatedButton.tsx
import { useRef, useEffect } from 'react'
import gsap from 'gsap'

interface AnimatedButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'ghost'
  className?: string
}

export function AnimatedButton({
  children,
  onClick,
  variant = 'primary',
  className = '',
}: AnimatedButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const rippleRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const button = buttonRef.current
    if (!button) return

    // 悬停效果
    const handleEnter = () => {
      gsap.to(button, {
        scale: 1.02,
        duration: 0.2,
        ease: 'power2.out',
      })
    }

    const handleLeave = () => {
      gsap.to(button, {
        scale: 1,
        duration: 0.2,
        ease: 'power2.out',
      })
    }

    button.addEventListener('mouseenter', handleEnter)
    button.addEventListener('mouseleave', handleLeave)

    return () => {
      button.removeEventListener('mouseenter', handleEnter)
      button.removeEventListener('mouseleave', handleLeave)
    }
  }, [])

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = buttonRef.current
    const ripple = rippleRef.current
    if (!button || !ripple) return

    // 点击波纹效果
    const rect = button.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    ripple.style.left = `${x}px`
    ripple.style.top = `${y}px`

    gsap.fromTo(ripple,
      { scale: 0, opacity: 0.5 },
      { scale: 4, opacity: 0, duration: 0.6, ease: 'power2.out' }
    )

    // 点击缩放
    gsap.to(button, {
      scale: 0.95,
      duration: 0.1,
      yoyo: true,
      repeat: 1,
    })

    onClick?.()
  }

  return (
    <button
      ref={buttonRef}
      onClick={handleClick}
      className={`animated-button ${variant} ${className}`}
      style={{ position: 'relative', overflow: 'hidden' }}
    >
      <span
        ref={rippleRef}
        style={{
          position: 'absolute',
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.3)',
          transform: 'translate(-50%, -50%) scale(0)',
          pointerEvents: 'none',
        }}
      />
      {children}
    </button>
  )
}
```

### 加载动画

```typescript
// src/components/ui/LoadingSpinner.tsx
import { useEffect, useRef } from 'react'
import gsap from 'gsap'

interface LoadingSpinnerProps {
  size?: number
  color?: string
  progress?: number // 0-100
}

export function LoadingSpinner({
  size = 60,
  color = '#ffd700',
  progress,
}: LoadingSpinnerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const dotsRef = useRef<HTMLDivElement[]>([])

  useEffect(() => {
    const dots = dotsRef.current

    // 无限旋转动画
    gsap.to(containerRef.current, {
      rotation: 360,
      duration: 2,
      repeat: -1,
      ease: 'none',
    })

    // 点的弹跳动画
    dots.forEach((dot, i) => {
      gsap.to(dot, {
        scale: 1.5,
        duration: 0.4,
        repeat: -1,
        yoyo: true,
        delay: i * 0.1,
        ease: 'power2.inOut',
      })
    })
  }, [])

  return (
    <div
      ref={containerRef}
      style={{
        width: size,
        height: size,
        position: 'relative',
      }}
    >
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          ref={(el) => { if (el) dotsRef.current[i] = el }}
          style={{
            position: 'absolute',
            width: size * 0.2,
            height: size * 0.2,
            borderRadius: '50%',
            background: color,
            top: i < 2 ? 0 : 'auto',
            bottom: i >= 2 ? 0 : 'auto',
            left: i % 2 === 0 ? 0 : 'auto',
            right: i % 2 === 1 ? 0 : 'auto',
          }}
        />
      ))}
      {progress !== undefined && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: size * 0.25,
          fontWeight: 'bold',
          color,
        }}>
          {Math.round(progress)}%
        </div>
      )}
    </div>
  )
}
```

---

## ✅ 动效层检查清单

### GSAP 动画
- [ ] 入场动画预设完整
- [ ] 滚动触发动画配置
- [ ] 悬停效果实现
- [ ] 自定义缓动函数

### Three.js 特效
- [ ] 粒子系统
- [ ] 后处理效果
- [ ] 相机动画
- [ ] 物体动画

### 转场系统
- [ ] 页面转场效果
- [ ] 3D 场景转场
- [ ] 转场时序控制
- [ ] 转场中断处理

### 微交互
- [ ] 按钮交互效果
- [ ] 加载动画
- [ ] 反馈动画
- [ ] 成功/失败提示

---

## 📚 相关文档

- [GSAP-TEMPLATES.md](./GSAP-TEMPLATES.md) - GSAP 完整模板库
- [THREEJS-EFFECTS.md](./THREEJS-EFFECTS.md) - Three.js 特效详解
- [TRANSITIONS.md](./TRANSITIONS.md) - 转场系统文档
- [MICRO-INTERACTIONS.md](./MICRO-INTERACTIONS.md) - 微交互设计

---

**动效层是打造"酷炫"体验的关键，让每一帧都充满生命力！**
