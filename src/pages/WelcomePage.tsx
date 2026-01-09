import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { usePlatform } from '@platform/PlatformProvider'

// 模块配置
const modules = [
  {
    id: 'stories',
    title: '历史故事',
    subtitle: 'Historical Stories',
    description: '沉浸式3D体验，穿越时空探索中华五千年历史',
    icon: '📚',
    path: '/stories',
    color: 'from-amber-500 to-orange-600',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    hoverBorder: 'hover:border-amber-500',
  },
  {
    id: 'lab',
    title: '组件实验室',
    subtitle: 'Component Lab',
    description: 'Three.js 组件展示与实验，探索3D技术的无限可能',
    icon: '🔬',
    path: '/lab',
    color: 'from-purple-500 to-pink-600',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    hoverBorder: 'hover:border-purple-500',
  },
  {
    id: 'earth',
    title: '地球可视化',
    subtitle: 'Earth Visualization',
    description: '全球数据可视化，以地球为画布展示世界',
    icon: '🌍',
    path: '/earth',
    color: 'from-blue-500 to-cyan-600',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    hoverBorder: 'hover:border-blue-500',
  },
  {
    id: 'platform',
    title: '中台管理',
    subtitle: 'Platform Console',
    description: '平台配置与模块管理，查看系统状态',
    icon: '⚙️',
    path: '/platform',
    color: 'from-slate-500 to-slate-700',
    bgColor: 'bg-slate-500/10',
    borderColor: 'border-slate-500/30',
    hoverBorder: 'hover:border-slate-500',
  },
]

// 快捷入口
const quickLinks = [
  { title: 'API演示', path: '/platform-examples', icon: '🎯' },
  { title: 'React测试', path: '/react-test', icon: '⚛️' },
]

export default function WelcomePage() {
  const navigate = useNavigate()
  const platform = usePlatform()
  const snapshot = platform.stateService.getSnapshot()

  return (
    <div className="min-h-screen bg-neutral-950">
      {/* 顶部导航栏 */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-neutral-950/80 backdrop-blur-xl border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <span className="text-xl">📜</span>
            </div>
            <div>
              <h1 className="text-white font-semibold text-lg leading-tight">History3D</h1>
              <p className="text-neutral-500 text-xs">Learning Platform</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            {modules.slice(0, 3).map((m) => (
              <button
                key={m.id}
                onClick={() => navigate(m.path)}
                className="text-neutral-400 hover:text-white transition text-sm"
              >
                {m.title}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 bg-green-500/10 text-green-400 rounded-full text-xs">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              系统正常
            </span>
            <button
              onClick={() => navigate('/platform')}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-neutral-700 rounded-lg text-white text-sm transition"
            >
              控制台
            </button>
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="pt-16">
        {/* Hero区域 */}
        <section className="relative overflow-hidden">
          {/* 背景装饰 */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
          </div>

          <div className="relative max-w-7xl mx-auto px-6 py-24 md:py-32">
            <motion.div
              className="max-w-3xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 text-sm mb-6">
                <span>✨</span>
                <span>中台系统 v{platform.config.version}</span>
              </div>

              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                探索历史
                <br />
                <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                  沉浸式学习体验
                </span>
              </h1>

              <p className="text-lg text-neutral-400 mb-8 max-w-xl">
                基于 WebGL 和微前端架构的现代化学习平台，
                通过3D交互技术让历史学习变得生动有趣。
              </p>

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => navigate('/stories')}
                  className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-medium rounded-xl transition shadow-lg shadow-amber-500/20"
                >
                  开始探索
                </button>
                <button
                  onClick={() => navigate('/platform')}
                  className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-neutral-700 text-white font-medium rounded-xl transition"
                >
                  了解架构
                </button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* 模块卡片区 */}
        <section className="max-w-7xl mx-auto px-6 py-16">
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold text-white mb-2">功能模块</h2>
            <p className="text-neutral-500">选择一个模块开始使用</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {modules.map((module, index) => (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <button
                  onClick={() => navigate(module.path)}
                  className={`w-full text-left p-6 rounded-2xl border ${module.borderColor} ${module.hoverBorder} ${module.bgColor} transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${module.color} flex items-center justify-center text-2xl shadow-lg`}>
                      {module.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-xl font-semibold text-white">{module.title}</h3>
                        <span className="text-neutral-600 group-hover:text-neutral-400 transition">→</span>
                      </div>
                      <p className="text-xs text-neutral-500 mb-2">{module.subtitle}</p>
                      <p className="text-sm text-neutral-400">{module.description}</p>
                    </div>
                  </div>
                </button>
              </motion.div>
            ))}
          </div>
        </section>

        {/* 快捷入口 */}
        <section className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-wrap gap-3">
            <span className="text-neutral-500 text-sm py-2">快捷入口:</span>
            {quickLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-lg text-neutral-300 text-sm transition flex items-center gap-2"
              >
                <span>{link.icon}</span>
                <span>{link.title}</span>
              </button>
            ))}
          </div>
        </section>

        {/* 状态信息 */}
        <section className="max-w-7xl mx-auto px-6 py-16">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-4 gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="p-5 bg-neutral-900/50 rounded-xl border border-neutral-800">
              <div className="text-neutral-500 text-sm mb-1">平台状态</div>
              <div className="text-2xl font-semibold text-green-400">{String(snapshot.value)}</div>
            </div>
            <div className="p-5 bg-neutral-900/50 rounded-xl border border-neutral-800">
              <div className="text-neutral-500 text-sm mb-1">注册模块</div>
              <div className="text-2xl font-semibold text-white">{platform.moduleRegistry.getAll().length}</div>
            </div>
            <div className="p-5 bg-neutral-900/50 rounded-xl border border-neutral-800">
              <div className="text-neutral-500 text-sm mb-1">事件日志</div>
              <div className="text-2xl font-semibold text-white">{platform.eventBus.getEventLog().length}</div>
            </div>
            <div className="p-5 bg-neutral-900/50 rounded-xl border border-neutral-800">
              <div className="text-neutral-500 text-sm mb-1">运行模式</div>
              <div className="text-2xl font-semibold text-amber-400">{platform.config.mode}</div>
            </div>
          </motion.div>
        </section>

        {/* 技术栈 */}
        <section className="max-w-7xl mx-auto px-6 py-16 border-t border-neutral-800">
          <div className="text-center mb-8">
            <h3 className="text-lg font-semibold text-white mb-2">技术栈</h3>
            <p className="text-neutral-500 text-sm">Powered by modern web technologies</p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {['React 18', 'Vite', 'Three.js', 'XState', 'Module Federation', 'TypeScript', 'Tailwind CSS'].map((tech) => (
              <span
                key={tech}
                className="px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-400 text-sm"
              >
                {tech}
              </span>
            ))}
          </div>
        </section>
      </main>

      {/* 底部 */}
      <footer className="border-t border-neutral-800 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-neutral-500 text-sm">
            © 2024 History3D Learning Platform. 中台系统架构.
          </p>
          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate('/platform')}
              className="text-neutral-500 hover:text-white text-sm transition"
            >
              平台管理
            </button>
            <button
              onClick={() => navigate('/platform-examples')}
              className="text-neutral-500 hover:text-white text-sm transition"
            >
              API文档
            </button>
          </div>
        </div>
      </footer>
    </div>
  )
}
