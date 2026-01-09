import {
  EffectComposer,
  Bloom,
  Vignette,
  ChromaticAberration,
  DepthOfField,
} from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'
import { useSceneStore } from '@/stores'

interface PostProcessingProps {
  bloom?: boolean
  bloomIntensity?: number
  bloomThreshold?: number
  vignette?: boolean
  vignetteOffset?: number
  vignetteDarkness?: number
  chromaticAberration?: boolean
  chromaticOffset?: number
  depthOfField?: boolean
  focusDistance?: number
  focalLength?: number
  bokehScale?: number
}

export function PostProcessing({
  bloom = true,
  bloomIntensity = 0.5,
  bloomThreshold = 0.8,
  vignette = true,
  vignetteOffset = 0.3,
  vignetteDarkness = 0.5,
  chromaticAberration = false,
  chromaticOffset = 0.002,
  depthOfField = false,
  focusDistance = 0,
  focalLength = 0.02,
  bokehScale = 2,
}: PostProcessingProps): JSX.Element {
  const quality = useSceneStore((s) => s.quality)

  // 低质量模式下禁用后处理
  if (quality === 'low') {
    // 低质量模式下不渲染任何后处理
    return <></>
  }

  return (
    <EffectComposer>
      {bloom &&
        ((
          <Bloom
            intensity={bloomIntensity}
            luminanceThreshold={bloomThreshold}
            luminanceSmoothing={0.9}
            blendFunction={BlendFunction.ADD}
          />
        ) as any)}

      {vignette && ((<Vignette offset={vignetteOffset} darkness={vignetteDarkness} />) as any)}

      {chromaticAberration &&
        ((
          <ChromaticAberration
            offset={new THREE.Vector2(chromaticOffset, chromaticOffset)}
            blendFunction={BlendFunction.NORMAL}
            radialModulation={false}
            modulationOffset={0}
          />
        ) as any)}

      {depthOfField &&
        ((
          <DepthOfField
            focusDistance={focusDistance}
            focalLength={focalLength}
            bokehScale={bokehScale}
          />
        ) as any)}
    </EffectComposer>
  )
}

// 预设后处理效果
export function DramaticLighting() {
  return (
    <PostProcessing
      bloom
      bloomIntensity={0.8}
      bloomThreshold={0.6}
      vignette
      vignetteOffset={0.3}
      vignetteDarkness={0.7}
    />
  )
}

export function SoftFocus() {
  return (
    <PostProcessing
      bloom
      bloomIntensity={0.3}
      vignette
      vignetteOffset={0.2}
      vignetteDarkness={0.3}
      depthOfField
      focusDistance={0.01}
      focalLength={0.05}
      bokehScale={3}
    />
  )
}

export function CinematicStyle() {
  return (
    <PostProcessing
      bloom
      bloomIntensity={0.6}
      vignette
      vignetteOffset={0.4}
      vignetteDarkness={0.6}
      chromaticAberration
      chromaticOffset={0.001}
    />
  )
}
