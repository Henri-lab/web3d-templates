import { Suspense, useRef, useEffect } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, Preload, AdaptiveDpr, AdaptiveEvents } from '@react-three/drei'
import * as THREE from 'three'
import { useSceneStore } from '@/stores'

interface SceneContainerProps {
  children: React.ReactNode
  className?: string
  orbitControls?: boolean
  shadows?: boolean
  onCreated?: () => void
}

function SceneSetup() {
  const { scene, gl, camera } = useThree()
  const setScene = useSceneStore((s) => s.setScene)
  const setCamera = useSceneStore((s) => s.setCamera)
  const setRenderer = useSceneStore((s) => s.setRenderer)

  useEffect(() => {
    setScene(scene)
    setCamera(camera as THREE.PerspectiveCamera)
    setRenderer(gl)

    return () => {
      setScene(null)
      setCamera(null)
      setRenderer(null)
    }
  }, [scene, gl, camera, setScene, setCamera, setRenderer])

  return null
}

function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#666" wireframe />
    </mesh>
  )
}

export function SceneContainer({
  children,
  className = '',
  orbitControls = true,
  shadows = true,
  onCreated,
}: SceneContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const quality = useSceneStore((s) => s.quality)

  const qualityConfig = {
    low: { dpr: [0.5, 1] as [number, number], antialias: false },
    medium: { dpr: [1, 1.5] as [number, number], antialias: true },
    high: { dpr: [1, 2] as [number, number], antialias: true },
  }

  const config = qualityConfig[quality]

  return (
    <div ref={containerRef} className={`canvas-container ${className}`}>
      <Canvas
        shadows={shadows}
        dpr={config.dpr}
        gl={{
          antialias: config.antialias,
          powerPreference: quality === 'low' ? 'low-power' : 'high-performance',
          alpha: true,
        }}
        camera={{
          position: [0, 2, 5],
          fov: 50,
          near: 0.1,
          far: 1000,
        }}
        onCreated={onCreated}
      >
        <SceneSetup />
        <AdaptiveDpr pixelated />
        <AdaptiveEvents />

        {/* 基础光照 */}
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow={shadows}
          shadow-mapSize={[2048, 2048]}
        />

        {/* 轨道控制器 */}
        {orbitControls && (
          <OrbitControls
            enableDamping
            dampingFactor={0.05}
            minDistance={2}
            maxDistance={20}
            maxPolarAngle={Math.PI * 0.85}
          />
        )}

        {/* 内容 */}
        <Suspense fallback={<LoadingFallback />}>{children}</Suspense>

        {/* 预加载 */}
        <Preload all />
      </Canvas>
    </div>
  )
}
