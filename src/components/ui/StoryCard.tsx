import { motion } from 'framer-motion'
import { Card, CardContent } from './Card'
import type { Story } from '@/types'

interface StoryCardProps {
  story: Story
  progress?: number
  isLocked?: boolean
  onClick?: () => void
}

export function StoryCard({ story, progress = 0, isLocked = false, onClick }: StoryCardProps) {
  return (
    <motion.div
      whileHover={{ scale: isLocked ? 1 : 1.03 }}
      whileTap={{ scale: isLocked ? 1 : 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <Card
        interactive={!isLocked}
        variant="elevated"
        padding="none"
        className={`relative group ${isLocked ? 'grayscale opacity-60' : ''}`}
        onClick={isLocked ? undefined : onClick}
      >
        {/* 封面图 */}
        <div className="relative aspect-[16/9] overflow-hidden">
          <img
            src={story.thumbnail}
            alt={story.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />

          {/* 渐变遮罩 */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

          {/* 时代标签 */}
          <span className="absolute top-3 left-3 px-2 py-1 text-xs font-medium bg-primary-500/90 text-neutral-900 rounded-md">
            {story.era}
          </span>

          {/* 难度标签 */}
          <span
            className={`absolute top-3 right-3 px-2 py-1 text-xs font-medium rounded-md ${
              story.difficulty === 'easy'
                ? 'bg-success/90 text-white'
                : story.difficulty === 'medium'
                  ? 'bg-warning/90 text-white'
                  : 'bg-error/90 text-white'
            }`}
          >
            {story.difficulty === 'easy' ? '简单' : story.difficulty === 'medium' ? '中等' : '困难'}
          </span>

          {/* 锁定图标 */}
          {isLocked && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <svg className="w-12 h-12 text-white/80" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 1a5 5 0 00-5 5v4H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2V12a2 2 0 00-2-2h-2V6a5 5 0 00-5-5zm3 9H9V6a3 3 0 116 0v4z" />
              </svg>
            </div>
          )}

          {/* 底部信息 */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="font-semibold text-lg text-white mb-1">{story.title}</h3>
            <p className="text-sm text-white/80 line-clamp-2">{story.description}</p>
          </div>
        </div>

        {/* 内容区 */}
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm text-neutral-500">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {story.duration}
            </span>
            {progress > 0 && !isLocked && (
              <span className="text-primary-600 font-medium">{progress}% 完成</span>
            )}
          </div>

          {/* 标签 */}
          <div className="flex flex-wrap gap-1 mt-3">
            {story.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 text-xs bg-neutral-100 text-neutral-600 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* 进度条 */}
          {progress > 0 && !isLocked && (
            <div className="mt-3 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
