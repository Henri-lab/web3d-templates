/**
 * SpecialMaterials - 特殊材质效果
 *
 * 展示各种特殊材质效果：
 * - 全息效果
 * - 能量护盾
 * - 溶解效果
 * - 扫描线效果
 */

import { useRef } from 'react'
import { useFrame, extend } from '@react-three/fiber'
import * as THREE from 'three'

// 全息材质
class HologramMaterial extends THREE.ShaderMaterial {
  constructor() {
    super({
      uniforms: {
        time: { value: 0 },
        color: { value: new THREE.Color('#00ffff') },
        scanlineSpeed: { value: 2.0 },
        scanlineCount: { value: 50.0 },
        glitchIntensity: { value: 0.1 },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vPosition;
        varying vec3 vNormal;

        void main() {
          vUv = uv;
          vPosition = position;
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 color;
        uniform float scanlineSpeed;
        uniform float scanlineCount;
        uniform float glitchIntensity;

        varying vec2 vUv;
        varying vec3 vPosition;
        varying vec3 vNormal;

        float random(vec2 st) {
          return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
        }

        void main() {
          // 扫描线
          float scanline = sin(vPosition.y * scanlineCount + time * scanlineSpeed) * 0.5 + 0.5;
          scanline = pow(scanline, 2.0);

          // 菲涅尔边缘发光
          vec3 viewDir = normalize(cameraPosition - vPosition);
          float fresnel = pow(1.0 - abs(dot(viewDir, vNormal)), 3.0);

          // 故障效果
          float glitch = step(0.99, random(vec2(time * 0.1, vUv.y))) * glitchIntensity;

          // 组合
          float alpha = scanline * 0.3 + fresnel * 0.7 + glitch;
          alpha = clamp(alpha, 0.1, 0.9);

          vec3 finalColor = color * (1.0 + fresnel * 0.5);
          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  }
}

// 能量护盾材质
class ShieldMaterial extends THREE.ShaderMaterial {
  constructor() {
    super({
      uniforms: {
        time: { value: 0 },
        color: { value: new THREE.Color('#ff00ff') },
        impactPoint: { value: new THREE.Vector3(0, 0, 1) },
        impactTime: { value: -10.0 },
      },
      vertexShader: `
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying vec2 vUv;

        void main() {
          vPosition = position;
          vNormal = normalize(normalMatrix * normal);
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 color;
        uniform vec3 impactPoint;
        uniform float impactTime;

        varying vec3 vPosition;
        varying vec3 vNormal;
        varying vec2 vUv;

        void main() {
          // 六边形图案
          vec2 hexUv = vUv * 20.0;
          vec2 hexId = floor(hexUv);
          float hex = step(0.8, fract(hexUv.x + hexUv.y * 0.5));

          // 菲涅尔
          vec3 viewDir = normalize(cameraPosition - vPosition);
          float fresnel = pow(1.0 - abs(dot(viewDir, vNormal)), 2.0);

          // 波纹效果
          float dist = distance(vPosition, impactPoint);
          float ripple = sin(dist * 10.0 - (time - impactTime) * 5.0);
          ripple *= exp(-(time - impactTime) * 2.0);
          ripple = max(ripple, 0.0);

          // 流动效果
          float flow = sin(vUv.y * 30.0 + time * 2.0) * 0.5 + 0.5;

          float alpha = fresnel * 0.6 + hex * 0.1 + ripple * 0.3 + flow * 0.1;
          alpha = clamp(alpha, 0.05, 0.8);

          vec3 finalColor = color * (1.0 + ripple);
          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
  }
}

// 溶解材质
class DissolveMaterial extends THREE.ShaderMaterial {
  constructor() {
    super({
      uniforms: {
        time: { value: 0 },
        baseColor: { value: new THREE.Color('#4ecdc4') },
        edgeColor: { value: new THREE.Color('#ff6b6b') },
        dissolveAmount: { value: 0.5 },
        edgeWidth: { value: 0.1 },
      },
      vertexShader: `
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying vec2 vUv;

        void main() {
          vPosition = position;
          vNormal = normal;
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 baseColor;
        uniform vec3 edgeColor;
        uniform float dissolveAmount;
        uniform float edgeWidth;

        varying vec3 vPosition;
        varying vec3 vNormal;
        varying vec2 vUv;

        // 简单噪声
        float noise(vec3 p) {
          return fract(sin(dot(p, vec3(12.9898, 78.233, 45.543))) * 43758.5453);
        }

        float fbm(vec3 p) {
          float value = 0.0;
          float amplitude = 0.5;
          for (int i = 0; i < 4; i++) {
            value += amplitude * noise(p);
            p *= 2.0;
            amplitude *= 0.5;
          }
          return value;
        }

        void main() {
          float n = fbm(vPosition * 3.0);

          // 溶解阈值
          float threshold = dissolveAmount;

          if (n < threshold) {
            discard;
          }

          // 边缘发光
          float edge = smoothstep(threshold, threshold + edgeWidth, n);
          vec3 finalColor = mix(edgeColor, baseColor, edge);

          // 边缘额外发光
          if (edge < 0.5) {
            finalColor += edgeColor * (1.0 - edge * 2.0) * 2.0;
          }

          gl_FragColor = vec4(finalColor, 1.0);
        }
      `,
    })
  }
}

extend({ HologramMaterial, ShieldMaterial, DissolveMaterial })

export function SpecialMaterials() {
  const hologramRef = useRef<THREE.ShaderMaterial>(null)
  const shieldRef = useRef<THREE.ShaderMaterial>(null)
  const dissolveRef = useRef<THREE.ShaderMaterial>(null)

  useFrame((state) => {
    const time = state.clock.elapsedTime

    if (hologramRef.current) {
      hologramRef.current.uniforms.time.value = time
    }
    if (shieldRef.current) {
      shieldRef.current.uniforms.time.value = time
      // 模拟周期性撞击
      if (Math.floor(time) % 3 === 0 && time % 1 < 0.1) {
        shieldRef.current.uniforms.impactTime.value = time
        shieldRef.current.uniforms.impactPoint.value
          .set(Math.random() - 0.5, Math.random() - 0.5, 1)
          .normalize()
      }
    }
    if (dissolveRef.current) {
      // 循环溶解动画
      dissolveRef.current.uniforms.dissolveAmount.value =
        (Math.sin(time * 0.5) * 0.5 + 0.5) * 0.8 + 0.1
    }
  })

  return (
    <group>
      {/* 全息效果 */}
      <mesh position={[-2.5, 0.5, 0]}>
        <torusKnotGeometry args={[0.5, 0.2, 128, 32]} />
        {/* @ts-expect-error - custom material */}
        <hologramMaterial ref={hologramRef} color="#00ffff" />
      </mesh>

      {/* 能量护盾 */}
      <mesh position={[0, 0.5, 0]}>
        <sphereGeometry args={[1, 64, 64]} />
        {/* @ts-expect-error - custom material */}
        <shieldMaterial ref={shieldRef} color="#ff00ff" />
      </mesh>

      {/* 溶解效果 */}
      <mesh position={[2.5, 0.5, 0]} castShadow>
        <icosahedronGeometry args={[0.8, 2]} />
        {/* @ts-expect-error - custom material */}
        <dissolveMaterial ref={dissolveRef} />
      </mesh>

      {/* 内部物体（护盾内） */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[0.6, 0.6, 0.6]} />
        <meshStandardMaterial color="#ffffff" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  )
}
