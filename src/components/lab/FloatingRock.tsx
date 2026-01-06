/**
 * FloatingRock - 悬浮岩石
 *
 * 一个带有悬浮动画的程序化岩石
 * 使用噪声变形的几何体模拟自然岩石形态
 *
 * 技术要点：
 * - 程序化几何体变形: 使用噪声函数扭曲球体
 * - 悬浮动画: 正弦波驱动的上下浮动
 * - 阴影投射: 增强立体感
 *
 * 可调参数：
 * - size: 岩石大小
 * - position: 基础位置
 * - floatHeight: 浮动高度
 * - floatSpeed: 浮动速度
 * - rotationSpeed: 旋转速度
 * - roughness: 表面粗糙度
 * - color: 岩石颜色
 *
 * 工作流状态：开发中
 * 最后更新：2024-01
 */

import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface FloatingRockProps {
  size?: number
  position?: [number, number, number]
  floatHeight?: number
  floatSpeed?: number
  rotationSpeed?: number
  roughness?: number
  color?: string
  // 岩石变形强度
  deformStrength?: number
  // 岩石细分程度
  segments?: number
}

// 简单的 3D 噪声函数（Simplex-like）
// 用于程序化生成岩石表面
function noise3D(x: number, y: number, z: number): number {
  // 简化的噪声实现
  const n = Math.sin(x * 1.5) * Math.cos(y * 1.3) * Math.sin(z * 1.7)
  const m = Math.cos(x * 2.1 + y * 1.9) * Math.sin(z * 2.3)
  const o = Math.sin(x * 0.7 + z * 0.9) * Math.cos(y * 1.1)
  return (n + m + o) / 3
}

export function FloatingRock({
  size = 1,
  position = [0, 1, 0],
  floatHeight = 0.3,
  floatSpeed = 1,
  rotationSpeed = 0.2,
  roughness = 0.8,
  color = '#665544',
  deformStrength = 0.3,
  segments = 32,
}: FloatingRockProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const groupRef = useRef<THREE.Group>(null)

  // 创建变形后的岩石几何体
  const geometry = useMemo(() => {
    // 从球体开始
    const geo = new THREE.IcosahedronGeometry(size, 3)

    // 获取位置属性
    const positions = geo.attributes.position
    const vertex = new THREE.Vector3()

    // 对每个顶点应用噪声变形
    for (let i = 0; i < positions.count; i++) {
      vertex.fromBufferAttribute(positions, i)

      // 计算噪声值
      const noiseValue = noise3D(
        vertex.x * 2,
        vertex.y * 2,
        vertex.z * 2
      )

      // 沿法线方向变形
      const normal = vertex.clone().normalize()
      vertex.add(normal.multiplyScalar(noiseValue * deformStrength * size))

      // 更新顶点位置
      positions.setXYZ(i, vertex.x, vertex.y, vertex.z)
    }

    // 重新计算法线
    geo.computeVertexNormals()

    return geo
  }, [size, deformStrength, segments])

  // 创建岩石材质
  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(color),
      roughness,
      metalness: 0.1,
      flatShading: true, // 平面着色增强岩石感
    })
  }, [color, roughness])

  // 初始随机旋转
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.random() * Math.PI
      meshRef.current.rotation.y = Math.random() * Math.PI
      meshRef.current.rotation.z = Math.random() * Math.PI
    }
  }, [])

  // 记录初始 Y 位置
  const initialY = useRef(position[1])

  // 每帧更新动画
  useFrame((state) => {
    if (!groupRef.current || !meshRef.current) return

    const time = state.clock.elapsedTime

    // 悬浮动画 - 正弦波上下浮动
    const floatOffset = Math.sin(time * floatSpeed) * floatHeight
    groupRef.current.position.y = initialY.current + floatOffset

    // 缓慢旋转
    meshRef.current.rotation.y += rotationSpeed * 0.01
    meshRef.current.rotation.x += rotationSpeed * 0.003
  })

  return (
    <group ref={groupRef} position={position}>
      <mesh
        ref={meshRef}
        geometry={geometry}
        material={material}
        castShadow
        receiveShadow
      />

      {/* 底部阴影指示器 - 帮助感知高度 */}
      <mesh
        position={[0, -position[1] + 0.01, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <circleGeometry args={[size * 0.8, 32]} />
        <meshBasicMaterial
          color="#000000"
          transparent
          opacity={0.2}
        />
      </mesh>
    </group>
  )
}

/**
 * 使用示例：
 *
 * // 基础用法
 * <FloatingRock />
 *
 * // 大型缓慢浮动的岩石
 * <FloatingRock
 *   size={2}
 *   floatHeight={0.5}
 *   floatSpeed={0.5}
 * />
 *
 * // 深色火山岩
 * <FloatingRock
 *   color="#222222"
 *   roughness={0.95}
 *   deformStrength={0.5}
 * />
 *
 * // 多个岩石组合
 * <>
 *   <FloatingRock position={[-2, 1, 0]} size={0.8} floatSpeed={0.8} />
 *   <FloatingRock position={[0, 1.5, 0]} size={1.2} floatSpeed={1} />
 *   <FloatingRock position={[2, 1, 0]} size={0.6} floatSpeed={1.2} />
 * </>
 */
