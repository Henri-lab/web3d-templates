import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { gsap } from '@/animations'

interface LoadingScreenProps {
  progress?: number
  message?: string
  onComplete?: () => void
}

export function LoadingScreen({
  progress = 0,
  message = '正在加载...',
  onComplete,
}: LoadingScreenProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const dotsRef = useRef<HTMLDivElement[]>([])

  useEffect(() => {
    // 点的动画
    dotsRef.current.forEach((dot, i) => {
      if (dot) {
        gsap.to(dot, {
          scale: 1.5,
          duration: 0.5,
          repeat: -1,
          yoyo: true,
          delay: i * 0.15,
          ease: 'power2.inOut',
        })
      }
    })

    return () => {
      gsap.killTweensOf(dotsRef.current)
    }
  }, [])

  useEffect(() => {
    if (progress >= 100 && onComplete) {
      // 加载完成动画
      gsap.to(containerRef.current, {
        opacity: 0,
        duration: 0.5,
        delay: 0.3,
        onComplete,
      })
    }
  }, [progress, onComplete])

  return (
    <motion.div
      ref={containerRef}
      className="loading-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl" />
      </div>

      {/* Logo 和标题 */}
      <motion.div
        className="relative z-10 text-center mb-12"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h1 className="text-4xl font-bold text-white mb-2 font-primary">
          历史故事学习平台
        </h1>
        <p className="text-neutral-400">沉浸式3D历史学习体验</p>
      </motion.div>

      {/* 加载动画 */}
      <div className="relative z-10 flex items-center justify-center gap-3 mb-8">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            ref={(el) => {
              if (el) dotsRef.current[i] = el
            }}
            className="w-3 h-3 rounded-full bg-primary-500"
          />
        ))}
      </div>

      {/* 进度条 */}
      <div className="relative z-10 w-64">
        <div className="h-1 bg-neutral-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <div className="flex justify-between mt-2 text-sm text-neutral-400">
          <span>{message}</span>
          <span>{Math.round(progress)}%</span>
        </div>
      </div>

      {/* 提示文字 */}
      <motion.p
        className="absolute bottom-8 left-0 right-0 text-center text-sm text-neutral-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        首次加载可能需要一些时间，请耐心等待
      </motion.p>
    </motion.div>
  )
}

// 简单的加载指示器
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  color?: string
}

export function LoadingSpinner({ size = 'md', color = 'currentColor' }: LoadingSpinnerProps) {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }

  return (
    <svg
      className={`animate-spin ${sizeMap[size]}`}
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke={color}
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill={color}
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  )
}
