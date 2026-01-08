import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/stores'
import { LoadingScreen } from '@/components/ui'
import WelcomePage from '@/pages/WelcomePage'
import StorySelectionPage from '@/pages/StorySelectionPage'
import StoryPlayerPage from '@/pages/StoryPlayerPage'
import ComponentLabPage from '@/pages/ComponentLabPage'
import EarthLabPage from '@/pages/EarthLabPage'
import ReactTestPage from '@/pages/ReactTestPage'

function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const transition = useAppStore((s) => s.transition)

  useEffect(() => {
    // 模拟资源加载
    const loadResources = async () => {
      const steps = [
        { progress: 20, delay: 300 },
        { progress: 40, delay: 500 },
        { progress: 60, delay: 400 },
        { progress: 80, delay: 300 },
        { progress: 100, delay: 200 },
      ]

      for (const step of steps) {
        await new Promise((resolve) => setTimeout(resolve, step.delay))
        setLoadingProgress(step.progress)
      }
    }

    loadResources()
  }, [])

  const handleLoadingComplete = () => {
    setIsLoading(false)
    transition('LOAD_COMPLETE')
  }

  return (
    <div className="min-h-screen bg-neutral-900">
      <AnimatePresence mode="wait">
        {isLoading ? (
          <LoadingScreen
            key="loading"
            progress={loadingProgress}
            message={
              loadingProgress < 30
                ? '初始化应用...'
                : loadingProgress < 60
                ? '加载核心资源...'
                : loadingProgress < 90
                ? '准备 3D 场景...'
                : '即将完成...'
            }
            onComplete={handleLoadingComplete}
          />
        ) : (
          <Routes>
            <Route path="/" element={<WelcomePage />} />
            <Route path="/stories" element={<StorySelectionPage />} />
            <Route path="/story/:storyId" element={<StoryPlayerPage />} />
            <Route path="/lab" element={<ComponentLabPage />} />
            <Route path="/earth" element={<EarthLabPage />} />
            <Route path="/react-test" element={<ReactTestPage />} />
          </Routes>
        )}
      </AnimatePresence>
    </div>
  )
}

export default App
