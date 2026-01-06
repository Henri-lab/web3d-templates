/**
 * ComponentLabPage - Three.js 组件实验室
 *
 * 这是一个用于测试、开发和展示独立 Three.js 组件的页面
 * 工作流：概念图 → 初步实现 → 测试优化 → 二次加工 → 再优化
 *
 * 设计原则：
 * - 组件独立：每个 Three 组件都是独立文件，不过度封装
 * - 易于修改：宁愿代码长一些，也要保持可读性和可修改性
 * - 方便积累：每个组件都可以单独测试和迭代
 */

import { useState, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, Grid, Stats } from '@react-three/drei'
import { Link } from 'react-router-dom'

// 导入实验室组件
import { ReflectiveSphere } from '@/components/lab/ReflectiveSphere'
import { GlowingCrystal } from '@/components/lab/GlowingCrystal'
import { FloatingRock } from '@/components/lab/FloatingRock'
import { RippleWater } from '@/components/lab/RippleWater'
import { ParticleFlame } from '@/components/lab/ParticleFlame'

// 组件注册表 - 在这里添加新组件
const COMPONENT_REGISTRY = [
  {
    id: 'reflective-sphere',
    name: '反射玻璃球',
    description: '环境反射的玻璃球体，展示 CubeCamera 和 MeshPhysicalMaterial',
    component: ReflectiveSphere,
    status: 'stable' as const, // 'wip' | 'testing' | 'stable'
  },
  {
    id: 'glowing-crystal',
    name: '发光水晶',
    description: '带有内发光效果的水晶，使用自定义着色器实现菲涅尔边缘发光',
    component: GlowingCrystal,
    status: 'testing' as const,
  },
  {
    id: 'floating-rock',
    name: '悬浮岩石',
    description: '带有悬浮动画的岩石，程序化几何体变形',
    component: FloatingRock,
    status: 'wip' as const,
  },
  {
    id: 'ripple-water',
    name: '波纹水面',
    description: '动态波纹水面，顶点着色器实现多层正弦波叠加',
    component: RippleWater,
    status: 'testing' as const,
  },
  {
    id: 'particle-flame',
    name: '粒子火焰',
    description: '粒子系统火焰效果，支持自定义颜色和大小',
    component: ParticleFlame,
    status: 'wip' as const,
  },
]

// 状态标签颜色
const STATUS_COLORS = {
  wip: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  testing: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  stable: 'bg-green-500/20 text-green-400 border-green-500/30',
}

const STATUS_LABELS = {
  wip: '开发中',
  testing: '测试中',
  stable: '稳定',
}

export default function ComponentLabPage() {
  const [activeComponentId, setActiveComponentId] = useState(COMPONENT_REGISTRY[0]?.id)
  const [showStats, setShowStats] = useState(true)
  const [showGrid, setShowGrid] = useState(true)
  const [envPreset, setEnvPreset] = useState<'sunset' | 'dawn' | 'night' | 'warehouse' | 'forest' | 'apartment' | 'studio' | 'city' | 'park' | 'lobby'>('sunset')

  const activeComponent = COMPONENT_REGISTRY.find((c) => c.id === activeComponentId)
  const ActiveComponentElement = activeComponent?.component

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex">
      {/* 左侧边栏 - 组件列表 */}
      <aside className="w-80 bg-neutral-900 border-r border-neutral-800 flex flex-col">
        {/* 头部 */}
        <div className="p-4 border-b border-neutral-800">
          <Link
            to="/"
            className="text-neutral-400 hover:text-white text-sm flex items-center gap-2 mb-3"
          >
            ← 返回首页
          </Link>
          <h1 className="text-xl font-bold">Three.js 组件实验室</h1>
          <p className="text-neutral-400 text-sm mt-1">
            独立组件的测试与开发环境
          </p>
        </div>

        {/* 组件列表 */}
        <div className="flex-1 overflow-y-auto p-4">
          <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
            组件列表
          </h2>
          <div className="space-y-2">
            {COMPONENT_REGISTRY.map((comp) => (
              <button
                key={comp.id}
                onClick={() => setActiveComponentId(comp.id)}
                className={`w-full text-left p-3 rounded-lg transition-all ${
                  activeComponentId === comp.id
                    ? 'bg-neutral-800 border border-neutral-700'
                    : 'hover:bg-neutral-800/50 border border-transparent'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium">{comp.name}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded border ${STATUS_COLORS[comp.status]}`}
                  >
                    {STATUS_LABELS[comp.status]}
                  </span>
                </div>
                <p className="text-xs text-neutral-400 line-clamp-2">
                  {comp.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* 控制面板 */}
        <div className="p-4 border-t border-neutral-800 space-y-3">
          <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            场景控制
          </h2>

          {/* 环境预设 */}
          <div>
            <label className="text-xs text-neutral-400 block mb-1">环境光照</label>
            <select
              value={envPreset}
              onChange={(e) => setEnvPreset(e.target.value as typeof envPreset)}
              className="w-full bg-neutral-800 border border-neutral-700 rounded px-2 py-1.5 text-sm"
            >
              <option value="sunset">日落</option>
              <option value="dawn">黎明</option>
              <option value="night">夜晚</option>
              <option value="warehouse">仓库</option>
              <option value="forest">森林</option>
              <option value="apartment">公寓</option>
              <option value="studio">工作室</option>
              <option value="city">城市</option>
              <option value="park">公园</option>
              <option value="lobby">大厅</option>
            </select>
          </div>

          {/* 开关选项 */}
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showStats}
                onChange={(e) => setShowStats(e.target.checked)}
                className="rounded bg-neutral-800 border-neutral-700"
              />
              性能统计
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showGrid}
                onChange={(e) => setShowGrid(e.target.checked)}
                className="rounded bg-neutral-800 border-neutral-700"
              />
              网格
            </label>
          </div>
        </div>
      </aside>

      {/* 主内容区 - 3D 视口 */}
      <main className="flex-1 relative">
        {/* 当前组件信息 */}
        {activeComponent && (
          <div className="absolute top-4 left-4 z-10 bg-neutral-900/80 backdrop-blur-sm rounded-lg p-3 border border-neutral-800">
            <h2 className="font-bold">{activeComponent.name}</h2>
            <p className="text-sm text-neutral-400 mt-1 max-w-md">
              {activeComponent.description}
            </p>
          </div>
        )}

        {/* Three.js Canvas */}
        <Canvas
          shadows
          camera={{ position: [5, 5, 5], fov: 50 }}
          className="w-full h-full"
        >
          {/* 性能统计 */}
          {showStats && <Stats />}

          {/* 环境光照 */}
          <Environment preset={envPreset} background blur={0.5} />

          {/* 基础光照 */}
          <ambientLight intensity={0.2} />
          <directionalLight
            position={[10, 10, 5]}
            intensity={1}
            castShadow
            shadow-mapSize={[2048, 2048]}
          />

          {/* 网格辅助 */}
          {showGrid && (
            <Grid
              args={[20, 20]}
              cellSize={0.5}
              cellThickness={0.5}
              cellColor="#333"
              sectionSize={2}
              sectionThickness={1}
              sectionColor="#555"
              fadeDistance={30}
              fadeStrength={1}
              followCamera={false}
              infiniteGrid
            />
          )}

          {/* 当前激活的组件 */}
          <Suspense fallback={null}>
            {ActiveComponentElement && <ActiveComponentElement />}
          </Suspense>

          {/* 轨道控制器 */}
          <OrbitControls
            makeDefault
            enableDamping
            dampingFactor={0.05}
            minDistance={2}
            maxDistance={20}
          />
        </Canvas>

        {/* 快捷键提示 */}
        <div className="absolute bottom-4 right-4 text-xs text-neutral-500 bg-neutral-900/80 backdrop-blur-sm rounded px-3 py-2">
          鼠标左键旋转 | 右键平移 | 滚轮缩放
        </div>
      </main>
    </div>
  )
}
