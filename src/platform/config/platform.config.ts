/**
 * 中台平台配置文件 - 稳健版本
 *
 * 设计原则：
 * 1. 配置优先 - 所有模块通过配置注册
 * 2. 类型安全 - 完整的TypeScript类型定义
 * 3. 简单可靠 - 移除复杂的远程加载
 * 4. 声明式 - 描述"是什么"而非"怎么做"
 */

import type { PlatformConfig, ModuleConfig } from './types'

/**
 * 平台全局配置
 */
export const platformConfig: PlatformConfig = {
  // 平台基本信息
  name: 'History3D Learning Platform',
  version: '2.1.0-stable',
  mode: 'development',

  // 主应用配置
  shell: {
    port: 5173,
    basePath: '/',
    title: '历史3D学习平台',
    shared: {},
  },

  // 模块注册表
  modules: [],

  // 路由配置
  routing: {
    mode: 'browser',
    basename: '/',
    fallback: '/404',
  },

  // 状态配置（简化版，使用Zustand）
  stateMachine: {
    initialState: 'ready',
    persistState: false,
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
    preload: [],
    cacheStrategy: 'memory',
  },

  // 开发工具
  devTools: {
    enabled: true,
    showModuleInfo: true,
    showStateTransitions: true,
  },
}

/**
 * 模块配置注册 - 稳健版本
 *
 * 所有模块都是本地模块，简单可靠
 */
export const moduleConfigs: ModuleConfig[] = [
  // 首页模块
  {
    id: 'welcome',
    name: '首页',
    description: '平台首页，模块导航入口',
    version: '1.0.0',
    type: 'local',

    routes: [
      {
        path: '/',
        component: 'WelcomePage',
        meta: { title: '首页' },
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
      requires: [],
    },

    lifecycle: {},
    config: {},
    state: { namespace: 'welcome', persist: false },
  },

  // 故事模块
  {
    id: 'story',
    name: '历史故事',
    description: '沉浸式3D历史故事学习',
    version: '1.0.0',
    type: 'local',

    routes: [
      {
        path: '/stories',
        component: 'StorySelectionPage',
        meta: { title: '选择故事' },
      },
      {
        path: '/story/:storyId',
        component: 'StoryPlayerPage',
        meta: { title: '故事播放' },
      },
    ],

    menu: {
      title: '历史故事',
      icon: 'book',
      order: 1,
      visible: true,
    },

    capabilities: {
      provides: ['story.play', 'story.pause'],
      requires: ['platform.eventBus'],
    },

    lifecycle: {},
    config: { maxStories: 100 },
    state: { namespace: 'story', persist: true },
  },

  // 实验室模块
  {
    id: 'lab',
    name: '组件实验室',
    description: 'Three.js组件展示与实验',
    version: '1.0.0',
    type: 'local',

    routes: [
      {
        path: '/lab',
        component: 'ComponentLabPage',
        meta: { title: '组件实验室' },
      },
    ],

    menu: {
      title: '实验室',
      icon: 'flask',
      order: 2,
      visible: true,
    },

    capabilities: {
      provides: ['lab.showcase'],
      requires: ['platform.eventBus'],
    },

    lifecycle: {},
    config: { enableLeva: true },
    state: { namespace: 'lab', persist: false },
  },

  // 地球模块
  {
    id: 'earth',
    name: '地球可视化',
    description: '全球数据可视化展示',
    version: '1.0.0',
    type: 'local',

    routes: [
      {
        path: '/earth',
        component: 'EarthLabPage',
        meta: { title: '地球可视化' },
      },
    ],

    menu: {
      title: '地球',
      icon: 'globe',
      order: 3,
      visible: true,
    },

    capabilities: {
      provides: ['earth.visualize'],
      requires: ['platform.eventBus'],
    },

    lifecycle: {},
    config: { useThreeJS: true },
    state: { namespace: 'earth', persist: false },
  },

  // 平台管理模块
  {
    id: 'platform',
    name: '平台管理',
    description: '平台配置与状态管理',
    version: '1.0.0',
    type: 'local',

    routes: [
      {
        path: '/platform',
        component: 'PlatformHomePage',
        meta: { title: '平台管理' },
      },
      {
        path: '/platform-examples',
        component: 'ExamplesPage',
        meta: { title: 'API演示' },
      },
    ],

    menu: {
      title: '平台管理',
      icon: 'settings',
      order: 99,
      visible: true,
    },

    capabilities: {
      provides: ['platform.config', 'platform.status'],
      requires: [],
    },

    lifecycle: {},
    config: {},
    state: { namespace: 'platform', persist: false },
  },
]

// 将模块配置注册到平台配置
platformConfig.modules = moduleConfigs

/**
 * 获取模块配置
 */
export function getModuleConfig(moduleId: string): ModuleConfig | undefined {
  return moduleConfigs.find((m) => m.id === moduleId)
}

/**
 * 获取所有路由
 */
export function getAllRoutes() {
  return moduleConfigs.flatMap((m) => m.routes)
}

/**
 * 获取导航菜单
 */
export function getNavigationMenu() {
  return moduleConfigs
    .filter((m) => m.menu.visible)
    .sort((a, b) => a.menu.order - b.menu.order)
    .map((m) => ({
      id: m.id,
      title: m.menu.title,
      icon: m.menu.icon,
      path: m.routes[0]?.path || '/',
      description: m.description,
    }))
}

export default platformConfig
