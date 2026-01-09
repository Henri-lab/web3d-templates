/**
 * AdvancedShaders - 高级着色器效果
 *
 * 展示复杂的着色器技术：
 * - 噪声效果
 * - 光线步进
 * - 后处理效果
 * - 体积效果
 */

import { useRef } from 'react'
import { useFrame, extend } from '@react-three/fiber'
import * as THREE from 'three'

// 噪声着色器
class NoiseMaterial extends THREE.ShaderMaterial {
  constructor() {
    super({
      uniforms: {
        time: { value: 0 },
        scale: { value: 3.0 },
        colorA: { value: new THREE.Color('#1a1a2e') },
        colorB: { value: new THREE.Color('#e94560') },
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
        uniform float time;
        uniform float scale;
        uniform vec3 colorA;
        uniform vec3 colorB;
        varying vec2 vUv;
        varying vec3 vPosition;

        // Simplex 2D 噪声
        vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

        float snoise(vec2 v) {
          const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                   -0.577350269189626, 0.024390243902439);
          vec2 i  = floor(v + dot(v, C.yy));
          vec2 x0 = v -   i + dot(i, C.xx);
          vec2 i1;
          i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
          vec4 x12 = x0.xyxy + C.xxzz;
          x12.xy -= i1;
          i = mod(i, 289.0);
          vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
            + i.x + vec3(0.0, i1.x, 1.0));
          vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
            dot(x12.zw,x12.zw)), 0.0);
          m = m*m;
          m = m*m;
          vec3 x = 2.0 * fract(p * C.www) - 1.0;
          vec3 h = abs(x) - 0.5;
          vec3 ox = floor(x + 0.5);
          vec3 a0 = x - ox;
          m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
          vec3 g;
          g.x  = a0.x  * x0.x  + h.x  * x0.y;
          g.yz = a0.yz * x12.xz + h.yz * x12.yw;
          return 130.0 * dot(m, g);
        }

        float fbm(vec2 p) {
          float value = 0.0;
          float amplitude = 0.5;
          for (int i = 0; i < 5; i++) {
            value += amplitude * snoise(p);
            p *= 2.0;
            amplitude *= 0.5;
          }
          return value;
        }

        void main() {
          vec2 uv = vUv * scale;
          float n = fbm(uv + time * 0.2);
          n = n * 0.5 + 0.5;

          vec3 color = mix(colorA, colorB, n);
          gl_FragColor = vec4(color, 1.0);
        }
      `,
    })
  }
}

// 等离子体着色器
class PlasmaMaterial extends THREE.ShaderMaterial {
  constructor() {
    super({
      uniforms: {
        time: { value: 0 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        varying vec2 vUv;

        void main() {
          vec2 uv = vUv * 10.0;

          float v1 = sin(uv.x + time);
          float v2 = sin(uv.y + time);
          float v3 = sin(uv.x + uv.y + time);
          float v4 = sin(sqrt(uv.x * uv.x + uv.y * uv.y) + time);

          float v = v1 + v2 + v3 + v4;

          vec3 color;
          color.r = sin(v * 0.5) * 0.5 + 0.5;
          color.g = sin(v * 0.5 + 2.094) * 0.5 + 0.5;
          color.b = sin(v * 0.5 + 4.188) * 0.5 + 0.5;

          gl_FragColor = vec4(color, 1.0);
        }
      `,
    })
  }
}

// 光线步进球体
class RaymarchSphereMaterial extends THREE.ShaderMaterial {
  constructor() {
    super({
      uniforms: {
        time: { value: 0 },
        resolution: { value: new THREE.Vector2(512, 512) },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec2 resolution;
        varying vec2 vUv;

        float sdSphere(vec3 p, float r) {
          return length(p) - r;
        }

        float sdBox(vec3 p, vec3 b) {
          vec3 q = abs(p) - b;
          return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
        }

        float scene(vec3 p) {
          float sphere = sdSphere(p - vec3(sin(time) * 0.3, 0.0, 0.0), 0.3);
          float box = sdBox(p - vec3(-sin(time) * 0.3, 0.0, 0.0), vec3(0.2));
          return min(sphere, box);
        }

        vec3 getNormal(vec3 p) {
          vec2 e = vec2(0.001, 0.0);
          return normalize(vec3(
            scene(p + e.xyy) - scene(p - e.xyy),
            scene(p + e.yxy) - scene(p - e.yxy),
            scene(p + e.yyx) - scene(p - e.yyx)
          ));
        }

        void main() {
          vec2 uv = vUv * 2.0 - 1.0;

          vec3 ro = vec3(0.0, 0.0, 2.0);
          vec3 rd = normalize(vec3(uv, -1.0));

          float t = 0.0;
          vec3 col = vec3(0.1, 0.1, 0.15);

          for (int i = 0; i < 64; i++) {
            vec3 p = ro + rd * t;
            float d = scene(p);

            if (d < 0.001) {
              vec3 n = getNormal(p);
              vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
              float diff = max(dot(n, lightDir), 0.0);
              col = vec3(0.2, 0.5, 0.8) * (diff * 0.8 + 0.2);
              break;
            }

            if (t > 10.0) break;
            t += d;
          }

          gl_FragColor = vec4(col, 1.0);
        }
      `,
    })
  }
}

// 万花筒着色器
class KaleidoscopeMaterial extends THREE.ShaderMaterial {
  constructor() {
    super({
      uniforms: {
        time: { value: 0 },
        segments: { value: 6.0 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform float segments;
        varying vec2 vUv;

        #define PI 3.14159265359

        void main() {
          vec2 uv = vUv - 0.5;

          float angle = atan(uv.y, uv.x);
          float radius = length(uv);

          // 万花筒效果
          angle = mod(angle, PI * 2.0 / segments);
          angle = abs(angle - PI / segments);

          uv = vec2(cos(angle), sin(angle)) * radius;

          // 动态图案
          float pattern = sin(uv.x * 20.0 + time) * sin(uv.y * 20.0 + time);
          pattern += sin(radius * 30.0 - time * 2.0);

          vec3 color;
          color.r = sin(pattern + time) * 0.5 + 0.5;
          color.g = sin(pattern + time + 2.094) * 0.5 + 0.5;
          color.b = sin(pattern + time + 4.188) * 0.5 + 0.5;

          gl_FragColor = vec4(color, 1.0);
        }
      `,
    })
  }
}

// 扭曲着色器
class DistortionMaterial extends THREE.ShaderMaterial {
  constructor() {
    super({
      uniforms: {
        time: { value: 0 },
        distortionStrength: { value: 0.3 },
      },
      vertexShader: `
        uniform float time;
        uniform float distortionStrength;
        varying vec2 vUv;
        varying vec3 vNormal;

        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);

          vec3 pos = position;
          float displacement = sin(pos.x * 5.0 + time) *
                              sin(pos.y * 5.0 + time) *
                              sin(pos.z * 5.0 + time) * distortionStrength;
          pos += normal * displacement;

          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        varying vec3 vNormal;

        void main() {
          vec3 color = vNormal * 0.5 + 0.5;
          gl_FragColor = vec4(color, 1.0);
        }
      `,
    })
  }
}

extend({
  NoiseMaterial,
  PlasmaMaterial,
  RaymarchSphereMaterial,
  KaleidoscopeMaterial,
  DistortionMaterial,
})

export function AdvancedShaders() {
  const noiseRef = useRef<THREE.ShaderMaterial>(null)
  const plasmaRef = useRef<THREE.ShaderMaterial>(null)
  const raymarchRef = useRef<THREE.ShaderMaterial>(null)
  const kaleidoscopeRef = useRef<THREE.ShaderMaterial>(null)
  const distortionRef = useRef<THREE.ShaderMaterial>(null)

  useFrame((state) => {
    const time = state.clock.elapsedTime

    if (noiseRef.current) noiseRef.current.uniforms.time.value = time
    if (plasmaRef.current) plasmaRef.current.uniforms.time.value = time
    if (raymarchRef.current) raymarchRef.current.uniforms.time.value = time
    if (kaleidoscopeRef.current) kaleidoscopeRef.current.uniforms.time.value = time
    if (distortionRef.current) distortionRef.current.uniforms.time.value = time
  })

  return (
    <group>
      {/* 噪声效果 */}
      <mesh position={[-2.5, 0, 0]}>
        <planeGeometry args={[1.5, 1.5]} />
        {/* @ts-expect-error - custom material */}
        <noiseMaterial ref={noiseRef} />
      </mesh>

      {/* 等离子体 */}
      <mesh position={[-0.8, 0, 0]}>
        <planeGeometry args={[1.5, 1.5]} />
        {/* @ts-expect-error - custom material */}
        <plasmaMaterial ref={plasmaRef} />
      </mesh>

      {/* 光线步进 */}
      <mesh position={[0.8, 0, 0]}>
        <planeGeometry args={[1.5, 1.5]} />
        {/* @ts-expect-error - custom material */}
        <raymarchSphereMaterial ref={raymarchRef} />
      </mesh>

      {/* 万花筒 */}
      <mesh position={[2.5, 0, 0]}>
        <planeGeometry args={[1.5, 1.5]} />
        {/* @ts-expect-error - custom material */}
        <kaleidoscopeMaterial ref={kaleidoscopeRef} />
      </mesh>

      {/* 顶点扭曲 */}
      <mesh position={[0, 0, 2]}>
        <sphereGeometry args={[0.8, 64, 64]} />
        {/* @ts-expect-error - custom material */}
        <distortionMaterial ref={distortionRef} />
      </mesh>
    </group>
  )
}
