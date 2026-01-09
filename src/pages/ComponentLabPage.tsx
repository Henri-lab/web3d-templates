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
import { OrbitControls, Environment, Grid, Stats, Html } from '@react-three/drei'
import { Link } from 'react-router-dom'

// 导入原有实验室组件
import { ReflectiveSphere } from '@/components/lab/ReflectiveSphere'
import { GlowingCrystal } from '@/components/lab/GlowingCrystal'
import { FloatingRock } from '@/components/lab/FloatingRock'
import { RippleWater } from '@/components/lab/RippleWater'
import { ParticleFlame } from '@/components/lab/ParticleFlame'

// 导入几何体组件
import { BasicGeometries, ComplexGeometries, ProceduralGeometry } from '@/components/lab/geometry'

// 导入材质组件
import { PBRMaterials, ToonMaterials, SpecialMaterials } from '@/components/lab/material'

// 导入着色器组件
import { ShaderBasics, AdvancedShaders } from '@/components/lab/shader'

// 导入模型组件
import { ModelLoader, AAARendering } from '@/components/lab/model'

// 分类定义
type CategoryId = 'effects' | 'geometry' | 'material' | 'shader' | 'model'

interface Category {
  id: CategoryId
  name: string
  icon: string
  description: string
}

interface ComponentInfo {
  id: string
  name: string
  description: string
  component: React.ComponentType
  status: 'wip' | 'testing' | 'stable'
  category: CategoryId
  tags: string[]
}

// 分类列表
const CATEGORIES: Category[] = [
  {
    id: 'effects',
    name: '特效组件',
    icon: '✨',
    description: '粒子、发光、反射等视觉特效',
  },
  {
    id: 'geometry',
    name: '几何体',
    icon: '🔷',
    description: '基础到复杂的几何体展示',
  },
  {
    id: 'material',
    name: '材质系统',
    icon: '🎨',
    description: 'PBR、卡通、特殊材质效果',
  },
  {
    id: 'shader',
    name: '着色器',
    icon: '🌈',
    description: '从基础到高级的着色器技术',
  },
  {
    id: 'model',
    name: '模型渲染',
    icon: '🎮',
    description: '高精度模型加载与 AAA 级渲染',
  },
]

// 组件注册表
const COMPONENT_REGISTRY: ComponentInfo[] = [
  // 特效组件
  {
    id: 'reflective-sphere',
    name: '反射玻璃球',
    description: '环境反射的玻璃球体，展示 CubeCamera 和 MeshPhysicalMaterial',
    component: ReflectiveSphere,
    status: 'stable',
    category: 'effects',
    tags: ['反射', '物理材质', 'CubeCamera'],
  },
  {
    id: 'glowing-crystal',
    name: '发光水晶',
    description: '带有内发光效果的水晶，使用自定义着色器实现菲涅尔边缘发光',
    component: GlowingCrystal,
    status: 'testing',
    category: 'effects',
    tags: ['发光', '着色器', '菲涅尔'],
  },
  {
    id: 'floating-rock',
    name: '悬浮岩石',
    description: '带有悬浮动画的岩石，程序化几何体变形',
    component: FloatingRock,
    status: 'wip',
    category: 'effects',
    tags: ['动画', '程序化', '悬浮'],
  },
  {
    id: 'ripple-water',
    name: '波纹水面',
    description: '动态波纹水面，顶点着色器实现多层正弦波叠加',
    component: RippleWater,
    status: 'testing',
    category: 'effects',
    tags: ['水面', '着色器', '动画'],
  },
  {
    id: 'particle-flame',
    name: '粒子火焰',
    description: '粒子系统火焰效果，支持自定义颜色和大小',
    component: ParticleFlame,
    status: 'wip',
    category: 'effects',
    tags: ['粒子', '火焰', '着色器'],
  },

  // 几何体组件
  {
    id: 'basic-geometries',
    name: '基础几何体',
    description: 'Three.js 内置的基础几何体：立方体、球体、圆柱体、圆锥体、圆环等',
    component: BasicGeometries,
    status: 'stable',
    category: 'geometry',
    tags: ['基础', '内置', '简单'],
  },
  {
    id: 'complex-geometries',
    name: '复杂几何体',
    description: '参数化曲面、挤出几何体、车削几何体、管道几何体、环面结',
    component: ComplexGeometries,
    status: 'stable',
    category: 'geometry',
    tags: ['复杂', '参数化', '曲线'],
  },
  {
    id: 'procedural-geometry',
    name: '程序化几何体',
    description: '通过代码动态生成：噪声变形球体、程序化地形、动态波浪网格',
    component: ProceduralGeometry,
    status: 'testing',
    category: 'geometry',
    tags: ['程序化', '噪声', '动态'],
  },

  // 材质组件
  {
    id: 'pbr-materials',
    name: 'PBR 物理材质',
    description: '物理基础渲染材质对比：粗糙度、金属度、清漆、透射、丝绒光泽',
    component: PBRMaterials,
    status: 'stable',
    category: 'material',
    tags: ['PBR', '物理', '真实感'],
  },
  {
    id: 'toon-materials',
    name: '卡通材质',
    description: '卡通/非真实感渲染：MeshToonMaterial、描边效果、自定义卡通着色器',
    component: ToonMaterials,
    status: 'testing',
    category: 'material',
    tags: ['卡通', 'NPR', '描边'],
  },
  {
    id: 'special-materials',
    name: '特殊材质',
    description: '全息效果、能量护盾、溶解效果等科幻风格材质',
    component: SpecialMaterials,
    status: 'testing',
    category: 'material',
    tags: ['全息', '护盾', '溶解', '科幻'],
  },

  // 着色器组件
  {
    id: 'shader-basics',
    name: '着色器基础',
    description: 'UV 可视化、法线可视化、渐变、基础光照、棋盘格等基础着色器',
    component: ShaderBasics,
    status: 'stable',
    category: 'shader',
    tags: ['基础', 'UV', '法线', '光照'],
  },
  {
    id: 'advanced-shaders',
    name: '高级着色器',
    description: '噪声效果、等离子体、光线步进、万花筒、顶点扭曲等高级技术',
    component: AdvancedShaders,
    status: 'testing',
    category: 'shader',
    tags: ['噪声', '光线步进', '高级'],
  },

  // 模型组件
  {
    id: 'model-loader',
    name: '模型加载技术',
    description: '高精度模型加载、LOD 细节层次、实例化渲染等优化技术',
    component: ModelLoader,
    status: 'testing',
    category: 'model',
    tags: ['模型', 'LOD', '实例化', '优化'],
  },
  {
    id: 'aaa-rendering',
    name: 'AAA 级渲染',
    description: '游戏大作级别渲染：反射地板、体积光、粒子系统、动态光照',
    component: AAARendering,
    status: 'wip',
    category: 'model',
    tags: ['AAA', '游戏', '高质量', '光照'],
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

// 加载指示器
function LoadingFallback() {
  return (
    <Html center>
      <div className="bg-neutral-900/90 text-white px-6 py-4 rounded-lg border border-neutral-700">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span>加载组件中...</span>
        </div>
      </div>
    </Html>
  )
}

export default function ComponentLabPage() {
  const [activeCategory, setActiveCategory] = useState<CategoryId>('effects')
  const [activeComponentId, setActiveComponentId] = useState<string | null>(null)
  const [showStats, setShowStats] = useState(true)
  const [showGrid, setShowGrid] = useState(true)
  const [envPreset, setEnvPreset] = useState<
    | 'sunset'
    | 'dawn'
    | 'night'
    | 'warehouse'
    | 'forest'
    | 'apartment'
    | 'studio'
    | 'city'
    | 'park'
    | 'lobby'
  >('sunset')

  // 获取当前分类的组件
  const categoryComponents = COMPONENT_REGISTRY.filter((c) => c.category === activeCategory)

  // 获取当前激活的组件
  const activeComponent = activeComponentId
    ? COMPONENT_REGISTRY.find((c) => c.id === activeComponentId)
    : categoryComponents[0]

  const ActiveComponentElement = activeComponent?.component

  // 切换分类时重置选中的组件
  const handleCategoryChange = (categoryId: CategoryId) => {
    setActiveCategory(categoryId)
    setActiveComponentId(null)
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex">
      {/* 左侧边栏 */}
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
          <p className="text-neutral-400 text-sm mt-1">独立组件的测试与开发环境</p>
        </div>

        {/* 分类选择 */}
        <div className="p-4 border-b border-neutral-800">
          <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
            组件分类
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`p-2 rounded-lg text-left transition-all ${
                  activeCategory === cat.id
                    ? 'bg-blue-600/20 border border-blue-500/50 text-blue-400'
                    : 'bg-neutral-800/50 border border-transparent hover:bg-neutral-800 text-neutral-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{cat.icon}</span>
                  <span className="text-sm font-medium">{cat.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 组件列表 */}
        <div className="flex-1 overflow-y-auto p-4">
          <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
            {CATEGORIES.find((c) => c.id === activeCategory)?.name} ({categoryComponents.length})
          </h2>
          <div className="space-y-2">
            {categoryComponents.map((comp) => (
              <button
                key={comp.id}
                onClick={() => setActiveComponentId(comp.id)}
                className={`w-full text-left p-3 rounded-lg transition-all ${
                  activeComponent?.id === comp.id
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
                <p className="text-xs text-neutral-400 line-clamp-2 mb-2">{comp.description}</p>
                <div className="flex flex-wrap gap-1">
                  {comp.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-1.5 py-0.5 bg-neutral-800 text-neutral-400 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
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

        {/* 快速导航 */}
        <div className="p-4 border-t border-neutral-800">
          <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
            其他实验室
          </h2>
          <div className="flex gap-2">
            <Link
              to="/earth"
              className="flex-1 text-center py-2 px-3 bg-neutral-800 hover:bg-neutral-700 rounded text-sm transition-colors"
            >
              🌍 Cesium 地球
            </Link>
            <Link
              to="/react-test"
              className="flex-1 text-center py-2 px-3 bg-neutral-800 hover:bg-neutral-700 rounded text-sm transition-colors"
            >
              ⚛️ React 实验
            </Link>
          </div>
        </div>
      </aside>

      {/* 主内容区 - 3D 视口 */}
      <main className="flex-1 relative">
        {/* 当前组件信息 */}
        {activeComponent && (
          <div className="absolute top-4 left-4 z-10 bg-neutral-900/80 backdrop-blur-sm rounded-lg p-3 border border-neutral-800 max-w-md">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">
                {CATEGORIES.find((c) => c.id === activeComponent.category)?.icon}
              </span>
              <h2 className="font-bold">{activeComponent.name}</h2>
              <span
                className={`text-xs px-2 py-0.5 rounded border ${STATUS_COLORS[activeComponent.status]}`}
              >
                {STATUS_LABELS[activeComponent.status]}
              </span>
            </div>
            <p className="text-sm text-neutral-400">{activeComponent.description}</p>
          </div>
        )}

        {/* Three.js Canvas */}
        <Canvas shadows camera={{ position: [5, 5, 5], fov: 50 }} className="w-full h-full">
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
          <Suspense fallback={<LoadingFallback />}>
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

        {/* 组件数量统计 */}
        <div className="absolute bottom-4 left-4 text-xs text-neutral-500 bg-neutral-900/80 backdrop-blur-sm rounded px-3 py-2">
          共 {COMPONENT_REGISTRY.length} 个组件 | {CATEGORIES.length} 个分类
        </div>
      </main>
    </div>
  )
}
