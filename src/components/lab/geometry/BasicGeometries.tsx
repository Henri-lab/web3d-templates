/**
 * BasicGeometries - 基础几何体展示
 *
 * 展示 Three.js 内置的基础几何体
 * 包括：立方体、球体、圆柱体、圆锥体、圆环等
 */

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export function BasicGeometries() {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1
    }
  })

  const geometries = [
    {
      position: [-3, 0, 0] as [number, number, number],
      geometry: <boxGeometry args={[1, 1, 1]} />,
      name: 'Box',
    },
    {
      position: [-1.5, 0, 0] as [number, number, number],
      geometry: <sphereGeometry args={[0.6, 32, 32]} />,
      name: 'Sphere',
    },
    {
      position: [0, 0, 0] as [number, number, number],
      geometry: <cylinderGeometry args={[0.5, 0.5, 1, 32]} />,
      name: 'Cylinder',
    },
    {
      position: [1.5, 0, 0] as [number, number, number],
      geometry: <coneGeometry args={[0.6, 1, 32]} />,
      name: 'Cone',
    },
    {
      position: [3, 0, 0] as [number, number, number],
      geometry: <torusGeometry args={[0.4, 0.2, 16, 32]} />,
      name: 'Torus',
    },
  ]

  const secondRow = [
    {
      position: [-2.25, 0, 2] as [number, number, number],
      geometry: <dodecahedronGeometry args={[0.6]} />,
      name: 'Dodecahedron',
    },
    {
      position: [-0.75, 0, 2] as [number, number, number],
      geometry: <icosahedronGeometry args={[0.6]} />,
      name: 'Icosahedron',
    },
    {
      position: [0.75, 0, 2] as [number, number, number],
      geometry: <octahedronGeometry args={[0.6]} />,
      name: 'Octahedron',
    },
    {
      position: [2.25, 0, 2] as [number, number, number],
      geometry: <tetrahedronGeometry args={[0.6]} />,
      name: 'Tetrahedron',
    },
  ]

  return (
    <group ref={groupRef}>
      {[...geometries, ...secondRow].map((item, index) => (
        <mesh key={index} position={item.position} castShadow receiveShadow>
          {item.geometry}
          <meshStandardMaterial
            color={`hsl(${index * 40}, 70%, 60%)`}
            metalness={0.3}
            roughness={0.4}
          />
        </mesh>
      ))}
    </group>
  )
}
