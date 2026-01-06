import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars, Float } from '@react-three/drei'
import { Button } from '@/components/ui'
import { useAppStore } from '@/stores'

function WelcomeScene() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1} />

      <Stars radius={100} depth={50} count={3000} factor={4} fade speed={1} />

      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <mesh>
          <torusKnotGeometry args={[1, 0.3, 100, 16]} />
          <meshStandardMaterial color="#e6b000" metalness={0.8} roughness={0.2} />
        </mesh>
      </Float>

      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
    </>
  )
}

export default function WelcomePage() {
  const navigate = useNavigate()
  const transition = useAppStore((s) => s.transition)

  const handleStart = () => {
    transition('START_CLICK')
    navigate('/stories')
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* 3D 背景 */}
      <div className="absolute inset-0">
        <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
          <WelcomeScene />
        </Canvas>
      </div>

      {/* 内容层 */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Logo */}
          <motion.div
            className="mb-8"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-glow">
              <span className="text-4xl">📜</span>
            </div>
          </motion.div>

          {/* 标题 */}
          <motion.h1
            className="text-5xl md:text-6xl font-bold text-white mb-4 font-primary"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            历史故事学习平台
          </motion.h1>

          <motion.p
            className="text-xl text-neutral-300 mb-12 max-w-lg mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            沉浸式3D体验，穿越时空探索中华五千年历史
          </motion.p>

          {/* 按钮组 */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Button size="xl" onClick={handleStart}>
              开始探索
            </Button>
            <Button size="xl" variant="outline">
              了解更多
            </Button>
          </motion.div>

          {/* 特性介绍 */}
          <motion.div
            className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            {[
              { icon: '🏛️', title: '沉浸式场景', desc: '3D还原历史场景' },
              { icon: '📖', title: '互动学习', desc: '点击探索了解更多' },
              { icon: '🏆', title: '成就系统', desc: '收集成就解锁内容' },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                className="text-center p-4 rounded-xl bg-white/5 backdrop-blur-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + i * 0.1 }}
              >
                <span className="text-3xl mb-2 block">{feature.icon}</span>
                <h3 className="text-white font-semibold mb-1">{feature.title}</h3>
                <p className="text-neutral-400 text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* 底部提示 */}
        <motion.div
          className="absolute bottom-8 left-0 right-0 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <p className="text-neutral-500 text-sm">
            滚动鼠标或点击开始探索 ↓
          </p>
        </motion.div>
      </div>
    </div>
  )
}
