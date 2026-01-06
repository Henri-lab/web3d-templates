/**
 * Three.js 组件实验室 - 通用工具函数
 *
 * 这里放置一些真正通用的、跨组件使用的工具函数
 * 注意：不要过度封装，只放真正需要复用的代码
 */

import * as THREE from 'three'

/**
 * 创建渐变纹理
 * 用于各种需要渐变效果的材质
 */
export function createGradientTexture(
  colors: string[],
  size: number = 256,
  direction: 'horizontal' | 'vertical' = 'vertical'
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = direction === 'horizontal' ? size : 1
  canvas.height = direction === 'vertical' ? size : 1

  const ctx = canvas.getContext('2d')!
  const gradient =
    direction === 'vertical'
      ? ctx.createLinearGradient(0, 0, 0, size)
      : ctx.createLinearGradient(0, 0, size, 0)

  colors.forEach((color, i) => {
    gradient.addColorStop(i / (colors.length - 1), color)
  })

  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}

/**
 * 创建噪声纹理
 * 用于各种程序化效果
 */
export function createNoiseTexture(size: number = 256): THREE.DataTexture {
  const data = new Uint8Array(size * size * 4)

  for (let i = 0; i < size * size; i++) {
    const stride = i * 4
    const value = Math.random() * 255
    data[stride] = value
    data[stride + 1] = value
    data[stride + 2] = value
    data[stride + 3] = 255
  }

  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat)
  texture.needsUpdate = true
  return texture
}

/**
 * 简单的缓动函数集合
 * 用于动画效果
 */
export const easing = {
  // 平滑进出
  smoothstep: (t: number) => t * t * (3 - 2 * t),

  // 弹性效果
  elastic: (t: number) => {
    const c4 = (2 * Math.PI) / 3
    return t === 0
      ? 0
      : t === 1
      ? 1
      : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1
  },

  // 回弹效果
  bounce: (t: number) => {
    const n1 = 7.5625
    const d1 = 2.75
    if (t < 1 / d1) {
      return n1 * t * t
    } else if (t < 2 / d1) {
      return n1 * (t -= 1.5 / d1) * t + 0.75
    } else if (t < 2.5 / d1) {
      return n1 * (t -= 2.25 / d1) * t + 0.9375
    } else {
      return n1 * (t -= 2.625 / d1) * t + 0.984375
    }
  },

  // 指数进出
  expoInOut: (t: number) => {
    if (t === 0) return 0
    if (t === 1) return 1
    if (t < 0.5) {
      return Math.pow(2, 20 * t - 10) / 2
    }
    return (2 - Math.pow(2, -20 * t + 10)) / 2
  },
}

/**
 * 将角度转换为弧度
 */
export function degToRad(degrees: number): number {
  return degrees * (Math.PI / 180)
}

/**
 * 将弧度转换为角度
 */
export function radToDeg(radians: number): number {
  return radians * (180 / Math.PI)
}

/**
 * 线性插值
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t
}

/**
 * 将值限制在范围内
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

/**
 * 将值从一个范围映射到另一个范围
 */
export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin
}

/**
 * 生成随机范围内的数值
 */
export function randomRange(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

/**
 * 生成随机 Vector3
 */
export function randomVector3(
  minX: number,
  maxX: number,
  minY: number,
  maxY: number,
  minZ: number,
  maxZ: number
): THREE.Vector3 {
  return new THREE.Vector3(
    randomRange(minX, maxX),
    randomRange(minY, maxY),
    randomRange(minZ, maxZ)
  )
}

/**
 * 创建简单的颜色渐变
 */
export function lerpColor(
  color1: THREE.Color,
  color2: THREE.Color,
  t: number
): THREE.Color {
  return new THREE.Color().lerpColors(color1, color2, t)
}
