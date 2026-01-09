/**
 * 中台首页 - 模块入口展示
 */

import { Link } from 'react-router-dom'
import { usePlatform } from '../PlatformProvider'

// 模块图标映射
const moduleIcons: Record<string, string> = {
  story: '📚',
  lab: '🔬',
  earth: '🌍',
  welcome: '🏠',
}

// 模块颜色映射
const moduleColors: Record<string, string> = {
  story: 'from-amber-500 to-orange-600',
  lab: 'from-purple-500 to-pink-600',
  earth: 'from-blue-500 to-cyan-600',
  welcome: 'from-green-500 to-emerald-600',
}

export default function PlatformHomePage() {
  const platform = usePlatform()
  const modules = platform.modules
  const snapshot = platform.getSnapshot()
  const eventLog = platform.eventBus.getEventLog().slice(-20).reverse()

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 text-white">
      {/* 头部 */}
      <header className="border-b border-neutral-700 bg-neutral-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎯</span>
            <div>
              <h1 className="text-xl font-bold">{platform.config.name}</h1>
              <p className="text-xs text-gray-400">v{platform.config.version} · 中台系统</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
              ● 状态: {String(snapshot.value)}
            </span>
            <Link
              to="/platform-examples"
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-sm transition"
            >
              API演示
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* 欢迎区域 */}
        <section className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            欢迎使用中台系统
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            这是一个基于<span className="text-blue-400"> 配置驱动</span>、
            <span className="text-purple-400"> Zustand 状态管理</span> 和
            <span className="text-emerald-400"> 事件总线</span>的本地模块中台架构。
            所有功能模块都在同一应用内以配置方式挂载，简单可靠。
          </p>
        </section>

        {/* 模块卡片 */}
        <section className="mb-16">
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span>📦</span> 功能模块
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {modules.map((module) => {
              const firstRoute = module.config.routes?.[0]
              const firstPath = firstRoute?.path || '/'

              return (
                <Link
                  key={module.id}
                  to={firstPath}
                  className="group relative overflow-hidden rounded-2xl bg-neutral-800 border border-neutral-700 hover:border-neutral-500 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                >
                  {/* 渐变背景 */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${moduleColors[module.id] || 'from-gray-500 to-gray-600'} opacity-10 group-hover:opacity-20 transition-opacity`}
                  />

                  <div className="relative p-6">
                    {/* 图标 */}
                    <div className="text-5xl mb-4">{moduleIcons[module.id] || '📁'}</div>

                    {/* 标题 */}
                    <h4 className="text-xl font-bold mb-2">{module.config.name}</h4>

                    {/* 描述 */}
                    <p className="text-sm text-gray-400 mb-4">
                      {module.config.description || `${module.config.name}模块`}
                    </p>

                    {/* 状态标签 */}
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          module.config.type === 'local'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-blue-500/20 text-blue-400'
                        }`}
                      >
                        {module.config.type === 'local' ? '本地模块' : '远程模块'}
                      </span>
                      <span className="px-2 py-1 bg-neutral-700 rounded text-xs text-gray-400">
                        v{module.config.version}
                      </span>
                    </div>

                    {/* 路由 */}
                    <div className="mt-4 text-xs text-gray-500">路由: {firstPath}</div>
                  </div>

                  {/* 箭头 */}
                  <div className="absolute bottom-4 right-4 text-2xl opacity-0 group-hover:opacity-100 transition-opacity">
                    →
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

        {/* 快速入口 */}
        <section className="mb-16">
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span>🚀</span> 快速入口
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              to="/"
              className="p-4 bg-neutral-800 rounded-xl border border-neutral-700 hover:border-green-500 transition text-center"
            >
              <span className="text-2xl block mb-2">🏠</span>
              <span className="text-sm">欢迎页</span>
            </Link>
            <Link
              to="/stories"
              className="p-4 bg-neutral-800 rounded-xl border border-neutral-700 hover:border-amber-500 transition text-center"
            >
              <span className="text-2xl block mb-2">📚</span>
              <span className="text-sm">历史故事</span>
            </Link>
            <Link
              to="/lab"
              className="p-4 bg-neutral-800 rounded-xl border border-neutral-700 hover:border-purple-500 transition text-center"
            >
              <span className="text-2xl block mb-2">🔬</span>
              <span className="text-sm">组件实验室</span>
            </Link>
            <Link
              to="/earth"
              className="p-4 bg-neutral-800 rounded-xl border border-neutral-700 hover:border-blue-500 transition text-center"
            >
              <span className="text-2xl block mb-2">🌍</span>
              <span className="text-sm">地球可视化</span>
            </Link>
          </div>
        </section>

        {/* 平台信息 */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 平台状态 */}
          <div className="bg-neutral-800 rounded-xl p-6 border border-neutral-700">
            <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span>🎯</span> 平台状态
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">当前状态</span>
                <span className="text-green-400">{String(snapshot.value)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">已加载模块</span>
                <span>{snapshot.context.loadedModules.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">活跃模块</span>
                <span>{snapshot.context.activeModule || '无'}</span>
              </div>
            </div>
          </div>

          {/* 事件总线 */}
          <div className="bg-neutral-800 rounded-xl p-6 border border-neutral-700">
            <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span>📡</span> 事件总线
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">事件日志</span>
                <span>{platform.eventBus.getEventLog().length} 条</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">日志记录</span>
                <span className="text-green-400">已启用</span>
              </div>
            </div>
            <button
              onClick={() => platform.eventBus.emit('test:ping', { time: Date.now() })}
              className="mt-4 w-full px-3 py-2 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 transition text-sm"
            >
              发送测试事件
            </button>

            {/* 简易事件查看器 */}
            <div className="mt-4 border-t border-neutral-700 pt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400">最近事件（最多 20 条）</span>
                <button
                  onClick={() => platform.eventBus.clearEventLog()}
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  清空
                </button>
              </div>
              <div className="bg-neutral-900 rounded p-2 max-h-40 overflow-y-auto text-xs font-mono space-y-1">
                {eventLog.length === 0 ? (
                  <div className="text-gray-500">暂无事件</div>
                ) : (
                  eventLog.map((event, index) => (
                    <div key={index} className="text-gray-300">
                      <span className="text-gray-500">
                        {new Date(event.timestamp).toLocaleTimeString()} ·
                      </span>{' '}
                      <span className="text-blue-300">{event.type}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* 配置信息 */}
          <div className="bg-neutral-800 rounded-xl p-6 border border-neutral-700">
            <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span>⚙️</span> 配置信息
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">平台版本</span>
                <span>{platform.config.version}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">运行模式</span>
                <span className="text-yellow-400">{platform.config.mode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">注册模块</span>
                <span>{modules.length} 个</span>
              </div>
            </div>
          </div>
        </section>

        {/* 架构说明 */}
        <section className="mt-16 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-2xl p-8 border border-blue-500/20">
          <h3 className="text-2xl font-bold mb-6">🏗️ 架构特点</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <h4 className="font-bold text-blue-400 mb-2">配置驱动</h4>
              <p className="text-sm text-gray-400">
                所有模块通过配置文件注册，无需修改代码即可添加新模块
              </p>
            </div>
            <div>
              <h4 className="font-bold text-purple-400 mb-2">状态管理</h4>
              <p className="text-sm text-gray-400">
                使用 Zustand 实现轻量状态管理，结构简单、易于调试
              </p>
            </div>
            <div>
              <h4 className="font-bold text-green-400 mb-2">事件解耦</h4>
              <p className="text-sm text-gray-400">模块间通过事件总线通信，零依赖，灵活扩展</p>
            </div>
            <div>
              <h4 className="font-bold text-amber-400 mb-2">本地模块</h4>
              <p className="text-sm text-gray-400">
                模块以本地页面形式接入，避免远程加载带来的复杂度和不稳定性
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* 底部 */}
      <footer className="border-t border-neutral-700 mt-16 py-8 text-center text-gray-500 text-sm">
        <p>History3D Learning Platform · 中台系统 · Powered by Vite + Zustand + Local Modules</p>
      </footer>
    </div>
  )
}
