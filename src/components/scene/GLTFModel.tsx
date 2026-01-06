import { useRef, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, Html } from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'
import { useStoryStore } from '@/stores'

interface GLTFModelProps {
  url: string
  position?: [number, number, number]
  rotation?: [number, number, number]
  scale?: number | [number, number, number]
  name?: string
  interactable?: boolean
  onClick?: () => void
  onHover?: (hovered: boolean) => void
  autoRotate?: boolean
  autoRotateSpeed?: number
  castShadow?: boolean
  receiveShadow?: boolean
  highlightColor?: string
}

export function GLTFModel({
  url,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  name,
  interactable = false,
  onClick,
  onHover,
  autoRotate = false,
  autoRotateSpeed = 0.5,
  castShadow = true,
  receiveShadow = true,
  highlightColor = '#ffd700',
}: GLTFModelProps) {
  const groupRef = useRef<THREE.Group>(null)
  const { scene } = useGLTF(url)
  const [hovered, setHovered] = useState(false)
  const [loading, setLoading] = useState(true)

  const selectObject = useStoryStore((s) => s.selectObject)
  const setHoveredObject = useStoryStore((s) => s.setHoveredObject)

  // 克隆场景以避免共享引用问题
  const clonedScene = scene.clone()

  // 设置阴影
  useEffect(() => {
    clonedScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = castShadow
        child.receiveShadow = receiveShadow
      }
    })
    setLoading(false)
  }, [clonedScene, castShadow, receiveShadow])

  // 自动旋转
  useFrame((_, delta) => {
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y += delta * autoRotateSpeed
    }
  })

  // 悬停效果
  useEffect(() => {
    if (!interactable || !groupRef.current) return

    const group = groupRef.current

    if (hovered) {
      gsap.to(group.scale, {
        x: (typeof scale === 'number' ? scale : scale[0]) * 1.05,
        y: (typeof scale === 'number' ? scale : scale[1]) * 1.05,
        z: (typeof scale === 'number' ? scale : scale[2]) * 1.05,
        duration: 0.3,
        ease: 'power2.out',
      })
    } else {
      gsap.to(group.scale, {
        x: typeof scale === 'number' ? scale : scale[0],
        y: typeof scale === 'number' ? scale : scale[1],
        z: typeof scale === 'number' ? scale : scale[2],
        duration: 0.3,
        ease: 'power2.out',
      })
    }
  }, [hovered, scale, interactable])

  const handlePointerOver = (e: THREE.Event) => {
    if (!interactable) return
    e.stopPropagation()
    setHovered(true)
    setHoveredObject(name || url)
    onHover?.(true)
    document.body.style.cursor = 'pointer'
  }

  const handlePointerOut = (e: THREE.Event) => {
    if (!interactable) return
    e.stopPropagation()
    setHovered(false)
    setHoveredObject(null)
    onHover?.(false)
    document.body.style.cursor = 'default'
  }

  const handleClick = (e: THREE.Event) => {
    if (!interactable) return
    e.stopPropagation()
    onClick?.()
  }

  const scaleArray: [number, number, number] =
    typeof scale === 'number' ? [scale, scale, scale] : scale

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      scale={scaleArray}
      name={name}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      <primitive object={clonedScene} />

      {/* 高亮效果 */}
      {hovered && interactable && (
        <mesh scale={[1.02, 1.02, 1.02]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial color={highlightColor} transparent opacity={0.2} wireframe />
        </mesh>
      )}

      {/* 加载提示 */}
      {loading && (
        <Html center>
          <div className="text-white text-sm bg-black/50 px-2 py-1 rounded">加载中...</div>
        </Html>
      )}
    </group>
  )
}

// 预加载模型
useGLTF.preload
