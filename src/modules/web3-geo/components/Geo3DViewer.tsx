/**
 * @fileoverview Geo3DViewer Component
 * @description 3D 地质资产可视化组件 - 集成 Earth 模块
 */

import React, { useRef, useEffect } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'
import { chainToCoord } from '../utils'
import type { GeoAssetOnChain, GeoCoordinates, GeoMarker } from '../types'

// ============================================================
// Types
// ============================================================

interface Geo3DViewerProps {
  assets?: GeoAssetOnChain[]
  selectedAsset?: GeoAssetOnChain | null
  onAssetClick?: (asset: GeoAssetOnChain) => void
  showLabels?: boolean
  className?: string
}

// ============================================================
// Earth Component
// ============================================================

function Earth() {
  return (
    <mesh>
      <sphereGeometry args={[1, 64, 64]} />
      <meshStandardMaterial
        color="#1e40af"
        roughness={0.7}
        metalness={0.2}
      />
    </mesh>
  )
}

// ============================================================
// Asset Marker Component
// ============================================================

interface AssetMarkerProps {
  asset: GeoAssetOnChain
  isSelected: boolean
  onClick: () => void
}

function AssetMarker({ asset, isSelected, onClick }: AssetMarkerProps) {
  const meshRef = useRef<THREE.Mesh>(null)

  const latitude = chainToCoord(asset.latitude)
  const longitude = chainToCoord(asset.longitude)

  // Convert lat/lng to 3D position
  const position = latLngToVector3(latitude, longitude, 1.02)

  // Animate selected marker
  useEffect(() => {
    if (meshRef.current && isSelected) {
      meshRef.current.scale.set(1.5, 1.5, 1.5)
    } else if (meshRef.current) {
      meshRef.current.scale.set(1, 1, 1)
    }
  }, [isSelected])

  return (
    <mesh
      ref={meshRef}
      position={position}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
    >
      <sphereGeometry args={[0.015, 16, 16]} />
      <meshBasicMaterial
        color={isSelected ? '#10b981' : '#3b82f6'}
        transparent
        opacity={0.9}
      />
    </mesh>
  )
}

// ============================================================
// Camera Controller
// ============================================================

interface CameraControllerProps {
  target?: GeoCoordinates
}

function CameraController({ target }: CameraControllerProps) {
  const { camera } = useThree()

  useEffect(() => {
    if (target) {
      const position = latLngToVector3(target.latitude, target.longitude, 2.5)
      camera.position.lerp(position, 0.1)
      camera.lookAt(0, 0, 0)
    }
  }, [target, camera])

  return null
}

// ============================================================
// Main Component
// ============================================================

export const Geo3DViewer: React.FC<Geo3DViewerProps> = ({
  assets = [],
  selectedAsset,
  onAssetClick,
  showLabels = true,
  className = '',
}) => {
  const handleAssetClick = (asset: GeoAssetOnChain) => {
    if (onAssetClick) {
      onAssetClick(asset)
    }
  }

  const targetCoords = selectedAsset
    ? {
        latitude: chainToCoord(selectedAsset.latitude),
        longitude: chainToCoord(selectedAsset.longitude),
      }
    : undefined

  return (
    <div className={`geo-3d-viewer ${className}`}>
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 3]} />

        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <pointLight position={[-5, -5, -5]} intensity={0.5} />

        {/* Earth */}
        <Earth />

        {/* Asset Markers */}
        {assets.map((asset) => (
          <AssetMarker
            key={asset.tokenId.toString()}
            asset={asset}
            isSelected={selectedAsset?.tokenId === asset.tokenId}
            onClick={() => handleAssetClick(asset)}
          />
        ))}

        {/* Camera Controller */}
        <CameraController target={targetCoords} />

        {/* Controls */}
        <OrbitControls
          enablePan={false}
          minDistance={1.5}
          maxDistance={5}
          autoRotate={!selectedAsset}
          autoRotateSpeed={0.5}
        />
      </Canvas>

      {/* Info Overlay */}
      {selectedAsset && (
        <div className="geo-3d-viewer__info">
          <h3>GeoAsset #{selectedAsset.tokenId.toString()}</h3>
          <p>
            {chainToCoord(selectedAsset.latitude).toFixed(4)},{' '}
            {chainToCoord(selectedAsset.longitude).toFixed(4)}
          </p>
        </div>
      )}
    </div>
  )
}

// ============================================================
// Utilities
// ============================================================

function latLngToVector3(
  lat: number,
  lng: number,
  radius: number = 1
): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lng + 180) * (Math.PI / 180)

  const x = -(radius * Math.sin(phi) * Math.cos(theta))
  const y = radius * Math.cos(phi)
  const z = radius * Math.sin(phi) * Math.sin(theta)

  return new THREE.Vector3(x, y, z)
}

// ============================================================
// Styles
// ============================================================

export const geo3DViewerStyles = `
.geo-3d-viewer {
  position: relative;
  width: 100%;
  height: 600px;
  background: #000;
  border-radius: 16px;
  overflow: hidden;
}

.geo-3d-viewer__info {
  position: absolute;
  bottom: 24px;
  left: 24px;
  padding: 16px 20px;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: white;
}

.geo-3d-viewer__info h3 {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 600;
}

.geo-3d-viewer__info p {
  margin: 0;
  font-size: 14px;
  color: #94a3b8;
  font-family: monospace;
}
`
