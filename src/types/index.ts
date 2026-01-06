// 故事相关类型
export interface Story {
  id: string
  title: string
  era: string
  dynasty?: string
  duration: string
  difficulty: 'easy' | 'medium' | 'hard'
  thumbnail: string
  description: string
  tags: string[]
  scenes: Scene[]
  timeline: TimelineEvent[]
  characters: Character[]
  artifacts: Artifact[]
  quiz?: Quiz
  preloadAssets?: string[]
  lazyLoadAssets?: string[]
}

export interface Scene {
  id: string
  title: string
  description?: string
  environment: 'palace' | 'street' | 'battlefield' | 'mountain' | 'river' | 'indoor' | 'custom'
  lighting: 'bright' | 'dim' | 'dramatic' | 'warm' | 'cold'
  modelUrl?: string
  position?: [number, number, number]
  cameraPosition?: [number, number, number]
  cameraTarget?: [number, number, number]
  narration?: Narration
  interactions?: Interaction[]
  music?: string
  ambientSound?: string
}

export interface TimelineEvent {
  id: string
  year: string
  title: string
  description: string
  type: 'major' | 'minor' | 'milestone'
  sceneId?: string
}

export interface Character {
  id: string
  name: string
  title?: string
  dynasty?: string
  lifespan?: string
  description: string
  avatar?: string
  modelUrl?: string
  position?: [number, number, number]
  significance: string
}

export interface Artifact {
  id: string
  name: string
  era?: string
  material?: string
  dimensions?: string
  location?: string
  description: string
  significance: string
  modelUrl?: string
  imageUrl?: string
  position?: [number, number, number]
  scale?: number
  rotation?: [number, number, number]
  interactable?: boolean
}

export interface Narration {
  text: string
  audioUrl?: string
  duration?: number
  voice?: 'male' | 'female'
}

export interface Interaction {
  id: string
  type: 'click' | 'hover' | 'drag' | 'proximity'
  targetId: string
  action: InteractionAction
  feedback?: string
}

export interface InteractionAction {
  type: 'showInfo' | 'playAnimation' | 'navigate' | 'playAudio' | 'highlight' | 'zoom'
  payload?: Record<string, unknown>
}

// 测验相关类型
export interface Quiz {
  id: string
  title: string
  questions: QuizQuestion[]
  passingScore: number
  timeLimit?: number
}

export interface QuizQuestion {
  id: string
  type: 'multiple-choice' | 'true-false' | 'fill-blank' | 'matching' | 'ordering'
  question: string
  options?: string[]
  correctAnswer: string | string[] | number
  explanation?: string
  points: number
  imageUrl?: string
}

export interface QuizResult {
  quizId: string
  score: number
  totalPoints: number
  percentage: number
  passed: boolean
  answers: QuizAnswer[]
  completedAt: string
  duration: number
}

export interface QuizAnswer {
  questionId: string
  answer: string | string[] | number
  correct: boolean
  points: number
}

// 成就系统类型
export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  category: 'learning' | 'exploration' | 'quiz' | 'collection' | 'special'
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  condition: AchievementCondition
  reward?: AchievementReward
  unlockedAt?: string
}

export interface AchievementCondition {
  type: 'story_complete' | 'quiz_perfect' | 'artifacts_found' | 'time_spent' | 'streak'
  value: number
  targetId?: string
}

export interface AchievementReward {
  type: 'badge' | 'theme' | 'avatar' | 'title'
  value: string
}

// 用户进度类型
export interface UserProgress {
  userId?: string
  storiesCompleted: string[]
  storiesInProgress: Map<string, StoryProgress>
  quizResults: QuizResult[]
  achievements: string[]
  totalTimeSpent: number
  lastActivity: string
}

export interface StoryProgress {
  storyId: string
  currentSceneId: string
  scenesVisited: string[]
  artifactsFound: string[]
  percentage: number
  startedAt: string
  lastPlayedAt: string
}

// 应用状态类型
export type AppState =
  | 'loading'
  | 'welcome'
  | 'story-selection'
  | 'story-preview'
  | 'story-loading'
  | 'story-playing'
  | 'scene-transition'
  | 'object-detail'
  | 'paused'
  | 'quiz'
  | 'quiz-result'
  | 'story-complete'
  | 'settings'
  | 'achievements'
  | 'error'

export type AppEvent =
  | 'LOAD_COMPLETE'
  | 'START_CLICK'
  | 'SETTINGS_CLICK'
  | 'ACHIEVEMENT_CLICK'
  | 'CLOSE'
  | 'SELECT_STORY'
  | 'BACK'
  | 'CONFIRM'
  | 'CANCEL'
  | 'LOADED'
  | 'LOAD_ERROR'
  | 'RETRY'
  | 'NEXT_SCENE'
  | 'PREV_SCENE'
  | 'CLICK_OBJECT'
  | 'PAUSE'
  | 'RESUME'
  | 'EXIT'
  | 'STORY_END'
  | 'SUBMIT'
  | 'CONTINUE'
  | 'NEW_STORY'
  | 'HOME'
  | 'SHARE'

// 设置类型
export interface AppSettings {
  theme: 'light' | 'dark' | 'ancient-china' | 'auto'
  language: 'zh-CN' | 'en-US'
  quality: 'low' | 'medium' | 'high' | 'auto'
  volume: {
    master: number
    music: number
    sfx: number
    voice: number
  }
  accessibility: {
    reducedMotion: boolean
    highContrast: boolean
    fontSize: 'small' | 'medium' | 'large'
  }
  controls: {
    invertY: boolean
    sensitivity: number
  }
}

// 3D 场景类型
export interface SceneConfig {
  camera: CameraConfig
  lighting: LightingConfig
  environment: EnvironmentConfig
  postProcessing?: PostProcessingConfig
}

export interface CameraConfig {
  position: [number, number, number]
  target: [number, number, number]
  fov: number
  near: number
  far: number
  controls: 'orbit' | 'fly' | 'first-person' | 'fixed'
}

export interface LightingConfig {
  ambient: {
    color: string
    intensity: number
  }
  directional?: {
    color: string
    intensity: number
    position: [number, number, number]
    castShadow: boolean
  }
  point?: Array<{
    color: string
    intensity: number
    position: [number, number, number]
    distance: number
  }>
}

export interface EnvironmentConfig {
  background: string | 'skybox'
  skybox?: string
  fog?: {
    color: string
    near: number
    far: number
  }
  ground?: {
    color: string
    size: number
  }
}

export interface PostProcessingConfig {
  bloom?: {
    intensity: number
    threshold: number
  }
  vignette?: {
    offset: number
    darkness: number
  }
  colorCorrection?: {
    saturation: number
    contrast: number
    brightness: number
  }
}
