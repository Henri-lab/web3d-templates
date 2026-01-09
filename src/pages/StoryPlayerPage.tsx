import { useParams, useNavigate } from 'react-router-dom'
import { Suspense, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SceneContainer } from '@/components/scene/SceneContainer'
import { Particles } from '@/components/effects/Particles'
import { PostProcessing } from '@/components/effects/PostProcessing'
import { Button, CompactTimeline } from '@/components/ui'
import type { TimelineEvent } from '@/types'

// 示例时间轴数据
const sampleTimeline: TimelineEvent[] = [
  { id: '1', year: '公元前230年', title: '灭韩', description: '秦国首先灭韩国', type: 'major' },
  { id: '2', year: '公元前228年', title: '灭赵', description: '攻占赵国都城邯郸', type: 'major' },
  { id: '3', year: '公元前225年', title: '灭魏', description: '水淹大梁灭魏', type: 'major' },
  { id: '4', year: '公元前223年', title: '灭楚', description: '王翦率军灭楚', type: 'major' },
  { id: '5', year: '公元前222年', title: '灭燕', description: '攻占燕都蓟城', type: 'major' },
  { id: '6', year: '公元前221年', title: '灭齐', description: '最后灭齐，统一六国', type: 'milestone' },
]

function DemoScene() {
  return (
    <>
      {/* 地面 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>

      {/* 演示物体 */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#e6b000" metalness={0.5} roughness={0.3} />
      </mesh>

      <mesh position={[2, 0.5, -1]} castShadow>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color="#dc143c" metalness={0.5} roughness={0.3} />
      </mesh>

      <mesh position={[-2, 0.75, 0]} castShadow>
        <cylinderGeometry args={[0.4, 0.4, 1.5, 32]} />
        <meshStandardMaterial color="#4682b4" metalness={0.5} roughness={0.3} />
      </mesh>

      {/* 粒子效果 */}
      <Particles count={500} size={0.02} color="#ffd700" spread={20} speed={0.0005} opacity={0.4} />

      {/* 后处理 */}
      <PostProcessing bloom bloomIntensity={0.5} vignette />
    </>
  )
}

export default function StoryPlayerPage() {
  useParams() // 当前示例场景未使用路由参数，先调用以保持接口稳定
  const navigate = useNavigate()
  const [currentTimelineIndex, setCurrentTimelineIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [showInfo, setShowInfo] = useState(false)

  const handleBack = () => {
    navigate('/stories')
  }

  const handleTimelineChange = (index: number) => {
    setCurrentTimelineIndex(index)
  }

  return (
    <div className="relative min-h-screen bg-black">
      {/* 3D 场景 */}
      <div className="absolute inset-0">
        <SceneContainer orbitControls shadows>
          <Suspense fallback={null}>
            <DemoScene />
          </Suspense>
        </SceneContainer>
      </div>

      {/* UI 叠加层 */}
      <div className="ui-overlay">
        {/* 顶部控制栏 */}
        <motion.header
          className="absolute top-0 left-0 right-0 p-4"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center justify-between">
            <Button variant="glass" size="sm" onClick={handleBack}>
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              返回
            </Button>

            <div className="flex items-center gap-2">
              <Button variant="glass" size="icon" onClick={() => setIsPaused(!isPaused)}>
                {isPaused ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  </svg>
                )}
              </Button>

              <Button variant="glass" size="icon" onClick={() => setShowInfo(!showInfo)}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </Button>
            </div>
          </div>
        </motion.header>

        {/* 故事标题 */}
        <motion.div
          className="absolute top-20 left-4 right-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
        >
          <h1 className="text-3xl font-bold text-white mb-2 font-primary">秦始皇统一六国</h1>
          <p className="text-neutral-300">公元前230年 - 公元前221年</p>
        </motion.div>

        {/* 时间轴 */}
        <motion.div
          className="absolute bottom-24 left-4 right-4"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <div className="bg-black/40 backdrop-blur-md rounded-2xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">
                {sampleTimeline[currentTimelineIndex].title}
              </h3>
              <span className="text-primary-400 text-sm">
                {sampleTimeline[currentTimelineIndex].year}
              </span>
            </div>
            <p className="text-neutral-300 text-sm mb-4">
              {sampleTimeline[currentTimelineIndex].description}
            </p>
            <CompactTimeline
              events={sampleTimeline}
              currentIndex={currentTimelineIndex}
              onIndexChange={handleTimelineChange}
            />
          </div>
        </motion.div>

        {/* 底部控制栏 */}
        <motion.div
          className="absolute bottom-4 left-4 right-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          <div className="flex items-center justify-between">
            <Button
              variant="glass"
              disabled={currentTimelineIndex === 0}
              onClick={() => handleTimelineChange(currentTimelineIndex - 1)}
            >
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              上一阶段
            </Button>

            <span className="text-white/60 text-sm">
              {currentTimelineIndex + 1} / {sampleTimeline.length}
            </span>

            <Button
              variant="glass"
              disabled={currentTimelineIndex === sampleTimeline.length - 1}
              onClick={() => handleTimelineChange(currentTimelineIndex + 1)}
            >
              下一阶段
              <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          </div>
        </motion.div>

        {/* 信息面板 */}
        <AnimatePresence>
          {showInfo && (
            <motion.div
              className="absolute top-20 right-4 w-80 bg-black/60 backdrop-blur-lg rounded-2xl p-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <h3 className="text-lg font-semibold text-white mb-4">场景信息</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-neutral-400">当前场景：</span>
                  <span className="text-white ml-2">咸阳宫</span>
                </div>
                <div>
                  <span className="text-neutral-400">历史时期：</span>
                  <span className="text-white ml-2">战国末期</span>
                </div>
                <div>
                  <span className="text-neutral-400">主要人物：</span>
                  <span className="text-white ml-2">秦始皇、李斯</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10">
                <h4 className="text-sm text-neutral-400 mb-2">操作提示</h4>
                <ul className="text-xs text-neutral-500 space-y-1">
                  <li>• 拖拽旋转视角</li>
                  <li>• 滚轮缩放场景</li>
                  <li>• 点击物体查看详情</li>
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
