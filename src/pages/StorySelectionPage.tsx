import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button, StoryCard } from '@/components/ui'
import { useAppStore, useProgressStore } from '@/stores'
import type { Story } from '@/types'

// 示例故事数据
const sampleStories: Story[] = [
  {
    id: 'qin-unification',
    title: '秦始皇统一六国',
    era: '公元前221年',
    dynasty: '秦朝',
    duration: '15分钟',
    difficulty: 'medium',
    thumbnail: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800',
    description: '探索秦始皇如何结束战国纷争，建立中国历史上第一个统一的中央集权国家。',
    tags: ['古代史', '秦朝', '统一'],
    scenes: [],
    timeline: [],
    characters: [],
    artifacts: [],
  },
  {
    id: 'tang-prosperity',
    title: '开元盛世',
    era: '公元713-741年',
    dynasty: '唐朝',
    duration: '12分钟',
    difficulty: 'easy',
    thumbnail: 'https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=800',
    description: '走进唐玄宗统治的黄金时代，感受大唐帝国的繁荣与辉煌。',
    tags: ['古代史', '唐朝', '繁荣'],
    scenes: [],
    timeline: [],
    characters: [],
    artifacts: [],
  },
  {
    id: 'silk-road',
    title: '丝绸之路',
    era: '公元前2世纪',
    dynasty: '汉朝',
    duration: '18分钟',
    difficulty: 'medium',
    thumbnail: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800',
    description: '追随古代商队的脚步，探索连接东西方的伟大贸易之路。',
    tags: ['古代史', '汉朝', '贸易'],
    scenes: [],
    timeline: [],
    characters: [],
    artifacts: [],
  },
  {
    id: 'great-wall',
    title: '万里长城',
    era: '公元前7世纪-明朝',
    duration: '20分钟',
    difficulty: 'hard',
    thumbnail: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800',
    description: '探索世界七大奇迹之一的建造历史，了解长城的军事与文化意义。',
    tags: ['古代史', '建筑', '军事'],
    scenes: [],
    timeline: [],
    characters: [],
    artifacts: [],
  },
  {
    id: 'zheng-he',
    title: '郑和下西洋',
    era: '公元1405-1433年',
    dynasty: '明朝',
    duration: '16分钟',
    difficulty: 'medium',
    thumbnail: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800',
    description: '跟随郑和的宝船船队，探索史上最伟大的航海壮举。',
    tags: ['古代史', '明朝', '航海'],
    scenes: [],
    timeline: [],
    characters: [],
    artifacts: [],
  },
  {
    id: 'four-inventions',
    title: '四大发明',
    era: '古代',
    duration: '14分钟',
    difficulty: 'easy',
    thumbnail: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800',
    description: '了解改变世界的中国古代四大发明：造纸术、印刷术、火药、指南针。',
    tags: ['古代史', '科技', '发明'],
    scenes: [],
    timeline: [],
    characters: [],
    artifacts: [],
  },
]

const dynastyFilters = ['全部', '秦朝', '汉朝', '唐朝', '宋朝', '明朝', '清朝']

export default function StorySelectionPage() {
  const navigate = useNavigate()
  const [selectedDynasty, setSelectedDynasty] = useState('全部')
  const [searchQuery, setSearchQuery] = useState('')
  const getStoryProgress = useProgressStore((s) => s.getStoryProgress)

  const filteredStories = useMemo(() => {
    return sampleStories.filter((story) => {
      const matchesDynasty = selectedDynasty === '全部' || story.dynasty === selectedDynasty
      const matchesSearch =
        story.title.includes(searchQuery) ||
        story.description.includes(searchQuery) ||
        story.tags.some((tag) => tag.includes(searchQuery))
      return matchesDynasty && matchesSearch
    })
  }, [selectedDynasty, searchQuery])

  const handleStoryClick = (story: Story) => {
    navigate(`/story/${story.id}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-900 to-neutral-800">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-50 bg-neutral-900/80 backdrop-blur-lg border-b border-neutral-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-white hover:text-primary-400 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              返回首页
            </button>

            <h1 className="text-xl font-semibold text-white">选择故事</h1>

            <div className="w-24" /> {/* 占位 */}
          </div>
        </div>
      </header>

      {/* 筛选器 */}
      <section className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          {/* 搜索框 */}
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="搜索故事..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 pl-10 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-primary-500"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/* 朝代筛选 */}
          <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto">
            {dynastyFilters.map((dynasty) => (
              <button
                key={dynasty}
                onClick={() => setSelectedDynasty(dynasty)}
                className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-all ${
                  selectedDynasty === dynasty
                    ? 'bg-primary-500 text-neutral-900 font-medium'
                    : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                }`}
              >
                {dynasty}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 故事列表 */}
      <section className="max-w-7xl mx-auto px-4 pb-12">
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.1 },
            },
          }}
        >
          {filteredStories.map((story) => {
            const progress = getStoryProgress(story.id)
            return (
              <motion.div
                key={story.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <StoryCard
                  story={story}
                  progress={progress?.percentage}
                  onClick={() => handleStoryClick(story)}
                />
              </motion.div>
            )
          })}
        </motion.div>

        {filteredStories.length === 0 && (
          <div className="text-center py-16">
            <p className="text-neutral-500">没有找到匹配的故事</p>
          </div>
        )}
      </section>
    </div>
  )
}
