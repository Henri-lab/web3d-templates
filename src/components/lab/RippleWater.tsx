/**
 * RippleWater - 波纹水面
 *
 * 一个带有动态波纹效果的水面
 * 使用顶点着色器实现波浪动画
 *
 * 技术要点：
 * - 自定义顶点着色器: 正弦波叠加实现水波
 * - MeshPhysicalMaterial: 水面反射和透明效果
 * - 动态法线计算: 实时更新法线以正确反射光线
 *
 * 可调参数：
 * - size: 水面大小
 * - position: 位置
 * - waveHeight: 波浪高度
 * - waveSpeed: 波浪速度
 * - waveFrequency: 波浪频率
 * - color: 水面颜色
 * - opacity: 透明度
 *
 * 工作流状态：测试中
 * 最后更新：2024-01
 */

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface RippleWaterProps {
  size?: number
  position?: [number, number, number]
  waveHeight?: number
  waveSpeed?: number
  waveFrequency?: number
  color?: string
  opacity?: number
  // 网格细分程度
  segments?: number
}

// 顶点着色器 - 实现波浪效果
const vertexShader = `
  uniform float time;
  uniform float waveHeight;
  uniform float waveFrequency;

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;

  void main() {
    vUv = uv;

    // 计算波浪位移
    vec3 pos = position;

    // 多层正弦波叠加，创造更自然的水波
    float wave1 = sin(pos.x * waveFrequency + time) * waveHeight;
    float wave2 = sin(pos.y * waveFrequency * 0.8 + time * 1.2) * waveHeight * 0.5;
    float wave3 = sin((pos.x + pos.y) * waveFrequency * 0.5 + time * 0.8) * waveHeight * 0.3;

    pos.z += wave1 + wave2 + wave3;

    // 计算法线（简化版本）
    float dx = cos(pos.x * waveFrequency + time) * waveHeight * waveFrequency;
    float dy = cos(pos.y * waveFrequency * 0.8 + time * 1.2) * waveHeight * 0.5 * waveFrequency * 0.8;

    vNormal = normalize(vec3(-dx, -dy, 1.0));
    vPosition = pos;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`

// 片段着色器 - 水面渲染
const fragmentShader = `
  uniform vec3 waterColor;
  uniform float opacity;
  uniform float time;

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;

  void main() {
    // 基于法线的简单光照
    vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
    float diff = max(dot(vNormal, lightDir), 0.0);

    // 菲涅尔效果 - 边缘更亮
    vec3 viewDir = normalize(cameraPosition - vPosition);
    float fresnel = pow(1.0 - max(dot(viewDir, vNormal), 0.0), 3.0);

    // 水面颜色变化
    vec3 deepColor = waterColor * 0.5;
    vec3 shallowColor = waterColor * 1.5;
    vec3 finalColor = mix(deepColor, shallowColor, fresnel);

    // 添加高光
    vec3 reflectDir = reflect(-lightDir, vNormal);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);
    finalColor += vec3(1.0) * spec * 0.5;

    // 添加光照
    finalColor *= (0.5 + diff * 0.5);

    gl_FragColor = vec4(finalColor, opacity + fresnel * 0.3);
  }
`

export function RippleWater({
  size = 10,
  position = [0, 0, 0],
  waveHeight = 0.1,
  waveSpeed = 1,
  waveFrequency = 2,
  color = '#0066aa',
  opacity = 0.7,
  segments = 64,
}: RippleWaterProps) {
  const meshRef = useRef<THREE.Mesh>(null)

  // 创建着色器材质
  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        time: { value: 0 },
        waveHeight: { value: waveHeight },
        waveFrequency: { value: waveFrequency },
        waterColor: { value: new THREE.Color(color) },
        opacity: { value: opacity },
        cameraPosition: { value: new THREE.Vector3() },
      },
      transparent: true,
      side: THREE.DoubleSide,
    })
  }, [waveHeight, waveFrequency, color, opacity])

  // 每帧更新
  useFrame((state) => {
    if (!shaderMaterial.uniforms.time) return

    // 更新时间
    shaderMaterial.uniforms.time.value = state.clock.elapsedTime * waveSpeed

    // 更新相机位置（用于菲涅尔计算）
    shaderMaterial.uniforms.cameraPosition.value.copy(state.camera.position)
  })

  return (
    <mesh
      ref={meshRef}
      position={position}
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
    >
      <planeGeometry args={[size, size, segments, segments]} />
      <primitive object={shaderMaterial} attach="material" />
    </mesh>
  )
}

/**
 * 使用示例：
 *
 * // 基础用法 - 平静的水面
 * <RippleWater />
 *
 * // 波涛汹涌的海面
 * <RippleWater
 *   waveHeight={0.3}
 *   waveSpeed={2}
 *   waveFrequency={3}
 *   color="#003366"
 * />
 *
 * // 小池塘
 * <RippleWater
 *   size={5}
 *   waveHeight={0.05}
 *   waveSpeed={0.5}
 *   color="#006644"
 *   opacity={0.8}
 * />
 *
 * // 熔岩湖
 * <RippleWater
 *   color="#ff3300"
 *   waveHeight={0.2}
 *   waveSpeed={0.3}
 *   opacity={0.9}
 * />
 */
