import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { Story, Scene, Character, Artifact, TimelineEvent } from '@/types'

interface StoryStore {
  // 当前故事
  currentStory: Story | null
  currentScene: Scene | null
  currentSceneIndex: number

  // 加载状态
  isLoading: boolean
  loadingProgress: number

  // 播放状态
  isPlaying: boolean
  isPaused: boolean
  playbackTime: number

  // 交互状态
  selectedObject: Artifact | Character | null
  hoveredObject: string | null

  // 动作
  loadStory: (story: Story) => void
  setCurrentScene: (sceneId: string) => void
  nextScene: () => void
  prevScene: () => void

  setPlaying: (playing: boolean) => void
  setPaused: (paused: boolean) => void
  setPlaybackTime: (time: number) => void

  selectObject: (object: Artifact | Character | null) => void
  setHoveredObject: (id: string | null) => void

  setLoading: (loading: boolean) => void
  setLoadingProgress: (progress: number) => void

  reset: () => void
}

export const useStoryStore = create<StoryStore>()(
  devtools(
    (set, get) => ({
      currentStory: null,
      currentScene: null,
      currentSceneIndex: 0,
      isLoading: false,
      loadingProgress: 0,
      isPlaying: false,
      isPaused: false,
      playbackTime: 0,
      selectedObject: null,
      hoveredObject: null,

      loadStory: (story: Story) => {
        set({
          currentStory: story,
          currentScene: story.scenes[0] || null,
          currentSceneIndex: 0,
          isPlaying: false,
          isPaused: false,
          playbackTime: 0,
          selectedObject: null,
        })
      },

      setCurrentScene: (sceneId: string) => {
        const { currentStory } = get()
        if (!currentStory) return

        const index = currentStory.scenes.findIndex((s) => s.id === sceneId)
        if (index !== -1) {
          set({
            currentScene: currentStory.scenes[index],
            currentSceneIndex: index,
          })
        }
      },

      nextScene: () => {
        const { currentStory, currentSceneIndex } = get()
        if (!currentStory) return

        const nextIndex = currentSceneIndex + 1
        if (nextIndex < currentStory.scenes.length) {
          set({
            currentScene: currentStory.scenes[nextIndex],
            currentSceneIndex: nextIndex,
          })
        }
      },

      prevScene: () => {
        const { currentStory, currentSceneIndex } = get()
        if (!currentStory) return

        const prevIndex = currentSceneIndex - 1
        if (prevIndex >= 0) {
          set({
            currentScene: currentStory.scenes[prevIndex],
            currentSceneIndex: prevIndex,
          })
        }
      },

      setPlaying: (isPlaying: boolean) => set({ isPlaying }),
      setPaused: (isPaused: boolean) => set({ isPaused }),
      setPlaybackTime: (playbackTime: number) => set({ playbackTime }),

      selectObject: (selectedObject) => set({ selectedObject }),
      setHoveredObject: (hoveredObject) => set({ hoveredObject }),

      setLoading: (isLoading: boolean) => set({ isLoading }),
      setLoadingProgress: (loadingProgress: number) => set({ loadingProgress }),

      reset: () =>
        set({
          currentStory: null,
          currentScene: null,
          currentSceneIndex: 0,
          isLoading: false,
          loadingProgress: 0,
          isPlaying: false,
          isPaused: false,
          playbackTime: 0,
          selectedObject: null,
          hoveredObject: null,
        }),
    }),
    { name: 'story-store' }
  )
)
