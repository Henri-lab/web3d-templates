/**
 * ProceduralGeometry - 程序化几何体
 *
 * 展示通过代码动态生成的几何体：
 * - 噪声变形球体
 * - 程序化地形
 * - 动态网格
 */

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// 简单的 3D 噪声函数
function noise3D(x: number, y: number, z: number): number {
  const n = Math.sin(x * 1.5) * Math.cos(y * 1.5) * Math.sin(z * 1.5)
  return n + Math.sin(x * 3 + y * 2) * 0.5 + Math.cos(z * 2.5 + x) * 0.3
}

export function ProceduralGeometry() {
  const terrainRef = useRef<THREE.Mesh>(null)
  const blobRef = useRef<THREE.Mesh>(null)
  const waveRef = useRef<THREE.Mesh>(null)

  // 程序化地形
  const terrainGeometry = useMemo(() => {
    const geometry = new THREE.PlaneGeometry(4, 4, 64, 64)
    const positions = geometry.attributes.position.array as Float32Array

    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i]
      const y = positions[i + 1]
      positions[i + 2] = noise3D(x * 0.5, y * 0.5, 0) * 0.5
    }

    geometry.computeVertexNormals()
    return geometry
  }, [])

  // 噪声变形球体
  const blobGeometry = useMemo(() => {
    const geometry = new THREE.IcosahedronGeometry(0.8, 4)
    return geometry
  }, [])

  // 波浪网格
  const waveGeometry = useMemo(() => {
    return new THREE.PlaneGeometry(3, 3, 48, 48)
  }, [])

  useFrame((state) => {
    const time = state.clock.elapsedTime

    // 动态变形球体
    if (blobRef.current) {
      const geometry = blobRef.current.geometry as THREE.BufferGeometry
      const positions = geometry.attributes.position
      const originalPositions =
        (geometry.userData.originalPositions as Float32Array) || new Float32Array(positions.array)

      if (!geometry.userData.originalPositions) {
        geometry.userData.originalPositions = originalPositions.slice()
      }

      for (let i = 0; i < positions.count; i++) {
        const ox = originalPositions[i * 3]
        const oy = originalPositions[i * 3 + 1]
        const oz = originalPositions[i * 3 + 2]

        const noise = noise3D(ox * 2 + time, oy * 2 + time * 0.5, oz * 2) * 0.15
        const length = Math.sqrt(ox * ox + oy * oy + oz * oz)
        const scale = 1 + noise

        positions.setXYZ(
          i,
          (ox / length) * length * scale,
          (oy / length) * length * scale,
          (oz / length) * length * scale,
        )
      }
      positions.needsUpdate = true
      geometry.computeVertexNormals()
    }

    // 动态波浪
    if (waveRef.current) {
      const geometry = waveRef.current.geometry as THREE.BufferGeometry
      const positions = geometry.attributes.position

      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i)
        const y = positions.getY(i)
        const z =
          Math.sin(x * 2 + time * 2) * 0.15 +
          Math.cos(y * 2 + time * 1.5) * 0.15 +
          Math.sin((x + y) * 1.5 + time) * 0.1
        positions.setZ(i, z)
      }
      positions.needsUpdate = true
      geometry.computeVertexNormals()
    }
  })

  return (
    <group>
      {/* 程序化地形 */}
      <mesh
        ref={terrainRef}
        geometry={terrainGeometry}
        position={[-2.5, -0.5, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color="#22c55e" metalness={0.1} roughness={0.8} flatShading />
      </mesh>

      {/* 噪声变形球体 */}
      <mesh ref={blobRef} geometry={blobGeometry} position={[0, 0.5, 0]} castShadow>
        <meshStandardMaterial color="#f472b6" metalness={0.4} roughness={0.3} />
      </mesh>

      {/* 动态波浪网格 */}
      <mesh
        ref={waveRef}
        geometry={waveGeometry}
        position={[2.5, 0, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color="#3b82f6"
          metalness={0.5}
          roughness={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}
