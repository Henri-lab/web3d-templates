import { motion } from 'framer-motion'
import type { TimelineEvent } from '@/types'

interface TimelineProps {
  events: TimelineEvent[]
  currentEventId?: string
  onEventClick?: (event: TimelineEvent) => void
  orientation?: 'horizontal' | 'vertical'
}

export function Timeline({
  events,
  currentEventId,
  onEventClick,
  orientation = 'horizontal',
}: TimelineProps) {
  const isVertical = orientation === 'vertical'

  return (
    <div
      className={`relative ${
        isVertical ? 'flex flex-col' : 'flex items-center overflow-x-auto pb-4'
      }`}
    >
      {/* 连接线 */}
      <div
        className={`absolute ${
          isVertical
            ? 'left-4 top-0 bottom-0 w-0.5 bg-neutral-200'
            : 'top-4 left-0 right-0 h-0.5 bg-neutral-200'
        }`}
      />

      {events.map((event, index) => {
        const isActive = event.id === currentEventId
        const isPast = events.findIndex((e) => e.id === currentEventId) > index

        return (
          <motion.div
            key={event.id}
            className={`relative ${
              isVertical ? 'flex items-start pl-10 pb-8' : 'flex flex-col items-center px-4 min-w-[120px]'
            }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            {/* 节点 */}
            <button
              onClick={() => onEventClick?.(event)}
              className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all ${
                isActive
                  ? 'bg-primary-500 border-primary-500 scale-125'
                  : isPast
                  ? 'bg-primary-200 border-primary-300'
                  : 'bg-neutral-0 border-neutral-300 hover:border-primary-400'
              } ${isVertical ? 'absolute left-0' : ''}`}
            >
              {isActive && (
                <motion.div
                  className="absolute inset-0 rounded-full bg-primary-500"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{ opacity: 0.3 }}
                />
              )}
              <span
                className={`text-xs font-bold ${
                  isActive ? 'text-white' : isPast ? 'text-primary-700' : 'text-neutral-500'
                }`}
              >
                {index + 1}
              </span>
            </button>

            {/* 内容 */}
            <div className={isVertical ? '' : 'mt-4 text-center'}>
              <div
                className={`text-xs font-medium ${
                  isActive ? 'text-primary-600' : 'text-neutral-400'
                }`}
              >
                {event.year}
              </div>
              <h4
                className={`text-sm font-semibold mt-1 ${
                  isActive ? 'text-neutral-900' : 'text-neutral-600'
                }`}
              >
                {event.title}
              </h4>
              {isVertical && event.description && (
                <p className="text-xs text-neutral-500 mt-1 max-w-xs">
                  {event.description}
                </p>
              )}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

// 紧凑版时间轴
interface CompactTimelineProps {
  events: TimelineEvent[]
  currentIndex: number
  onIndexChange?: (index: number) => void
}

export function CompactTimeline({
  events,
  currentIndex,
  onIndexChange,
}: CompactTimelineProps) {
  return (
    <div className="flex items-center gap-2 p-2 bg-black/30 backdrop-blur-sm rounded-full">
      {events.map((event, index) => (
        <button
          key={event.id}
          onClick={() => onIndexChange?.(index)}
          className={`w-2 h-2 rounded-full transition-all ${
            index === currentIndex
              ? 'bg-primary-500 w-6'
              : index < currentIndex
              ? 'bg-primary-300'
              : 'bg-white/30 hover:bg-white/50'
          }`}
          title={event.title}
        />
      ))}
    </div>
  )
}
