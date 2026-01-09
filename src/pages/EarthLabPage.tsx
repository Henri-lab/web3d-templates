/**
 * EarthLabPage - Cesium 地球实验室
 *
 * 基于 Cesium 的地球可视化实验室
 * 用于研究地图加载、地形渲染、历史地图叠加等技术
 *
 * 注意：Cesium 有免费的开源版本，基础功能不需要 API key
 * 如需使用 Cesium Ion 的高级功能（如地形、3D Tiles），需要注册获取免费 token
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

// Cesium 实验项目类型
interface ExperimentItem {
  id: string
  name: string
  description: string
  status: 'ready' | 'needs-setup' | 'wip'
  category: 'basic' | 'terrain' | 'imagery' | 'effects'
}

// 实验项目列表
const EXPERIMENTS: ExperimentItem[] = [
  // 基础功能
  {
    id: 'basic-globe',
    name: '基础地球',
    description: '最基本的 Cesium 地球展示，包含默认影像和简单交互',
    status: 'ready',
    category: 'basic',
  },
  {
    id: 'camera-controls',
    name: '相机控制',
    description: '飞行动画、视角切换、地点定位等相机操作',
    status: 'ready',
    category: 'basic',
  },
  {
    id: 'markers-entities',
    name: '标记与实体',
    description: '在地球上添加点、线、面、3D 模型等实体',
    status: 'ready',
    category: 'basic',
  },

  // 地形相关
  {
    id: 'terrain-provider',
    name: '地形加载',
    description: '加载高程地形数据，展示山脉、峡谷等地形细节',
    status: 'needs-setup',
    category: 'terrain',
  },
  {
    id: 'terrain-analysis',
    name: '地形分析',
    description: '坡度分析、高程剖面、可视域分析等',
    status: 'wip',
    category: 'terrain',
  },

  // 影像图层
  {
    id: 'imagery-layers',
    name: '影像图层',
    description: '多种地图影像源：OpenStreetMap、Bing、天地图等',
    status: 'ready',
    category: 'imagery',
  },
  {
    id: 'historical-maps',
    name: '历史地图叠加',
    description: '叠加历史地图影像，对比古今地理变化',
    status: 'wip',
    category: 'imagery',
  },
  {
    id: 'custom-imagery',
    name: '自定义影像',
    description: '加载自定义瓦片地图服务',
    status: 'needs-setup',
    category: 'imagery',
  },

  // 特效
  {
    id: 'atmosphere',
    name: '大气效果',
    description: '大气散射、天空盒、日夜变化等效果',
    status: 'ready',
    category: 'effects',
  },
  {
    id: 'particle-effects',
    name: '粒子效果',
    description: '雨、雪、火焰等粒子系统效果',
    status: 'wip',
    category: 'effects',
  },
  {
    id: 'post-processing',
    name: '后处理效果',
    description: '泛光、景深、环境光遮蔽等后处理',
    status: 'wip',
    category: 'effects',
  },
]

// 分类信息
const CATEGORIES = {
  basic: { name: '基础功能', icon: '🌍' },
  terrain: { name: '地形系统', icon: '⛰️' },
  imagery: { name: '影像图层', icon: '🗺️' },
  effects: { name: '视觉效果', icon: '✨' },
}

// 状态颜色
const STATUS_STYLES = {
  ready: 'bg-green-500/20 text-green-400 border-green-500/30',
  'needs-setup': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  wip: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
}

const STATUS_LABELS = {
  ready: '可用',
  'needs-setup': '需配置',
  wip: '开发中',
}

// 模拟的 Cesium 视图组件（实际使用时需要安装 cesium 包）
function CesiumPlaceholder({ experiment }: { experiment: ExperimentItem | null }) {
  return (
    <div className="w-full h-full bg-gradient-to-b from-neutral-900 via-blue-950 to-neutral-900 flex items-center justify-center relative overflow-hidden">
      {/* 模拟地球 */}
      <div className="relative">
        {/* 地球主体 */}
        <div className="w-80 h-80 rounded-full bg-gradient-to-br from-blue-600 via-green-500 to-blue-800 shadow-2xl relative overflow-hidden">
          {/* 大陆轮廓模拟 */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-[20%] left-[30%] w-20 h-16 bg-green-600 rounded-full transform rotate-12" />
            <div className="absolute top-[25%] right-[20%] w-24 h-20 bg-green-600 rounded-lg transform -rotate-6" />
            <div className="absolute bottom-[30%] left-[25%] w-16 h-24 bg-green-600 rounded-lg transform rotate-45" />
            <div className="absolute top-[40%] left-[45%] w-12 h-8 bg-green-600 rounded-full" />
          </div>
          {/* 云层 */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-[15%] left-[20%] w-32 h-8 bg-white rounded-full blur-sm" />
            <div className="absolute top-[50%] right-[15%] w-24 h-6 bg-white rounded-full blur-sm" />
            <div className="absolute bottom-[25%] left-[40%] w-28 h-6 bg-white rounded-full blur-sm" />
          </div>
          {/* 高光 */}
          <div className="absolute top-4 left-8 w-20 h-20 bg-white/20 rounded-full blur-xl" />
        </div>

        {/* 大气光晕 */}
        <div className="absolute inset-0 -m-4 rounded-full bg-blue-400/10 blur-xl" />
        <div className="absolute inset-0 -m-8 rounded-full bg-blue-400/5 blur-2xl" />

        {/* 轨道环 */}
        <div className="absolute inset-0 -m-16 border border-blue-500/20 rounded-full animate-spin" style={{ animationDuration: '20s' }}>
          <div className="absolute top-0 left-1/2 w-2 h-2 bg-blue-400 rounded-full -translate-x-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* 实验信息 */}
      {experiment && (
        <div className="absolute bottom-8 left-8 right-8 bg-neutral-900/80 backdrop-blur-sm rounded-lg p-4 border border-neutral-700">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">{CATEGORIES[experiment.category].icon}</span>
            <h3 className="text-lg font-bold text-white">{experiment.name}</h3>
            <span className={`text-xs px-2 py-0.5 rounded border ${STATUS_STYLES[experiment.status]}`}>
              {STATUS_LABELS[experiment.status]}
            </span>
          </div>
          <p className="text-neutral-400 text-sm">{experiment.description}</p>

          {experiment.status === 'needs-setup' && (
            <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded text-sm">
              <p className="text-yellow-400">
                此功能需要 Cesium Ion Token。请访问{' '}
                <a
                  href="https://cesium.com/ion/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-yellow-300"
                >
                  cesium.com/ion
                </a>{' '}
                注册免费账号获取。
              </p>
            </div>
          )}

          {experiment.status === 'wip' && (
            <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded text-sm">
              <p className="text-blue-400">此功能正在开发中，敬请期待...</p>
            </div>
          )}
        </div>
      )}

      {/* 安装提示 */}
      <div className="absolute top-4 right-4 bg-neutral-900/80 backdrop-blur-sm rounded-lg p-3 border border-neutral-700 max-w-xs">
        <p className="text-xs text-neutral-400 mb-2">要启用完整功能，请安装 Cesium：</p>
        <code className="text-xs bg-neutral-800 px-2 py-1 rounded text-green-400 block">
          npm install cesium
        </code>
      </div>
    </div>
  )
}

export default function EarthLabPage() {
  const [activeCategory, setActiveCategory] = useState<keyof typeof CATEGORIES>('basic')
  const [activeExperiment, setActiveExperiment] = useState<ExperimentItem | null>(null)

  // 获取当前分类的实验
  const categoryExperiments = EXPERIMENTS.filter((e) => e.category === activeCategory)

  // 默认选中第一个实验
  useEffect(() => {
    if (!activeExperiment || activeExperiment.category !== activeCategory) {
      setActiveExperiment(categoryExperiments[0] || null)
    }
  }, [activeCategory])

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
          <h1 className="text-xl font-bold flex items-center gap-2">
            <span>🌍</span>
            Cesium 地球实验室
          </h1>
          <p className="text-neutral-400 text-sm mt-1">
            地球可视化与地图渲染技术研究
          </p>
        </div>

        {/* 分类选择 */}
        <div className="p-4 border-b border-neutral-800">
          <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
            实验分类
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {(Object.entries(CATEGORIES) as [keyof typeof CATEGORIES, typeof CATEGORIES[keyof typeof CATEGORIES]][]).map(([id, cat]) => (
              <button
                key={id}
                onClick={() => setActiveCategory(id)}
                className={`p-2 rounded-lg text-left transition-all ${
                  activeCategory === id
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

        {/* 实验列表 */}
        <div className="flex-1 overflow-y-auto p-4">
          <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
            {CATEGORIES[activeCategory].name} ({categoryExperiments.length})
          </h2>
          <div className="space-y-2">
            {categoryExperiments.map((exp) => (
              <button
                key={exp.id}
                onClick={() => setActiveExperiment(exp)}
                className={`w-full text-left p-3 rounded-lg transition-all ${
                  activeExperiment?.id === exp.id
                    ? 'bg-neutral-800 border border-neutral-700'
                    : 'hover:bg-neutral-800/50 border border-transparent'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium">{exp.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded border ${STATUS_STYLES[exp.status]}`}>
                    {STATUS_LABELS[exp.status]}
                  </span>
                </div>
                <p className="text-xs text-neutral-400 line-clamp-2">
                  {exp.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* 技术说明 */}
        <div className="p-4 border-t border-neutral-800">
          <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
            技术栈
          </h2>
          <div className="space-y-1 text-xs text-neutral-400">
            <p>• CesiumJS - 3D 地球引擎</p>
            <p>• WebGL - 硬件加速渲染</p>
            <p>• 支持 WMS/WMTS/TMS 服务</p>
            <p>• 支持 3D Tiles 格式</p>
          </div>
        </div>

        {/* 快速导航 */}
        <div className="p-4 border-t border-neutral-800">
          <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
            其他实验室
          </h2>
          <div className="flex gap-2">
            <Link
              to="/lab"
              className="flex-1 text-center py-2 px-3 bg-neutral-800 hover:bg-neutral-700 rounded text-sm transition-colors"
            >
              🎨 Three.js
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

      {/* 主内容区 - Cesium 视口 */}
      <main className="flex-1 relative">
        <CesiumPlaceholder experiment={activeExperiment} />
      </main>
    </div>
  )
}
