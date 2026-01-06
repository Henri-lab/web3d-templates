/**
 * GlowingCrystal - 发光水晶
 *
 * 一个带有内发光效果的水晶体
 * 使用自定义着色器实现菲涅尔发光效果
 *
 * 技术要点：
 * - 自定义 ShaderMaterial: 实现菲涅尔边缘发光
 * - IcosahedronGeometry: 二十面体作为水晶基础形状
 * - 动态旋转: 缓慢自转增加视觉效果
 *
 * 可调参数：
 * - size: 水晶大小
 * - position: 位置
 * - glowColor: 发光颜色
 * - glowIntensity: 发光强度
 * - baseColor: 基础颜色
 * - rotationSpeed: 旋转速度
 *
 * 工作流状态：测试中
 * 最后更新：2024-01
 */

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface GlowingCrystalProps {
  size?: number
  position?: [number, number, number]
  glowColor?: string
  glowIntensity?: number
  baseColor?: string
  rotationSpeed?: number
  // 水晶细分程度 (0-3)
  detail?: number
}

// 顶点着色器
// 计算视角方向和法线，传递给片段着色器
const vertexShader = `
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`

// 片段着色器
// 实现菲涅尔效果：边缘发光，中心透明
const fragmentShader = `
  uniform vec3 glowColor;
  uniform vec3 baseColor;
  uniform float glowIntensity;
  uniform float time;

  varying vec3 vNormal;
  varying vec3 vViewPosition;

  void main() {
    // 计算视角方向
    vec3 viewDir = normalize(vViewPosition);

    // 菲涅尔效果：边缘更亮
    float fresnel = 1.0 - abs(dot(viewDir, vNormal));
    fresnel = pow(fresnel, 2.0);

    // 添加时间变化的脉冲效果
    float pulse = 0.5 + 0.5 * sin(time * 2.0);
    float intensity = glowIntensity * (0.8 + 0.2 * pulse);

    // 混合基础颜色和发光颜色
    vec3 finalColor = mix(baseColor, glowColor, fresnel * intensity);

    // 边缘更亮
    float alpha = 0.3 + fresnel * 0.7;

    gl_FragColor = vec4(finalColor, alpha);
  }
`

export function GlowingCrystal({
  size = 1,
  position = [0, 1, 0],
  glowColor = '#00ffff',
  glowIntensity = 1.5,
  baseColor = '#001133',
  rotationSpeed = 0.3,
  detail = 1,
}: GlowingCrystalProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.ShaderMaterial>(null)

  // 创建着色器材质
  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        glowColor: { value: new THREE.Color(glowColor) },
        baseColor: { value: new THREE.Color(baseColor) },
        glowIntensity: { value: glowIntensity },
        time: { value: 0 },
      },
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  }, [glowColor, baseColor, glowIntensity])

  // 每帧更新
  useFrame((state) => {
    if (!meshRef.current) return

    // 缓慢旋转
    meshRef.current.rotation.y += rotationSpeed * 0.01
    meshRef.current.rotation.x += rotationSpeed * 0.005

    // 更新时间 uniform
    if (shaderMaterial.uniforms.time) {
      shaderMaterial.uniforms.time.value = state.clock.elapsedTime
    }
  })

  return (
    <group position={position}>
      {/* 主水晶体 */}
      <mesh ref={meshRef}>
        {/* 二十面体几何体 - 天然的水晶形状 */}
        <icosahedronGeometry args={[size, detail]} />
        <primitive object={shaderMaterial} attach="material" ref={materialRef} />
      </mesh>

      {/* 内部发光核心 */}
      <mesh scale={0.3}>
        <icosahedronGeometry args={[size, 0]} />
        <meshBasicMaterial
          color={glowColor}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* 点光源 - 照亮周围环境 */}
      <pointLight
        color={glowColor}
        intensity={glowIntensity * 2}
        distance={5}
        decay={2}
      />
    </group>
  )
}

/**
 * 使用示例：
 *
 * // 基础用法 - 青色发光水晶
 * <GlowingCrystal />
 *
 * // 紫色魔法水晶
 * <GlowingCrystal
 *   glowColor="#ff00ff"
 *   baseColor="#220033"
 *   glowIntensity={2}
 * />
 *
 * // 大型缓慢旋转的水晶
 * <GlowingCrystal
 *   size={2}
 *   rotationSpeed={0.1}
 *   detail={2}
 * />
 *
 * // 红色警告水晶
 * <GlowingCrystal
 *   glowColor="#ff3300"
 *   baseColor="#330000"
 *   glowIntensity={3}
 *   rotationSpeed={1}
 * />
 */
