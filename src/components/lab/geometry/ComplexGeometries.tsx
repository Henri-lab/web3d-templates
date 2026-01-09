/**
 * ComplexGeometries - 复杂几何体展示
 *
 * 展示更复杂的几何体：
 * - 参数化曲面
 * - 挤出几何体
 * - 车削几何体
 * - 管道几何体
 */

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export function ComplexGeometries() {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1
    }
  })

  // 创建心形曲线用于挤出
  const heartShape = useMemo(() => {
    const shape = new THREE.Shape()
    const x = 0,
      y = 0
    shape.moveTo(x + 0.25, y + 0.25)
    shape.bezierCurveTo(x + 0.25, y + 0.25, x + 0.2, y, x, y)
    shape.bezierCurveTo(x - 0.3, y, x - 0.3, y + 0.35, x - 0.3, y + 0.35)
    shape.bezierCurveTo(x - 0.3, y + 0.55, x - 0.1, y + 0.77, x + 0.25, y + 0.95)
    shape.bezierCurveTo(x + 0.6, y + 0.77, x + 0.8, y + 0.55, x + 0.8, y + 0.35)
    shape.bezierCurveTo(x + 0.8, y + 0.35, x + 0.8, y, x + 0.5, y)
    shape.bezierCurveTo(x + 0.35, y, x + 0.25, y + 0.25, x + 0.25, y + 0.25)
    return shape
  }, [])

  // 创建花瓶轮廓用于车削
  const vasePoints = useMemo(() => {
    return [
      new THREE.Vector2(0.3, 0),
      new THREE.Vector2(0.4, 0.2),
      new THREE.Vector2(0.35, 0.4),
      new THREE.Vector2(0.25, 0.6),
      new THREE.Vector2(0.2, 0.8),
      new THREE.Vector2(0.25, 1.0),
      new THREE.Vector2(0.3, 1.1),
      new THREE.Vector2(0.28, 1.15),
    ]
  }, [])

  // 创建螺旋曲线用于管道
  const helixCurve = useMemo(() => {
    const points: THREE.Vector3[] = []
    for (let i = 0; i <= 100; i++) {
      const t = i / 100
      const angle = t * Math.PI * 4
      points.push(new THREE.Vector3(Math.cos(angle) * 0.5, t * 1.5 - 0.75, Math.sin(angle) * 0.5))
    }
    return new THREE.CatmullRomCurve3(points)
  }, [])

  // 创建结曲线
  const knotCurve = useMemo(() => {
    const points: THREE.Vector3[] = []
    for (let i = 0; i <= 100; i++) {
      const t = (i / 100) * Math.PI * 2
      const r = 0.5 + 0.3 * Math.cos(3 * t)
      points.push(
        new THREE.Vector3(r * Math.cos(2 * t), 0.3 * Math.sin(3 * t), r * Math.sin(2 * t)),
      )
    }
    return new THREE.CatmullRomCurve3(points, true)
  }, [])

  return (
    <group ref={groupRef}>
      {/* 挤出心形 */}
      <mesh position={[-2.5, 0, 0]} castShadow rotation={[Math.PI, 0, 0]}>
        <extrudeGeometry
          args={[
            heartShape,
            {
              depth: 0.3,
              bevelEnabled: true,
              bevelThickness: 0.05,
              bevelSize: 0.05,
              bevelSegments: 3,
            },
          ]}
        />
        <meshStandardMaterial color="#ff6b6b" metalness={0.5} roughness={0.3} />
      </mesh>

      {/* 车削花瓶 */}
      <mesh position={[-0.8, -0.5, 0]} castShadow>
        <latheGeometry args={[vasePoints, 32]} />
        <meshStandardMaterial
          color="#4ecdc4"
          metalness={0.6}
          roughness={0.2}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 螺旋管道 */}
      <mesh position={[1, 0, 0]} castShadow>
        <tubeGeometry args={[helixCurve, 100, 0.08, 16, false]} />
        <meshStandardMaterial color="#ffe66d" metalness={0.7} roughness={0.2} />
      </mesh>

      {/* 参数化结曲线管道 */}
      <mesh position={[2.8, 0, 0]} castShadow>
        <tubeGeometry args={[knotCurve, 100, 0.06, 16, true]} />
        <meshStandardMaterial color="#a855f7" metalness={0.5} roughness={0.3} />
      </mesh>

      {/* 环面结 */}
      <mesh position={[0, 0, 2]} castShadow>
        <torusKnotGeometry args={[0.4, 0.15, 128, 32, 2, 3]} />
        <meshStandardMaterial color="#06b6d4" metalness={0.6} roughness={0.2} />
      </mesh>
    </group>
  )
}
