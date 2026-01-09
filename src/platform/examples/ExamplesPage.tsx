/**
 * 平台功能演示页面 - 简化版
 */

import React, { useState } from 'react'
import { usePlatform } from '../PlatformProvider'

export default function ExamplesPage() {
  const platform = usePlatform()
  const [eventLog, setEventLog] = useState<string[]>([])

  // 测试事件总线
  const handleTestEvent = () => {
    platform.eventBus.emit('test:event', { message: 'Hello from Examples!' })
    setEventLog(prev => [...prev, `发送事件: test:event at ${new Date().toLocaleTimeString()}`])
  }

  // 测试模块管理
  const handleListModules = () => {
    const modules = platform.moduleRegistry.getAll()
    setEventLog(prev => [
      ...prev,
      `已注册模块: ${modules.map(m => m.id).join(', ')}`
    ])
  }

  // 测试状态机
  const handleCheckState = () => {
    const snapshot = platform.stateService.getSnapshot()
    setEventLog(prev => [
      ...prev,
      `当前状态: ${JSON.stringify(snapshot.value)}`
    ])
  }

  // 清空日志
  const handleClearLog = () => {
    setEventLog([])
  }

  return (
    <div className="min-h-screen bg-neutral-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* 标题 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">🎯 平台功能演示</h1>
          <p className="text-gray-400">
            这个页面展示了中台平台的核心功能。打开控制台查看详细日志。
          </p>
        </div>

        {/* 功能卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* 事件总线 */}
          <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
            <h3 className="text-xl font-bold mb-3 text-blue-400">📡 事件总线</h3>
            <p className="text-sm text-gray-400 mb-4">
              模块间通过事件解耦通信
            </p>
            <button
              onClick={handleTestEvent}
              className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded transition"
            >
              发送测试事件
            </button>
          </div>

          {/* 模块管理 */}
          <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
            <h3 className="text-xl font-bold mb-3 text-green-400">📦 模块管理</h3>
            <p className="text-sm text-gray-400 mb-4">
              查看已注册的模块
            </p>
            <button
              onClick={handleListModules}
              className="w-full px-4 py-2 bg-green-500 hover:bg-green-600 rounded transition"
            >
              列出所有模块
            </button>
          </div>

          {/* 状态机 */}
          <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
            <h3 className="text-xl font-bold mb-3 text-purple-400">🎯 状态机</h3>
            <p className="text-sm text-gray-400 mb-4">
              XState驱动的状态管理
            </p>
            <button
              onClick={handleCheckState}
              className="w-full px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded transition"
            >
              查看当前状态
            </button>
          </div>
        </div>

        {/* 平台信息 */}
        <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700 mb-8">
          <h3 className="text-xl font-bold mb-4">ℹ️ 平台信息</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">平台名称:</span>
              <span className="ml-2 text-white">{platform.config.name}</span>
            </div>
            <div>
              <span className="text-gray-400">版本:</span>
              <span className="ml-2 text-white">{platform.config.version}</span>
            </div>
            <div>
              <span className="text-gray-400">模式:</span>
              <span className="ml-2 text-white">{platform.config.mode}</span>
            </div>
            <div>
              <span className="text-gray-400">已注册模块:</span>
              <span className="ml-2 text-white">
                {platform.moduleRegistry.getAll().length} 个
              </span>
            </div>
          </div>
        </div>

        {/* 事件日志 */}
        <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">📋 事件日志</h3>
            <button
              onClick={handleClearLog}
              className="px-3 py-1 text-sm bg-red-500 hover:bg-red-600 rounded transition"
            >
              清空
            </button>
          </div>
          <div className="bg-neutral-900 rounded p-4 max-h-64 overflow-y-auto">
            {eventLog.length === 0 ? (
              <p className="text-gray-500 text-sm">暂无日志，点击上方按钮测试功能</p>
            ) : (
              <ul className="space-y-2">
                {eventLog.map((log, index) => (
                  <li key={index} className="text-sm text-gray-300 font-mono">
                    [{index + 1}] {log}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* 文档链接 */}
        <div className="mt-8 bg-blue-900/20 border border-blue-500/30 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-3 text-blue-400">📚 查看文档</h3>
          <div className="space-y-2 text-sm">
            <p>
              <span className="text-gray-400">架构文档:</span>
              <code className="ml-2 text-blue-300">PLATFORM_ARCHITECTURE.md</code>
            </p>
            <p>
              <span className="text-gray-400">迁移指南:</span>
              <code className="ml-2 text-blue-300">MIGRATION_GUIDE.md</code>
            </p>
            <p>
              <span className="text-gray-400">快速开始:</span>
              <code className="ml-2 text-blue-300">PLATFORM_README.md</code>
            </p>
          </div>
        </div>

        {/* 返回按钮 */}
        <div className="mt-8 text-center">
          <a
            href="/"
            className="inline-block px-6 py-3 bg-primary-500 hover:bg-primary-600 rounded-lg transition"
          >
            ← 返回首页
          </a>
        </div>
      </div>
    </div>
  )
}
