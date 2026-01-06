/**
 * ReflectiveSphere - 反射玻璃球
 *
 * 一个能够反射周围环境的玻璃球体
 * 使用 CubeCamera 实现实时环境反射
 *
 * 技术要点：
 * - MeshPhysicalMaterial: 物理材质，支持透明、折射、反射
 * - CubeCamera: 立方体相机，用于捕获周围环境
 * - useFrame: 每帧更新反射贴图
 *
 * 可调参数：
 * - radius: 球体半径
 * - position: 位置
 * - roughness: 粗糙度 (0-1)
 * - transmission: 透射率 (0-1)
 * - ior: 折射率 (1-2.5)
 * - thickness: 厚度
 * - envMapIntensity: 环境贴图强度
 *
 * 工作流状态：稳定
 * 最后更新：2024-01
 */

import { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

interface ReflectiveSphereProps {
  radius?: number
  position?: [number, number, number]
  roughness?: number
  transmission?: number
  ior?: number
  thickness?: number
  envMapIntensity?: number
  color?: string
  // 是否启用实时反射（性能开销较大）
  realtimeReflection?: boolean
  // 反射更新频率（每 N 帧更新一次）
  reflectionUpdateInterval?: number
}

export function ReflectiveSphere({
  radius = 1,
  position = [0, 1, 0],
  roughness = 0.05,
  transmission = 0.95,
  ior = 1.5,
  thickness = 0.5,
  envMapIntensity = 1,
  color = '#ffffff',
  realtimeReflection = true,
  reflectionUpdateInterval = 1,
}: ReflectiveSphereProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const { gl, scene } = useThree()

  // 创建 CubeCamera 用于实时反射
  // 分辨率 256 是性能和质量的平衡点
  const cubeRenderTarget = useMemo(() => {
    return new THREE.WebGLCubeRenderTarget(256, {
      format: THREE.RGBAFormat,
      generateMipmaps: true,
      minFilter: THREE.LinearMipmapLinearFilter,
    })
  }, [])

  const cubeCamera = useMemo(() => {
    return new THREE.CubeCamera(0.1, 100, cubeRenderTarget)
  }, [cubeRenderTarget])

  // 创建物理材质
  const material = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(color),
      roughness,
      metalness: 0,
      transmission,
      ior,
      thickness,
      envMapIntensity,
      envMap: cubeRenderTarget.texture,
      // 透明设置
      transparent: true,
      opacity: 1,
      // 清漆效果
      clearcoat: 1,
      clearcoatRoughness: 0.1,
      // 光泽
      sheen: 0.5,
      sheenRoughness: 0.5,
      sheenColor: new THREE.Color('#ffffff'),
    })
  }, [color, roughness, transmission, ior, thickness, envMapIntensity, cubeRenderTarget.texture])

  // 帧计数器，用于控制反射更新频率
  const frameCount = useRef(0)

  // 每帧更新
  useFrame(() => {
    if (!meshRef.current || !realtimeReflection) return

    frameCount.current++

    // 按照指定频率更新反射
    if (frameCount.current % reflectionUpdateInterval === 0) {
      // 临时隐藏自己，避免自我反射
      meshRef.current.visible = false

      // 更新 CubeCamera 位置到球体位置
      cubeCamera.position.copy(meshRef.current.position)

      // 渲染环境到 CubeRenderTarget
      cubeCamera.update(gl, scene)

      // 恢复可见性
      meshRef.current.visible = true
    }
  })

  // 清理资源
  // 注意：在实际项目中，应该在组件卸载时清理 cubeRenderTarget
  // 这里为了保持代码简洁，省略了 useEffect 清理逻辑

  return (
    <mesh ref={meshRef} position={position} castShadow receiveShadow>
      {/* 球体几何体 - 64 段提供足够平滑的表面 */}
      <sphereGeometry args={[radius, 64, 64]} />
      {/* 使用创建的物理材质 */}
      <primitive object={material} attach="material" />
    </mesh>
  )
}

/**
 * 使用示例：
 *
 * // 基础用法
 * <ReflectiveSphere />
 *
 * // 自定义参数
 * <ReflectiveSphere
 *   radius={1.5}
 *   position={[2, 1, 0]}
 *   roughness={0.1}
 *   transmission={0.9}
 *   ior={1.8}
 *   color="#88ccff"
 * />
 *
 * // 性能优化：降低反射更新频率
 * <ReflectiveSphere
 *   realtimeReflection={true}
 *   reflectionUpdateInterval={3}  // 每3帧更新一次
 * />
 *
 * // 禁用实时反射（使用环境贴图）
 * <ReflectiveSphere realtimeReflection={false} />
 */
