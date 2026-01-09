/**
 * 中台平台配置文件
 *
 * 设计原则：
 * 1. 配置优先 - 所有模块通过配置注册
 * 2. 类型安全 - 完整的TypeScript类型定义
 * 3. 可扩展 - 支持动态添加模块
 * 4. 声明式 - 描述"是什么"而非"怎么做"
 */

import type { PlatformConfig, ModuleConfig, ModuleLifecycle } from './types'

/**
 * 平台全局配置
 */
export const platformConfig: PlatformConfig = {
  // 平台基本信息
  name: 'History3D Learning Platform',
  version: '2.0.0',
  mode: 'development', // 'development' | 'production'

  // 主应用配置
  shell: {
    port: 5173,
    basePath: '/',
    title: '历史3D学习平台',

    // 共享依赖配置
    shared: {
      react: { singleton: true, requiredVersion: '^18.2.0' },
      'react-dom': { singleton: true, requiredVersion: '^18.2.0' },
      'react-router-dom': { singleton: true, requiredVersion: '^6.21.0' },
      three: { singleton: true, requiredVersion: '^0.160.0' },
      '@react-three/fiber': { singleton: true, requiredVersion: '^8.15.0' },
      '@react-three/drei': { singleton: true, requiredVersion: '^9.92.0' },
      zustand: { singleton: true, requiredVersion: '^4.4.0' },
      gsap: { singleton: true, requiredVersion: '^3.12.0' },
    },
  },

  // 模块注册表
  modules: [],

  // 路由配置
  routing: {
    mode: 'browser', // 'browser' | 'hash'
    basename: '/',
    fallback: '/404',
  },

  // 状态机配置
  stateMachine: {
    initialState: 'loading',
    persistState: true,
    devTools: true,
  },

  // 事件总线配置
  eventBus: {
    maxListeners: 100,
    enableLogging: true,
  },

  // 性能配置
  performance: {
    lazyLoad: true,
    preload: [], // 暂时不预加载远程模块（子模块还未创建）
    cacheStrategy: 'memory', // 'memory' | 'localStorage'
  },

  // 开发工具
  devTools: {
    enabled: true,
    showModuleInfo: true,
    showStateTransitions: true,
  },
}

/**
 * 模块配置注册
 *
 * 每个模块都是独立的微前端应用，可以：
 * - 独立开发和部署
 * - 通过事件总线通信
 * - 共享平台能力
 */
export const moduleConfigs: ModuleConfig[] = [
  // 故事模块
  {
    id: 'story',
    name: '历史故事',
    version: '1.0.0',

    // 模块类型
    type: 'remote', // 'local' | 'remote' | 'iframe'

    // 远程入口（Module Federation）
    entry: 'http://localhost:5174/remoteEntry.js',

    // 路由配置
    routes: [
      {
        path: '/stories',
        component: 'StorySelectionPage',
        meta: {
          title: '选择故事',
          requiresAuth: false,
        },
      },
      {
        path: '/story/:storyId',
        component: 'StoryPlayerPage',
        meta: {
          title: '故事播放',
          requiresAuth: false,
        },
      },
    ],

    // 导航菜单
    menu: {
      title: '历史故事',
      icon: 'book',
      order: 1,
      visible: true,
    },

    // 模块能力声明
    capabilities: {
      // 提供的能力
      provides: [
        'story.play',
        'story.pause',
        'story.getProgress',
      ],
      // 依赖的能力
      requires: [
        'platform.eventBus',
        'platform.stateManager',
      ],
    },

    // 生命周期钩子
    lifecycle: {
      beforeLoad: async () => {
        console.log('[Story Module] Before load')
      },
      onLoad: async () => {
        console.log('[Story Module] Loaded')
      },
      onMount: async () => {
        console.log('[Story Module] Mounted')
      },
      onUnmount: async () => {
        console.log('[Story Module] Unmounted')
      },
      onError: async (error) => {
        console.error('[Story Module] Error:', error)
      },
    },

    // 模块配置
    config: {
      maxStories: 100,
      autoSave: true,
      enableAnalytics: true,
    },

    // 状态配置
    state: {
      namespace: 'story',
      persist: true,
    },
  },

  // 实验室模块
  {
    id: 'lab',
    name: '组件实验室',
    version: '1.0.0',
    type: 'remote',
    entry: 'http://localhost:5175/remoteEntry.js',

    routes: [
      {
        path: '/lab',
        component: 'ComponentLabPage',
        meta: {
          title: '组件实验室',
          requiresAuth: false,
        },
      },
    ],

    menu: {
      title: '实验室',
      icon: 'flask',
      order: 2,
      visible: true,
    },

    capabilities: {
      provides: ['lab.showcase', 'lab.export'],
      requires: ['platform.eventBus'],
    },

    lifecycle: {},

    config: {
      enableLeva: true,
      showCode: true,
    },

    state: {
      namespace: 'lab',
      persist: false,
    },
  },

  // 地球模块
  {
    id: 'earth',
    name: '地球可视化',
    version: '1.0.0',
    type: 'remote',
    entry: 'http://localhost:5176/remoteEntry.js',

    routes: [
      {
        path: '/earth',
        component: 'EarthLabPage',
        meta: {
          title: '地球实验室',
          requiresAuth: false,
        },
      },
    ],

    menu: {
      title: '地球',
      icon: 'globe',
      order: 3,
      visible: true,
    },

    capabilities: {
      provides: ['earth.visualize', 'earth.getData'],
      requires: ['platform.eventBus'],
    },

    lifecycle: {},

    config: {
      enableCesium: false,
      useThreeJS: true,
    },

    state: {
      namespace: 'earth',
      persist: false,
    },
  },

  // 欢迎页模块（本地模块示例）
  {
    id: 'welcome',
    name: '欢迎页',
    version: '1.0.0',
    type: 'local', // 本地模块，不需要远程加载

    routes: [
      {
        path: '/',
        component: 'WelcomePage',
        meta: {
          title: '欢迎',
          requiresAuth: false,
        },
      },
    ],

    menu: {
      title: '首页',
      icon: 'home',
      order: 0,
      visible: true,
    },

    capabilities: {
      provides: [],
      requires: ['platform.eventBus'],
    },

    lifecycle: {},

    config: {},

    state: {
      namespace: 'welcome',
      persist: false,
    },
  },
]

// 将模块配置注册到平台配置
platformConfig.modules = moduleConfigs

/**
 * 获取模块配置
 */
export function getModuleConfig(moduleId: string): ModuleConfig | undefined {
  return moduleConfigs.find(m => m.id === moduleId)
}

/**
 * 获取所有远程模块
 */
export function getRemoteModules(): ModuleConfig[] {
  return moduleConfigs.filter(m => m.type === 'remote')
}

/**
 * 获取所有本地模块
 */
export function getLocalModules(): ModuleConfig[] {
  return moduleConfigs.filter(m => m.type === 'local')
}

/**
 * 获取模块路由
 */
export function getModuleRoutes(moduleId: string) {
  const module = getModuleConfig(moduleId)
  return module?.routes || []
}

/**
 * 获取所有路由
 */
export function getAllRoutes() {
  return moduleConfigs.flatMap(m => m.routes)
}

/**
 * 获取导航菜单
 */
export function getNavigationMenu() {
  return moduleConfigs
    .filter(m => m.menu.visible)
    .sort((a, b) => a.menu.order - b.menu.order)
    .map(m => ({
      id: m.id,
      title: m.menu.title,
      icon: m.menu.icon,
      path: m.routes[0]?.path || '/',
    }))
}

export default platformConfig
