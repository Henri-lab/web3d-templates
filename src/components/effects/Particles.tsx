import { useRef, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface ParticlesProps {
  count?: number
  size?: number
  color?: string
  spread?: number
  speed?: number
  opacity?: number
  sizeAttenuation?: boolean
}

export function Particles({
  count = 1000,
  size = 0.02,
  color = '#ffffff',
  spread = 10,
  speed = 0.001,
  opacity = 0.6,
  sizeAttenuation = true,
}: ParticlesProps) {
  const meshRef = useRef<THREE.Points>(null)

  const { positions, velocities } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const velocities = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * spread
      positions[i * 3 + 1] = (Math.random() - 0.5) * spread
      positions[i * 3 + 2] = (Math.random() - 0.5) * spread

      velocities[i * 3] = (Math.random() - 0.5) * speed
      velocities[i * 3 + 1] = (Math.random() - 0.5) * speed
      velocities[i * 3 + 2] = (Math.random() - 0.5) * speed
    }

    return { positions, velocities }
  }, [count, spread, speed])

  useFrame(() => {
    if (!meshRef.current) return

    const positionArray = meshRef.current.geometry.attributes.position.array as Float32Array

    for (let i = 0; i < count; i++) {
      positionArray[i * 3] += velocities[i * 3]
      positionArray[i * 3 + 1] += velocities[i * 3 + 1]
      positionArray[i * 3 + 2] += velocities[i * 3 + 2]

      // 边界检测
      if (Math.abs(positionArray[i * 3]) > spread / 2) {
        velocities[i * 3] *= -1
      }
      if (Math.abs(positionArray[i * 3 + 1]) > spread / 2) {
        velocities[i * 3 + 1] *= -1
      }
      if (Math.abs(positionArray[i * 3 + 2]) > spread / 2) {
        velocities[i * 3 + 2] *= -1
      }
    }

    meshRef.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={size}
        color={color}
        transparent
        opacity={opacity}
        sizeAttenuation={sizeAttenuation}
        depthWrite={false}
      />
    </points>
  )
}

// 飘落粒子（如落叶、雪花）
interface FallingParticlesProps extends ParticlesProps {
  fallSpeed?: number
  windSpeed?: number
  rotationSpeed?: number
}

export function FallingParticles({
  count = 500,
  size = 0.05,
  color = '#ffffff',
  spread = 15,
  fallSpeed = 0.02,
  windSpeed = 0.005,
  opacity = 0.8,
}: FallingParticlesProps) {
  const meshRef = useRef<THREE.Points>(null)

  const positions = useMemo(() => {
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * spread
      positions[i * 3 + 1] = Math.random() * spread
      positions[i * 3 + 2] = (Math.random() - 0.5) * spread
    }
    return positions
  }, [count, spread])

  useFrame((state) => {
    if (!meshRef.current) return

    const positionArray = meshRef.current.geometry.attributes.position.array as Float32Array
    const time = state.clock.elapsedTime

    for (let i = 0; i < count; i++) {
      // 下落
      positionArray[i * 3 + 1] -= fallSpeed

      // 风吹摆动
      positionArray[i * 3] += Math.sin(time + i) * windSpeed
      positionArray[i * 3 + 2] += Math.cos(time + i * 0.5) * windSpeed

      // 重置到顶部
      if (positionArray[i * 3 + 1] < -spread / 2) {
        positionArray[i * 3 + 1] = spread / 2
        positionArray[i * 3] = (Math.random() - 0.5) * spread
        positionArray[i * 3 + 2] = (Math.random() - 0.5) * spread
      }
    }

    meshRef.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={size}
        color={color}
        transparent
        opacity={opacity}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  )
}
