import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import * as THREE from 'three'

interface SceneStore {
  // Three.js 对象引用
  scene: THREE.Scene | null
  camera: THREE.PerspectiveCamera | null
  renderer: THREE.WebGLRenderer | null

  // 相机状态
  cameraPosition: [number, number, number]
  cameraTarget: [number, number, number]
  cameraFov: number

  // 性能设置
  quality: 'low' | 'medium' | 'high'
  pixelRatio: number
  antialias: boolean

  // 交互状态
  isInteracting: boolean
  raycasterResults: THREE.Intersection[]

  // 动作
  setScene: (scene: THREE.Scene | null) => void
  setCamera: (camera: THREE.PerspectiveCamera | null) => void
  setRenderer: (renderer: THREE.WebGLRenderer | null) => void

  setCameraPosition: (position: [number, number, number]) => void
  setCameraTarget: (target: [number, number, number]) => void
  setCameraFov: (fov: number) => void

  setQuality: (quality: 'low' | 'medium' | 'high') => void
  setInteracting: (interacting: boolean) => void
  setRaycasterResults: (results: THREE.Intersection[]) => void

  // 辅助方法
  getSceneObjects: () => THREE.Object3D[]
  findObjectByName: (name: string) => THREE.Object3D | undefined
}

export const useSceneStore = create<SceneStore>()(
  devtools(
    (set, get) => ({
      scene: null,
      camera: null,
      renderer: null,
      cameraPosition: [0, 2, 5],
      cameraTarget: [0, 0, 0],
      cameraFov: 50,
      quality: 'high',
      pixelRatio: Math.min(window.devicePixelRatio, 2),
      antialias: true,
      isInteracting: false,
      raycasterResults: [],

      setScene: (scene) => set({ scene }),
      setCamera: (camera) => set({ camera }),
      setRenderer: (renderer) => set({ renderer }),

      setCameraPosition: (cameraPosition) => set({ cameraPosition }),
      setCameraTarget: (cameraTarget) => set({ cameraTarget }),
      setCameraFov: (cameraFov) => set({ cameraFov }),

      setQuality: (quality) => {
        const config = {
          low: { pixelRatio: 1, antialias: false },
          medium: { pixelRatio: 1.5, antialias: true },
          high: { pixelRatio: Math.min(window.devicePixelRatio, 2), antialias: true },
        }
        set({ quality, ...config[quality] })
      },

      setInteracting: (isInteracting) => set({ isInteracting }),
      setRaycasterResults: (raycasterResults) => set({ raycasterResults }),

      getSceneObjects: () => {
        const { scene } = get()
        if (!scene) return []
        const objects: THREE.Object3D[] = []
        scene.traverse((obj) => objects.push(obj))
        return objects
      },

      findObjectByName: (name: string) => {
        const { scene } = get()
        return scene?.getObjectByName(name)
      },
    }),
    { name: 'scene-store' },
  ),
)
