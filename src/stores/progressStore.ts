import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { UserProgress, StoryProgress, QuizResult } from '@/types'

interface ProgressStore {
  // 用户进度
  progress: UserProgress

  // 故事进度操作
  startStory: (storyId: string) => void
  updateStoryProgress: (storyId: string, update: Partial<StoryProgress>) => void
  completeStory: (storyId: string) => void

  // 场景操作
  visitScene: (storyId: string, sceneId: string) => void
  findArtifact: (storyId: string, artifactId: string) => void

  // 测验操作
  submitQuizResult: (result: QuizResult) => void
  getQuizResult: (quizId: string) => QuizResult | undefined

  // 成就操作
  unlockAchievement: (achievementId: string) => void
  hasAchievement: (achievementId: string) => boolean

  // 时间跟踪
  addTimeSpent: (seconds: number) => void

  // 计算属性
  getStoryProgress: (storyId: string) => StoryProgress | undefined
  getCompletionPercentage: () => number
  getTotalArtifactsFound: () => number

  // 重置
  reset: () => void
}

const initialProgress: UserProgress = {
  storiesCompleted: [],
  storiesInProgress: new Map(),
  quizResults: [],
  achievements: [],
  totalTimeSpent: 0,
  lastActivity: new Date().toISOString(),
}

export const useProgressStore = create<ProgressStore>()(
  devtools(
    persist(
      (set, get) => ({
        progress: initialProgress,

        startStory: (storyId: string) => {
          const { progress } = get()
          if (progress.storiesInProgress.has(storyId)) return

          const newProgress: StoryProgress = {
            storyId,
            currentSceneId: '',
            scenesVisited: [],
            artifactsFound: [],
            percentage: 0,
            startedAt: new Date().toISOString(),
            lastPlayedAt: new Date().toISOString(),
          }

          const updated = new Map(progress.storiesInProgress)
          updated.set(storyId, newProgress)

          set({
            progress: {
              ...progress,
              storiesInProgress: updated,
              lastActivity: new Date().toISOString(),
            },
          })
        },

        updateStoryProgress: (storyId: string, update: Partial<StoryProgress>) => {
          const { progress } = get()
          const current = progress.storiesInProgress.get(storyId)
          if (!current) return

          const updated = new Map(progress.storiesInProgress)
          updated.set(storyId, {
            ...current,
            ...update,
            lastPlayedAt: new Date().toISOString(),
          })

          set({
            progress: {
              ...progress,
              storiesInProgress: updated,
              lastActivity: new Date().toISOString(),
            },
          })
        },

        completeStory: (storyId: string) => {
          const { progress } = get()
          const updated = new Map(progress.storiesInProgress)
          updated.delete(storyId)

          set({
            progress: {
              ...progress,
              storiesCompleted: [...progress.storiesCompleted, storyId],
              storiesInProgress: updated,
              lastActivity: new Date().toISOString(),
            },
          })
        },

        visitScene: (storyId: string, sceneId: string) => {
          const { progress, updateStoryProgress } = get()
          const current = progress.storiesInProgress.get(storyId)
          if (!current) return

          if (!current.scenesVisited.includes(sceneId)) {
            updateStoryProgress(storyId, {
              currentSceneId: sceneId,
              scenesVisited: [...current.scenesVisited, sceneId],
            })
          } else {
            updateStoryProgress(storyId, { currentSceneId: sceneId })
          }
        },

        findArtifact: (storyId: string, artifactId: string) => {
          const { progress, updateStoryProgress } = get()
          const current = progress.storiesInProgress.get(storyId)
          if (!current || current.artifactsFound.includes(artifactId)) return

          updateStoryProgress(storyId, {
            artifactsFound: [...current.artifactsFound, artifactId],
          })
        },

        submitQuizResult: (result: QuizResult) => {
          const { progress } = get()
          set({
            progress: {
              ...progress,
              quizResults: [...progress.quizResults, result],
              lastActivity: new Date().toISOString(),
            },
          })
        },

        getQuizResult: (quizId: string) => {
          const { progress } = get()
          return progress.quizResults.find((r) => r.quizId === quizId)
        },

        unlockAchievement: (achievementId: string) => {
          const { progress } = get()
          if (progress.achievements.includes(achievementId)) return

          set({
            progress: {
              ...progress,
              achievements: [...progress.achievements, achievementId],
              lastActivity: new Date().toISOString(),
            },
          })
        },

        hasAchievement: (achievementId: string) => {
          const { progress } = get()
          return progress.achievements.includes(achievementId)
        },

        addTimeSpent: (seconds: number) => {
          const { progress } = get()
          set({
            progress: {
              ...progress,
              totalTimeSpent: progress.totalTimeSpent + seconds,
              lastActivity: new Date().toISOString(),
            },
          })
        },

        getStoryProgress: (storyId: string) => {
          const { progress } = get()
          return progress.storiesInProgress.get(storyId)
        },

        getCompletionPercentage: () => {
          const { progress } = get()
          const total = progress.storiesCompleted.length + progress.storiesInProgress.size
          if (total === 0) return 0
          return Math.round((progress.storiesCompleted.length / total) * 100)
        },

        getTotalArtifactsFound: () => {
          const { progress } = get()
          let total = 0
          progress.storiesInProgress.forEach((p) => {
            total += p.artifactsFound.length
          })
          return total
        },

        reset: () => set({ progress: initialProgress }),
      }),
      {
        name: 'progress-storage',
        partialize: (state) => ({
          progress: {
            ...state.progress,
            storiesInProgress: Array.from(state.progress.storiesInProgress.entries()),
          },
        }),
        merge: (persisted: any, current) => ({
          ...current,
          progress: {
            ...persisted.progress,
            storiesInProgress: new Map(persisted.progress?.storiesInProgress || []),
          },
        }),
      },
    ),
    { name: 'progress-store' },
  ),
)
