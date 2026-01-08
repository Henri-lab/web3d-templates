/**
 * ToonMaterials - 卡通渲染材质
 *
 * 展示卡通/非真实感渲染效果：
 * - MeshToonMaterial
 * - 自定义卡通着色器
 * - 描边效果
 */

import { useRef, useMemo } from 'react'
import { useFrame, extend } from '@react-three/fiber'
import * as THREE from 'three'

// 自定义卡通着色器材质
class CustomToonMaterial extends THREE.ShaderMaterial {
  constructor() {
    super({
      uniforms: {
        color: { value: new THREE.Color('#ff6b6b') },
        lightPosition: { value: new THREE.Vector3(5, 5, 5) },
        steps: { value: 4 },
        outlineWidth: { value: 0.03 },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;

        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        uniform vec3 lightPosition;
        uniform float steps;

        varying vec3 vNormal;
        varying vec3 vPosition;

        void main() {
          vec3 lightDir = normalize(lightPosition - vPosition);
          float diff = max(dot(vNormal, lightDir), 0.0);

          // 量化光照为离散步骤
          float toon = floor(diff * steps) / steps;
          toon = max(toon, 0.2); // 最小亮度

          vec3 finalColor = color * toon;
          gl_FragColor = vec4(finalColor, 1.0);
        }
      `,
    })
  }
}

extend({ CustomToonMaterial })

// 描边材质
class OutlineMaterial extends THREE.ShaderMaterial {
  constructor() {
    super({
      uniforms: {
        outlineColor: { value: new THREE.Color('#000000') },
        outlineWidth: { value: 0.05 },
      },
      vertexShader: `
        uniform float outlineWidth;

        void main() {
          vec3 pos = position + normal * outlineWidth;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 outlineColor;

        void main() {
          gl_FragColor = vec4(outlineColor, 1.0);
        }
      `,
      side: THREE.BackSide,
    })
  }
}

extend({ OutlineMaterial })

// 带描边的卡通模型组件
function ToonModelWithOutline({
  position,
  color,
  geometry,
}: {
  position: [number, number, number]
  color: string
  geometry: React.ReactNode
}) {
  const gradientMap = useMemo(() => {
    const colors = new Uint8Array(4)
    colors[0] = 50   // 暗
    colors[1] = 100  // 中暗
    colors[2] = 180  // 中亮
    colors[3] = 255  // 亮
    const texture = new THREE.DataTexture(colors, 4, 1, THREE.RedFormat)
    texture.needsUpdate = true
    return texture
  }, [])

  return (
    <group position={position}>
      {/* 描边层 */}
      <mesh>
        {geometry}
        {/* @ts-expect-error - custom material */}
        <outlineMaterial outlineColor="#000000" outlineWidth={0.04} />
      </mesh>
      {/* 主体 */}
      <mesh castShadow>
        {geometry}
        <meshToonMaterial color={color} gradientMap={gradientMap} />
      </mesh>
    </group>
  )
}

export function ToonMaterials() {
  const groupRef = useRef<THREE.Group>(null)
  const customToonRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1
    }
    if (customToonRef.current) {
      customToonRef.current.rotation.y = state.clock.elapsedTime * 0.5
    }
  })

  // 创建渐变贴图
  const gradientMaps = useMemo(() => {
    const create = (steps: number) => {
      const colors = new Uint8Array(steps)
      for (let i = 0; i < steps; i++) {
        colors[i] = Math.floor((i / (steps - 1)) * 255)
      }
      const texture = new THREE.DataTexture(colors, steps, 1, THREE.RedFormat)
      texture.needsUpdate = true
      return texture
    }
    return {
      two: create(2),
      three: create(3),
      four: create(4),
      five: create(5),
    }
  }, [])

  return (
    <group ref={groupRef}>
      {/* 不同步数的卡通材质 */}
      <mesh position={[-3, 0, 0]} castShadow>
        <sphereGeometry args={[0.6, 32, 32]} />
        <meshToonMaterial color="#e74c3c" gradientMap={gradientMaps.two} />
      </mesh>

      <mesh position={[-1.5, 0, 0]} castShadow>
        <sphereGeometry args={[0.6, 32, 32]} />
        <meshToonMaterial color="#3498db" gradientMap={gradientMaps.three} />
      </mesh>

      <mesh position={[0, 0, 0]} castShadow>
        <sphereGeometry args={[0.6, 32, 32]} />
        <meshToonMaterial color="#2ecc71" gradientMap={gradientMaps.four} />
      </mesh>

      <mesh position={[1.5, 0, 0]} castShadow>
        <sphereGeometry args={[0.6, 32, 32]} />
        <meshToonMaterial color="#9b59b6" gradientMap={gradientMaps.five} />
      </mesh>

      {/* 自定义卡通着色器 */}
      <mesh ref={customToonRef} position={[3, 0, 0]} castShadow>
        <torusKnotGeometry args={[0.4, 0.15, 64, 16]} />
        {/* @ts-expect-error - custom material */}
        <customToonMaterial color="#ff6b6b" steps={3} />
      </mesh>

      {/* 带描边的卡通模型 */}
      <ToonModelWithOutline
        position={[-2, 0, 2]}
        color="#f39c12"
        geometry={<boxGeometry args={[1, 1, 1]} />}
      />

      <ToonModelWithOutline
        position={[0, 0, 2]}
        color="#1abc9c"
        geometry={<dodecahedronGeometry args={[0.6]} />}
      />

      <ToonModelWithOutline
        position={[2, 0, 2]}
        color="#e91e63"
        geometry={<cylinderGeometry args={[0.4, 0.6, 1, 32]} />}
      />
    </group>
  )
}
