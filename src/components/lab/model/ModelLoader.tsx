/**
 * ModelLoader - 高精度模型加载器
 *
 * 展示如何加载和优化高精度 3D 模型：
 * - GLTF/GLB 模型加载
 * - 模型优化技术
 * - LOD (细节层次)
 * - 实例化渲染
 */

import { useRef, useState, Suspense } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, Html, useProgress, Center } from '@react-three/drei'
import * as THREE from 'three'

// 加载进度显示组件
function LoadingIndicator() {
  const { progress } = useProgress()
  return (
    <Html center>
      <div className="bg-black/80 text-white px-4 py-2 rounded-lg">
        <div className="text-sm mb-1">加载中...</div>
        <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-xs text-gray-400 mt-1">{progress.toFixed(0)}%</div>
      </div>
    </Html>
  )
}

// 示例模型组件 - 使用 drei 内置的简单模型
function DemoModel({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3
    }
  })

  return (
    <mesh ref={meshRef} position={position} castShadow receiveShadow>
      <torusKnotGeometry args={[0.6, 0.2, 128, 32]} />
      <meshPhysicalMaterial
        color="#4a90d9"
        metalness={0.9}
        roughness={0.1}
        clearcoat={1}
        clearcoatRoughness={0.1}
      />
    </mesh>
  )
}

// 实例化渲染示例
function InstancedMeshDemo({ count = 100 }: { count?: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const dummy = new THREE.Object3D()

  // 初始化实例位置
  useState(() => {
    if (!meshRef.current) return

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2
      const radius = 2 + Math.random() * 1
      const height = (Math.random() - 0.5) * 2

      dummy.position.set(
        Math.cos(angle) * radius,
        height,
        Math.sin(angle) * radius
      )
      dummy.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      )
      dummy.scale.setScalar(0.1 + Math.random() * 0.1)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    }
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  useFrame((state) => {
    if (!meshRef.current) return

    const time = state.clock.elapsedTime

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + time * 0.2
      const radius = 2 + Math.sin(time + i) * 0.3
      const height = Math.sin(time * 0.5 + i * 0.1) * 0.5

      dummy.position.set(
        Math.cos(angle) * radius,
        height,
        Math.sin(angle) * radius
      )
      dummy.rotation.x = time + i
      dummy.rotation.y = time * 0.5 + i
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    }
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} castShadow>
      <dodecahedronGeometry args={[0.15]} />
      <meshStandardMaterial color="#ff6b6b" metalness={0.5} roughness={0.3} />
    </instancedMesh>
  )
}

// LOD 示例
function LODDemo({ position }: { position: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.2
    }
  })

  return (
    <group ref={groupRef} position={position}>
      {/* 高细节 */}
      <mesh position={[-1.5, 0, 0]} castShadow>
        <sphereGeometry args={[0.5, 64, 64]} />
        <meshStandardMaterial color="#2ecc71" metalness={0.3} roughness={0.4} />
      </mesh>
      <Html position={[-1.5, -1, 0]} center>
        <div className="text-xs text-white bg-black/50 px-2 py-1 rounded whitespace-nowrap">
          高细节 (64段)
        </div>
      </Html>

      {/* 中细节 */}
      <mesh position={[0, 0, 0]} castShadow>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial color="#f39c12" metalness={0.3} roughness={0.4} />
      </mesh>
      <Html position={[0, -1, 0]} center>
        <div className="text-xs text-white bg-black/50 px-2 py-1 rounded whitespace-nowrap">
          中细节 (16段)
        </div>
      </Html>

      {/* 低细节 */}
      <mesh position={[1.5, 0, 0]} castShadow>
        <sphereGeometry args={[0.5, 8, 8]} />
        <meshStandardMaterial color="#e74c3c" metalness={0.3} roughness={0.4} />
      </mesh>
      <Html position={[1.5, -1, 0]} center>
        <div className="text-xs text-white bg-black/50 px-2 py-1 rounded whitespace-nowrap">
          低细节 (8段)
        </div>
      </Html>
    </group>
  )
}

// 高质量渲染模型
function HighQualityModel({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.2
    }
  })

  return (
    <group position={position}>
      <mesh ref={meshRef} castShadow receiveShadow>
        <torusKnotGeometry args={[0.5, 0.15, 256, 64, 2, 3]} />
        <meshPhysicalMaterial
          color="#9b59b6"
          metalness={1}
          roughness={0}
          clearcoat={1}
          clearcoatRoughness={0}
          reflectivity={1}
          envMapIntensity={2}
        />
      </mesh>
      <Html position={[0, -1.2, 0]} center>
        <div className="text-xs text-white bg-black/50 px-2 py-1 rounded whitespace-nowrap">
          高质量渲染 (256段)
        </div>
      </Html>
    </group>
  )
}

export function ModelLoader() {
  return (
    <Suspense fallback={<LoadingIndicator />}>
      <group>
        {/* 高质量模型 */}
        <HighQualityModel position={[0, 1.5, 0]} />

        {/* LOD 演示 */}
        <LODDemo position={[0, 0, -1]} />

        {/* 实例化渲染 */}
        <InstancedMeshDemo count={80} />

        {/* 说明文字 */}
        <Html position={[0, 2.8, 0]} center>
          <div className="text-sm text-white bg-black/70 px-4 py-2 rounded-lg max-w-xs text-center">
            <div className="font-bold mb-1">高精度模型加载技术</div>
            <div className="text-xs text-gray-300">
              展示 LOD、实例化渲染、高质量材质等优化技术
            </div>
          </div>
        </Html>
      </group>
    </Suspense>
  )
}
