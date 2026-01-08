/**
 * ShaderBasics - 着色器基础
 *
 * 展示基础着色器效果：
 * - 渐变色
 * - UV 可视化
 * - 法线可视化
 * - 基础光照
 */

import { useRef } from 'react'
import { useFrame, extend } from '@react-three/fiber'
import * as THREE from 'three'

// UV 可视化着色器
class UVVisualizerMaterial extends THREE.ShaderMaterial {
  constructor() {
    super({
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        void main() {
          gl_FragColor = vec4(vUv.x, vUv.y, 0.5, 1.0);
        }
      `,
    })
  }
}

// 法线可视化着色器
class NormalVisualizerMaterial extends THREE.ShaderMaterial {
  constructor() {
    super({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          vec3 color = vNormal * 0.5 + 0.5;
          gl_FragColor = vec4(color, 1.0);
        }
      `,
    })
  }
}

// 渐变着色器
class GradientMaterial extends THREE.ShaderMaterial {
  constructor() {
    super({
      uniforms: {
        colorA: { value: new THREE.Color('#ff6b6b') },
        colorB: { value: new THREE.Color('#4ecdc4') },
        time: { value: 0 },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vPosition;
        void main() {
          vUv = uv;
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 colorA;
        uniform vec3 colorB;
        uniform float time;
        varying vec2 vUv;
        varying vec3 vPosition;

        void main() {
          float mixValue = sin(vPosition.y * 2.0 + time) * 0.5 + 0.5;
          vec3 color = mix(colorA, colorB, mixValue);
          gl_FragColor = vec4(color, 1.0);
        }
      `,
    })
  }
}

// 基础光照着色器
class BasicLightingMaterial extends THREE.ShaderMaterial {
  constructor() {
    super({
      uniforms: {
        lightPosition: { value: new THREE.Vector3(5, 5, 5) },
        baseColor: { value: new THREE.Color('#3498db') },
        ambientStrength: { value: 0.2 },
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
        uniform vec3 lightPosition;
        uniform vec3 baseColor;
        uniform float ambientStrength;
        varying vec3 vNormal;
        varying vec3 vPosition;

        void main() {
          // 环境光
          vec3 ambient = ambientStrength * baseColor;

          // 漫反射
          vec3 lightDir = normalize(lightPosition - vPosition);
          float diff = max(dot(vNormal, lightDir), 0.0);
          vec3 diffuse = diff * baseColor;

          // 镜面反射
          vec3 viewDir = normalize(-vPosition);
          vec3 reflectDir = reflect(-lightDir, vNormal);
          float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);
          vec3 specular = spec * vec3(1.0);

          vec3 result = ambient + diffuse + specular * 0.5;
          gl_FragColor = vec4(result, 1.0);
        }
      `,
    })
  }
}

// 棋盘格着色器
class CheckerboardMaterial extends THREE.ShaderMaterial {
  constructor() {
    super({
      uniforms: {
        colorA: { value: new THREE.Color('#ffffff') },
        colorB: { value: new THREE.Color('#000000') },
        scale: { value: 10.0 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 colorA;
        uniform vec3 colorB;
        uniform float scale;
        varying vec2 vUv;

        void main() {
          vec2 pos = floor(vUv * scale);
          float pattern = mod(pos.x + pos.y, 2.0);
          vec3 color = mix(colorA, colorB, pattern);
          gl_FragColor = vec4(color, 1.0);
        }
      `,
    })
  }
}

extend({
  UVVisualizerMaterial,
  NormalVisualizerMaterial,
  GradientMaterial,
  BasicLightingMaterial,
  CheckerboardMaterial,
})

export function ShaderBasics() {
  const gradientRef = useRef<THREE.ShaderMaterial>(null)

  useFrame((state) => {
    if (gradientRef.current) {
      gradientRef.current.uniforms.time.value = state.clock.elapsedTime
    }
  })

  return (
    <group>
      {/* UV 可视化 */}
      <mesh position={[-3, 0, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        {/* @ts-expect-error - custom material */}
        <uVVisualizerMaterial />
      </mesh>

      {/* 法线可视化 */}
      <mesh position={[-1.5, 0, 0]}>
        <sphereGeometry args={[0.6, 32, 32]} />
        {/* @ts-expect-error - custom material */}
        <normalVisualizerMaterial />
      </mesh>

      {/* 动态渐变 */}
      <mesh position={[0, 0, 0]}>
        <torusGeometry args={[0.5, 0.2, 32, 64]} />
        {/* @ts-expect-error - custom material */}
        <gradientMaterial ref={gradientRef} />
      </mesh>

      {/* 基础光照 */}
      <mesh position={[1.5, 0, 0]}>
        <sphereGeometry args={[0.6, 32, 32]} />
        {/* @ts-expect-error - custom material */}
        <basicLightingMaterial />
      </mesh>

      {/* 棋盘格 */}
      <mesh position={[3, 0, 0]}>
        <planeGeometry args={[1.2, 1.2]} />
        {/* @ts-expect-error - custom material */}
        <checkerboardMaterial />
      </mesh>

      {/* 第二行 - 不同几何体上的效果 */}
      <mesh position={[-2, 0, 2]}>
        <cylinderGeometry args={[0.5, 0.5, 1, 32]} />
        {/* @ts-expect-error - custom material */}
        <uVVisualizerMaterial />
      </mesh>

      <mesh position={[0, 0, 2]}>
        <torusKnotGeometry args={[0.4, 0.15, 64, 16]} />
        {/* @ts-expect-error - custom material */}
        <normalVisualizerMaterial />
      </mesh>

      <mesh position={[2, 0, 2]}>
        <icosahedronGeometry args={[0.6, 1]} />
        {/* @ts-expect-error - custom material */}
        <basicLightingMaterial />
      </mesh>
    </group>
  )
}
