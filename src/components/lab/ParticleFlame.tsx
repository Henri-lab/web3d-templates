/**
 * ParticleFlame - 粒子火焰
 *
 * 使用粒子系统实现的火焰效果
 * 粒子从底部向上运动，逐渐变小变淡
 *
 * 技术要点：
 * - Points + BufferGeometry: 高性能粒子系统
 * - 自定义着色器: 粒子大小、颜色、透明度动画
 * - 粒子生命周期: 重生机制实现持续燃烧
 *
 * 可调参数：
 * - position: 火焰位置
 * - particleCount: 粒子数量
 * - flameHeight: 火焰高度
 * - flameWidth: 火焰宽度
 * - speed: 上升速度
 * - colors: 火焰颜色数组 [底部, 中间, 顶部]
 *
 * 工作流状态：开发中
 * 最后更新：2024-01
 */

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface ParticleFlameProps {
  position?: [number, number, number]
  particleCount?: number
  flameHeight?: number
  flameWidth?: number
  speed?: number
  colors?: [string, string, string]
}

// 顶点着色器
const vertexShader = `
  attribute float size;
  attribute float life;
  attribute vec3 customColor;

  varying float vLife;
  varying vec3 vColor;

  void main() {
    vLife = life;
    vColor = customColor;

    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

    // 粒子大小随生命周期变化
    gl_PointSize = size * (1.0 - life * 0.5) * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`

// 片段着色器
const fragmentShader = `
  varying float vLife;
  varying vec3 vColor;

  void main() {
    // 圆形粒子
    vec2 center = gl_PointCoord - vec2(0.5);
    float dist = length(center);

    if (dist > 0.5) discard;

    // 柔和边缘
    float alpha = 1.0 - smoothstep(0.2, 0.5, dist);

    // 生命周期影响透明度
    alpha *= (1.0 - vLife);

    // 发光效果
    vec3 glow = vColor * (1.0 + (1.0 - dist * 2.0) * 0.5);

    gl_FragColor = vec4(glow, alpha);
  }
`

export function ParticleFlame({
  position = [0, 0, 0],
  particleCount = 200,
  flameHeight = 2,
  flameWidth = 0.5,
  speed = 1,
  colors = ['#ff6600', '#ffaa00', '#ffff00'],
}: ParticleFlameProps) {
  const pointsRef = useRef<THREE.Points>(null)

  // 粒子数据
  const particleData = useMemo(() => {
    const positions = new Float32Array(particleCount * 3)
    const sizes = new Float32Array(particleCount)
    const lives = new Float32Array(particleCount)
    const customColors = new Float32Array(particleCount * 3)
    const velocities = new Float32Array(particleCount * 3)

    // 颜色转换
    const color1 = new THREE.Color(colors[0])
    const color2 = new THREE.Color(colors[1])
    const color3 = new THREE.Color(colors[2])

    for (let i = 0; i < particleCount; i++) {
      // 初始位置 - 底部圆形区域
      const angle = Math.random() * Math.PI * 2
      const radius = Math.random() * flameWidth * 0.3
      positions[i * 3] = Math.cos(angle) * radius
      positions[i * 3 + 1] = Math.random() * flameHeight * 0.1
      positions[i * 3 + 2] = Math.sin(angle) * radius

      // 大小
      sizes[i] = 10 + Math.random() * 20

      // 生命周期 (0-1)
      lives[i] = Math.random()

      // 速度
      velocities[i * 3] = (Math.random() - 0.5) * 0.02
      velocities[i * 3 + 1] = 0.02 + Math.random() * 0.03
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02

      // 颜色 - 基于初始生命周期
      const t = lives[i]
      let color: THREE.Color
      if (t < 0.5) {
        color = new THREE.Color().lerpColors(color1, color2, t * 2)
      } else {
        color = new THREE.Color().lerpColors(color2, color3, (t - 0.5) * 2)
      }
      customColors[i * 3] = color.r
      customColors[i * 3 + 1] = color.g
      customColors[i * 3 + 2] = color.b
    }

    return { positions, sizes, lives, customColors, velocities }
  }, [particleCount, flameHeight, flameWidth, colors])

  // 创建几何体
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(particleData.positions, 3))
    geo.setAttribute('size', new THREE.BufferAttribute(particleData.sizes, 1))
    geo.setAttribute('life', new THREE.BufferAttribute(particleData.lives, 1))
    geo.setAttribute('customColor', new THREE.BufferAttribute(particleData.customColors, 3))
    return geo
  }, [particleData])

  // 创建材质
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  }, [])

  // 颜色对象（用于更新）
  const colorObjects = useMemo(
    () => ({
      color1: new THREE.Color(colors[0]),
      color2: new THREE.Color(colors[1]),
      color3: new THREE.Color(colors[2]),
    }),
    [colors],
  )

  // 每帧更新粒子
  useFrame((_, delta) => {
    if (!pointsRef.current) return

    const positions = geometry.attributes.position.array as Float32Array
    const lives = geometry.attributes.life.array as Float32Array
    const customColors = geometry.attributes.customColor.array as Float32Array
    const { velocities } = particleData

    for (let i = 0; i < particleCount; i++) {
      // 更新生命周期
      lives[i] += delta * speed * 0.5

      // 重生
      if (lives[i] >= 1) {
        lives[i] = 0
        const angle = Math.random() * Math.PI * 2
        const radius = Math.random() * flameWidth * 0.3
        positions[i * 3] = Math.cos(angle) * radius
        positions[i * 3 + 1] = 0
        positions[i * 3 + 2] = Math.sin(angle) * radius

        // 重置速度
        velocities[i * 3] = (Math.random() - 0.5) * 0.02
        velocities[i * 3 + 1] = 0.02 + Math.random() * 0.03
        velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02
      }

      // 更新位置
      positions[i * 3] += velocities[i * 3] * speed
      positions[i * 3 + 1] += velocities[i * 3 + 1] * speed
      positions[i * 3 + 2] += velocities[i * 3 + 2] * speed

      // 横向扩散
      const spreadFactor = lives[i] * 0.5
      positions[i * 3] += (Math.random() - 0.5) * 0.01 * spreadFactor
      positions[i * 3 + 2] += (Math.random() - 0.5) * 0.01 * spreadFactor

      // 更新颜色
      const t = lives[i]
      let color: THREE.Color
      if (t < 0.5) {
        color = new THREE.Color().lerpColors(colorObjects.color1, colorObjects.color2, t * 2)
      } else {
        color = new THREE.Color().lerpColors(
          colorObjects.color2,
          colorObjects.color3,
          (t - 0.5) * 2,
        )
      }
      customColors[i * 3] = color.r
      customColors[i * 3 + 1] = color.g
      customColors[i * 3 + 2] = color.b
    }

    geometry.attributes.position.needsUpdate = true
    geometry.attributes.life.needsUpdate = true
    geometry.attributes.customColor.needsUpdate = true
  })

  return <points ref={pointsRef} position={position} geometry={geometry} material={material} />
}

/**
 * 使用示例：
 *
 * // 基础火焰
 * <ParticleFlame />
 *
 * // 大型篝火
 * <ParticleFlame
 *   particleCount={500}
 *   flameHeight={3}
 *   flameWidth={1}
 *   speed={1.5}
 * />
 *
 * // 蓝色魔法火焰
 * <ParticleFlame
 *   colors={['#0066ff', '#00aaff', '#ffffff']}
 *   flameHeight={2}
 * />
 *
 * // 绿色毒焰
 * <ParticleFlame
 *   colors={['#006600', '#00ff00', '#aaffaa']}
 *   speed={0.8}
 * />
 *
 * // 火把（小型）
 * <ParticleFlame
 *   particleCount={50}
 *   flameHeight={0.5}
 *   flameWidth={0.1}
 *   position={[0, 1, 0]}
 * />
 */
