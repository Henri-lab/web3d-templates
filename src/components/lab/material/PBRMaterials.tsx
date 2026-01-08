/**
 * PBRMaterials - PBR 物理材质展示
 *
 * 展示 Three.js 的物理基础渲染材质：
 * - MeshStandardMaterial
 * - MeshPhysicalMaterial
 * - 各种材质参数对比
 */

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export function PBRMaterials() {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.05
    }
  })

  // 不同粗糙度的金属球
  const roughnessRow = [0, 0.25, 0.5, 0.75, 1].map((roughness, i) => ({
    position: [-3 + i * 1.5, 1.5, -2] as [number, number, number],
    roughness,
    metalness: 1,
    color: '#c0c0c0',
    label: `R: ${roughness}`,
  }))

  // 不同金属度的球
  const metalnessRow = [0, 0.25, 0.5, 0.75, 1].map((metalness, i) => ({
    position: [-3 + i * 1.5, 0, -2] as [number, number, number],
    roughness: 0.3,
    metalness,
    color: '#e74c3c',
    label: `M: ${metalness}`,
  }))

  // Physical 材质特性展示
  const physicalMaterials = [
    {
      position: [-2, 0, 1] as [number, number, number],
      props: { clearcoat: 1, clearcoatRoughness: 0 },
      color: '#3498db',
      label: '清漆涂层',
    },
    {
      position: [0, 0, 1] as [number, number, number],
      props: { transmission: 1, thickness: 0.5, ior: 1.5 },
      color: '#ffffff',
      label: '玻璃透射',
    },
    {
      position: [2, 0, 1] as [number, number, number],
      props: { sheen: 1, sheenRoughness: 0.3, sheenColor: '#ff69b4' },
      color: '#2c3e50',
      label: '丝绒光泽',
    },
  ]

  return (
    <group ref={groupRef}>
      {/* 粗糙度对比行 */}
      {roughnessRow.map((item, i) => (
        <mesh key={`rough-${i}`} position={item.position} castShadow>
          <sphereGeometry args={[0.5, 64, 64]} />
          <meshStandardMaterial
            color={item.color}
            roughness={item.roughness}
            metalness={item.metalness}
          />
        </mesh>
      ))}

      {/* 金属度对比行 */}
      {metalnessRow.map((item, i) => (
        <mesh key={`metal-${i}`} position={item.position} castShadow>
          <sphereGeometry args={[0.5, 64, 64]} />
          <meshStandardMaterial
            color={item.color}
            roughness={item.roughness}
            metalness={item.metalness}
          />
        </mesh>
      ))}

      {/* Physical 材质特性 */}
      {physicalMaterials.map((item, i) => (
        <mesh key={`physical-${i}`} position={item.position} castShadow>
          <sphereGeometry args={[0.6, 64, 64]} />
          <meshPhysicalMaterial
            color={item.color}
            roughness={0.1}
            metalness={0}
            {...item.props}
          />
        </mesh>
      ))}

      {/* 标签说明 */}
      <group position={[0, -1.5, 0]}>
        <mesh position={[-2, 0, 0]}>
          <planeGeometry args={[1.5, 0.3]} />
          <meshBasicMaterial color="#1a1a2e" />
        </mesh>
      </group>
    </group>
  )
}
