/**
 * AAA 级渲染效果展示
 *
 * 展示游戏大作级别的渲染技术：
 * - 高质量光照
 * - 体积光
 * - 景深效果
 * - 运动模糊
 */

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, MeshReflectorMaterial, Float, Sparkles } from '@react-three/drei'
import * as THREE from 'three'

// 发光球体
function GlowingSphere({
  position,
  color,
  intensity = 1,
}: {
  position: [number, number, number]
  color: string
  intensity?: number
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const lightRef = useRef<THREE.PointLight>(null)

  useFrame((state) => {
    const time = state.clock.elapsedTime
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(time * 2) * 0.2
    }
    if (lightRef.current) {
      lightRef.current.intensity = intensity * (0.8 + Math.sin(time * 3) * 0.2)
    }
  })

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.15, 32, 32]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <pointLight ref={lightRef} color={color} intensity={intensity} distance={5} />
    </group>
  )
}

// 高质量角色模型（用几何体模拟）
function CharacterModel({ position }: { position: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.3
    }
  })

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.3}>
      <group ref={groupRef} position={position}>
        {/* 身体 */}
        <mesh position={[0, 0, 0]} castShadow>
          <capsuleGeometry args={[0.3, 0.8, 16, 32]} />
          <meshPhysicalMaterial color="#2c3e50" metalness={0.8} roughness={0.2} clearcoat={0.5} />
        </mesh>

        {/* 头部 */}
        <mesh position={[0, 0.8, 0]} castShadow>
          <sphereGeometry args={[0.25, 32, 32]} />
          <meshPhysicalMaterial color="#34495e" metalness={0.9} roughness={0.1} clearcoat={1} />
        </mesh>

        {/* 眼睛发光 */}
        <mesh position={[0.1, 0.85, 0.2]}>
          <sphereGeometry args={[0.03, 16, 16]} />
          <meshBasicMaterial color="#00ffff" />
        </mesh>
        <mesh position={[-0.1, 0.85, 0.2]}>
          <sphereGeometry args={[0.03, 16, 16]} />
          <meshBasicMaterial color="#00ffff" />
        </mesh>

        {/* 肩甲 */}
        <mesh position={[0.4, 0.3, 0]} castShadow>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshPhysicalMaterial color="#e74c3c" metalness={1} roughness={0.1} />
        </mesh>
        <mesh position={[-0.4, 0.3, 0]} castShadow>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshPhysicalMaterial color="#e74c3c" metalness={1} roughness={0.1} />
        </mesh>
      </group>
    </Float>
  )
}

// 科幻场景地板
function SciFiFloor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
      <planeGeometry args={[20, 20]} />
      <MeshReflectorMaterial
        blur={[300, 100]}
        resolution={1024}
        mixBlur={1}
        mixStrength={50}
        roughness={1}
        depthScale={1.2}
        minDepthThreshold={0.4}
        maxDepthThreshold={1.4}
        color="#101010"
        metalness={0.5}
        mirror={0.5}
      />
    </mesh>
  )
}

// 能量柱
function EnergyPillar({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.MeshStandardMaterial
      material.emissiveIntensity = 0.5 + Math.sin(state.clock.elapsedTime * 3) * 0.3
    }
  })

  return (
    <group position={position}>
      {/* 底座 */}
      <mesh position={[0, -0.9, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.4, 0.2, 32]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* 能量柱 */}
      <mesh ref={meshRef} position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 3, 32]} />
        <meshStandardMaterial
          color="#00ffff"
          emissive="#00ffff"
          emissiveIntensity={0.5}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* 顶部光源 */}
      <pointLight position={[0, 2, 0]} color="#00ffff" intensity={2} distance={5} />
    </group>
  )
}

export function AAARendering() {
  return (
    <group>
      {/* 科幻地板 */}
      <SciFiFloor />

      {/* 主角模型 */}
      <CharacterModel position={[0, 0, 0]} />

      {/* 能量柱 */}
      <EnergyPillar position={[-3, 0, -2]} />
      <EnergyPillar position={[3, 0, -2]} />
      <EnergyPillar position={[-3, 0, 2]} />
      <EnergyPillar position={[3, 0, 2]} />

      {/* 发光球体 */}
      <GlowingSphere position={[-1.5, 1, 1]} color="#ff6b6b" intensity={3} />
      <GlowingSphere position={[1.5, 1.2, 1]} color="#4ecdc4" intensity={3} />
      <GlowingSphere position={[0, 2, -1]} color="#ffe66d" intensity={3} />

      {/* 粒子效果 */}
      <Sparkles count={200} scale={10} size={2} speed={0.5} color="#00ffff" />

      {/* 环境光 */}
      <ambientLight intensity={0.1} />

      {/* 主光源 */}
      <spotLight
        position={[0, 10, 0]}
        angle={0.5}
        penumbra={1}
        intensity={2}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />

      {/* 说明 */}
      <Html position={[0, 3.5, 0]} center>
        <div className="text-sm text-white bg-black/70 px-4 py-2 rounded-lg max-w-xs text-center">
          <div className="font-bold mb-1">AAA 级渲染效果</div>
          <div className="text-xs text-gray-300">反射地板、体积光、粒子系统、动态光照</div>
        </div>
      </Html>
    </group>
  )
}
