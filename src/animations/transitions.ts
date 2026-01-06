import { gsap } from './gsap.config'

type AnimationTarget = HTMLElement | null

export const pageTransitions = {
  // 淡入淡出
  fade: {
    enter: (element: AnimationTarget) => {
      if (!element) return null
      return gsap.fromTo(
        element,
        { opacity: 0 },
        { opacity: 1, duration: 0.5, ease: 'power2.inOut' }
      )
    },
    exit: (element: AnimationTarget) => {
      if (!element) return null
      return gsap.to(element, { opacity: 0, duration: 0.5, ease: 'power2.inOut' })
    },
  },

  // 滑动转场
  slide: {
    enter: (element: AnimationTarget, direction: 'left' | 'right' = 'right') => {
      if (!element) return null
      const x = direction === 'right' ? '100%' : '-100%'
      return gsap.fromTo(
        element,
        { x, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }
      )
    },
    exit: (element: AnimationTarget, direction: 'left' | 'right' = 'left') => {
      if (!element) return null
      const x = direction === 'left' ? '-100%' : '100%'
      return gsap.to(element, { x, opacity: 0, duration: 0.6, ease: 'power3.in' })
    },
  },

  // 缩放转场
  zoom: {
    enter: (element: AnimationTarget) => {
      if (!element) return null
      return gsap.fromTo(
        element,
        { scale: 1.2, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.6, ease: 'power2.out' }
      )
    },
    exit: (element: AnimationTarget) => {
      if (!element) return null
      return gsap.to(element, { scale: 0.8, opacity: 0, duration: 0.4, ease: 'power2.in' })
    },
  },

  // 遮罩转场
  curtain: {
    enter: async (element: AnimationTarget) => {
      if (!element) return
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
    exit: async (_element: AnimationTarget) => {
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
    enter: async (element: AnimationTarget, originX = 50, originY = 50) => {
      if (!element) return
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

  // 分割转场
  split: {
    enter: async (element: AnimationTarget) => {
      if (!element) return

      const topCurtain = document.createElement('div')
      const bottomCurtain = document.createElement('div')

      const curtainStyle = `
        position: fixed;
        left: 0;
        width: 100%;
        height: 50%;
        background: #000;
        z-index: 9999;
      `

      topCurtain.style.cssText = curtainStyle + 'top: 0;'
      bottomCurtain.style.cssText = curtainStyle + 'bottom: 0;'

      document.body.appendChild(topCurtain)
      document.body.appendChild(bottomCurtain)

      gsap.set(element, { opacity: 1 })

      await gsap.to([topCurtain, bottomCurtain], {
        scaleY: 0,
        duration: 0.6,
        ease: 'power3.inOut',
        stagger: 0.1,
      })

      topCurtain.remove()
      bottomCurtain.remove()
    },
  },

  // 翻页效果
  flip: {
    enter: (element: AnimationTarget) => {
      if (!element) return null
      return gsap.fromTo(
        element,
        { rotateY: -90, opacity: 0, transformPerspective: 1000 },
        { rotateY: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
      )
    },
    exit: (element: AnimationTarget) => {
      if (!element) return null
      return gsap.to(element, {
        rotateY: 90,
        opacity: 0,
        duration: 0.6,
        ease: 'power3.in',
        transformPerspective: 1000,
      })
    },
  },
}

// 场景内转场
export const sceneTransitions = {
  // 相机推进
  dollyIn: (timeline: gsap.core.Timeline, cameraPosition: THREE.Vector3, targetPosition: THREE.Vector3, duration = 1.5) => {
    timeline.to(cameraPosition, {
      x: targetPosition.x,
      y: targetPosition.y,
      z: targetPosition.z,
      duration,
      ease: 'power2.inOut',
    })
  },

  // 场景淡入淡出
  crossFade: (timeline: gsap.core.Timeline, fromOpacity: { value: number }, toOpacity: { value: number }, duration = 0.5) => {
    timeline.to(fromOpacity, { value: 0, duration })
    timeline.to(toOpacity, { value: 1, duration }, `-=${duration * 0.5}`)
  },
}

// THREE.js 类型导入
import * as THREE from 'three'
