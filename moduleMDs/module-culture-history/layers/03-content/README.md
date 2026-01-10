---
id: layer-3-content
title: Layer 3 内容层
version: 1.0.0
status: published
layer: 3
created: 2024-01-05
updated: 2024-01-05
---

# Layer 3: 内容层 (Content Layer)

> 管理历史故事内容，实现内容与代码分离，支持插件化扩展

---

## 概述

内容层是历史故事的承载体，负责：

1. **故事 DSL** - 历史内容描述语言
2. **故事包管理** - 内容打包与发布
3. **资源管理** - 3D 模型/音频/图片管理
4. **多语言支持** - 国际化内容

---

## 目录结构

```
03-content/
├── README.md                 # 本文件
├── STORY-DSL.md              # 故事 DSL 语法
├── STORY-PACKAGE.md          # 故事包规范
├── ASSET-MANAGEMENT.md       # 资源管理
├── LOCALIZATION.md           # 多语言支持
└── templates/                # 内容模板
    ├── story.template.md     # 故事模板
    ├── scene.template.md     # 场景模板
    └── character.template.md # 人物模板
```

---

## 📝 故事 DSL 语法

### 核心标记符

| 标记           | 用途     | 示例                    |
| -------------- | -------- | ----------------------- |
| `#story`       | 定义故事 | `#story 秦始皇统一六国` |
| `#scene`       | 定义场景 | `#scene 咸阳宫`         |
| `#timeline`    | 时间轴   | `#timeline 统一进程`    |
| `#character`   | 历史人物 | `#character 秦始皇`     |
| `#artifact`    | 文物物品 | `#artifact 传国玉玺`    |
| `#location`    | 地点建筑 | `#location 长城`        |
| `#narration`   | 旁白解说 | `#narration 开场白`     |
| `#interaction` | 交互点   | `#interaction 点击查看` |
| `#transition`  | 转场效果 | `#transition fade-in`   |
| `#quiz`        | 知识测验 | `#quiz 统一时间`        |
| `#media`       | 多媒体   | `#media 背景音乐`       |

### 完整故事示例

```markdown
#story 秦始皇统一六国
@id: qin-unification
@era: 公元前230年-前221年
@duration: 15min
@difficulty: medium
@tags: [古代史, 秦朝, 统一战争]
@thumbnail: /stories/qin/unification/cover.jpg

## 故事简介

公元前230年至前221年，秦王嬴政先后灭韩、赵、魏、楚、燕、齐六国，
完成了中国历史上第一次大一统，建立了中国历史上第一个中央集权制国家——秦朝。

## 学习目标

- 了解秦统一六国的历史背景
- 理解统一的战略步骤
- 认识统一的历史意义

---

#scene 咸阳宫殿
@id: xianyang-palace
@environment: palace
@lighting: dramatic
@music: /audio/palace-ambience.mp3

## 场景描述

恢弘的咸阳宫殿，秦王嬴政正在与群臣商议统一大计。
宫殿内灯火辉煌，青铜器闪烁着金色光芒。

@model: /models/xianyang-palace.glb
@camera:
position: [10, 5, 10]
target: [0, 2, 0]
fov: 50

@objects:

- id: throne
  model: /models/throne.glb
  position: [0, 0, 0]
  interactive: true
  tooltip: "秦王宝座"

- id: bronze-lamp
  model: /models/bronze-lamp.glb
  position: [3, 0, 2]
  animation: flicker

---

#character 秦始皇
@id: qin-shihuang
@role: emperor
@model: /models/characters/qin-shihuang.glb
@position: [0, 0, 2]

## 基本信息

| 属性 | 内容            |
| ---- | --------------- |
| 姓名 | 嬴政            |
| 生卒 | 前259年-前210年 |
| 在位 | 前247年-前210年 |
| 称号 | 始皇帝          |

## 人物介绍

秦始皇嬴政，中国历史上第一个皇帝，统一六国后建立秦朝，
实行中央集权制度，统一文字、度量衡、货币，修筑长城。

## 对话

@dialog:

- trigger: click
  text: "六国纷争，百姓苦不堪言。朕必统一天下，使四海升平！"
  voice: /audio/dialogs/qinshi-1.mp3
  animation: speak

- trigger: hover
  text: "天下大势，分久必合。"

---

#timeline 统一六国进程
@id: unification-timeline
@style: horizontal

## 时间节点

| 年份    | 事件 | 重要性 |
| ------- | ---- | ------ |
| 前230年 | 灭韩 | high   |
| 前228年 | 灭赵 | high   |
| 前225年 | 灭魏 | medium |
| 前223年 | 灭楚 | high   |
| 前222年 | 灭燕 | medium |
| 前221年 | 灭齐 | high   |

@events:

- year: -230
  title: 灭韩
  description: 秦军攻破韩国都城新郑，韩王安投降
  icon: sword
  color: "#e63946"
  scene_id: korea-conquest

- year: -228
  title: 灭赵
  description: 秦军攻克邯郸，赵王迁被俘
  icon: castle
  color: "#f4a261"
  scene_id: zhao-conquest

- year: -221
  title: 灭齐，天下一统
  description: 秦军进入临淄，齐王建投降，六国统一完成
  icon: crown
  color: "#ffd700"
  scene_id: qi-conquest
  highlight: true

---

#artifact 传国玉玺
@id: imperial-seal
@model: /models/artifacts/imperial-seal.glb
@position: [2, 1.2, 0]
@scale: 0.5

## 文物信息

| 属性 | 内容                 |
| ---- | -------------------- |
| 名称 | 传国玉玺             |
| 材质 | 和氏璧               |
| 篆文 | "受命于天，既寿永昌" |
| 意义 | 皇权正统象征         |

## 详细描述

传国玉玺是秦始皇统一中国后命丞相李斯用和氏璧镌刻的玉玺，
上刻"受命于天，既寿永昌"八个篆字，成为历代皇权的象征。

@interaction:

- type: click
  action: show_detail
  camera_move:
  position: [0.5, 1.5, 0.5]
  target: [2, 1.2, 0]
  duration: 1.5

- type: hover
  action: highlight
  effect: glow
  color: "#ffd700"

---

#narration 开场白
@id: opening-narration
@trigger: scene_enter
@voice: /audio/narration/opening.mp3
@subtitle: true

## 旁白内容

> 公元前三世纪，华夏大地战火纷飞，诸侯争霸。
>
> 秦国，这个曾被山东六国轻视的西部诸侯，
> 在商鞅变法后逐渐强大。
>
> 年轻的秦王嬴政，即将开启一段改变中国历史的伟大征程...

@animation:

- type: text_reveal
  duration: 3
  style: typewriter

---

#quiz 统一六国测验
@id: unification-quiz
@trigger: story_end
@passing_score: 60
@time_limit: 300

## 选择题

@question: q1
@type: multiple-choice
@points: 20

秦始皇统一六国的顺序是？

- [ ] 韩、赵、魏、楚、燕、齐 ✓
- [ ] 赵、韩、魏、燕、楚、齐
- [ ] 韩、魏、赵、楚、燕、齐
- [ ] 魏、韩、赵、楚、燕、齐

@explanation: 秦国采取"远交近攻"策略，先灭最弱的韩国，然后依次灭赵、魏、楚、燕、齐。

---

@question: q2
@type: multiple-choice
@points: 20

传国玉玺上刻的是什么字？

- [ ] "受命于天，既寿永昌" ✓
- [ ] "天命所归，江山永固"
- [ ] "皇帝神圣，四海归一"
- [ ] "秦皇万岁，天下太平"

---

@question: q3
@type: drag-and-match
@points: 30

将以下国家与其灭亡年份匹配：

| 国家 | 年份    |
| ---- | ------- |
| 韩国 | 前230年 |
| 赵国 | 前228年 |
| 楚国 | 前223年 |
| 齐国 | 前221年 |

---

#transition
@from: xianyang-palace
@to: korea-conquest
@type: fade-through-black
@duration: 1.5
@text: "公元前230年，秦军出征..."
```

---

## 📦 故事包规范

### 故事包目录结构

```
stories/
└── ancient/                      # 时代分类
    └── qin/                      # 朝代分类
        └── unification/          # 故事名称
            │
            ├── story.md          # 主故事文件
            ├── meta.json         # 元数据
            │
            ├── scenes/           # 场景模块
            │   ├── xianyang-palace.scene.md
            │   ├── korea-conquest.scene.md
            │   └── qi-conquest.scene.md
            │
            ├── characters/       # 人物模块
            │   ├── qin-shihuang.char.md
            │   └── li-si.char.md
            │
            ├── artifacts/        # 文物模块
            │   ├── imperial-seal.artifact.md
            │   └── bronze-sword.artifact.md
            │
            ├── assets/           # 资源目录
            │   ├── models/       # 3D 模型
            │   │   ├── palace.glb
            │   │   └── characters/
            │   ├── textures/     # 纹理贴图
            │   ├── audio/        # 音频文件
            │   └── images/       # 图片文件
            │
            ├── timeline.md       # 时间轴
            ├── quiz.md           # 测验题目
            │
            └── locales/          # 多语言
                ├── zh-CN.json
                ├── en-US.json
                └── ja-JP.json
```

### 元数据文件 (meta.json)

```json
{
  "id": "qin-unification",
  "version": "1.0.0",
  "title": {
    "zh-CN": "秦始皇统一六国",
    "en-US": "Qin Shi Huang's Unification"
  },
  "description": {
    "zh-CN": "了解秦始皇如何统一六国，建立中国第一个统一王朝",
    "en-US": "Learn how Qin Shi Huang unified six states"
  },
  "era": {
    "start": -230,
    "end": -221
  },
  "duration": "15min",
  "difficulty": "medium",
  "tags": ["ancient", "qin", "unification", "war"],
  "author": {
    "name": "历史研究团队",
    "contact": "history@example.com"
  },
  "license": "CC BY-NC-SA 4.0",
  "prerequisites": [],
  "relatedStories": ["qin-great-wall", "terracotta-army"],
  "assets": {
    "totalSize": "45MB",
    "models": 12,
    "textures": 24,
    "audio": 8
  },
  "requirements": {
    "minVersion": "1.0.0",
    "plugins": ["quiz-engine", "timeline-viewer"]
  },
  "publishedAt": "2024-01-15",
  "updatedAt": "2024-03-20"
}
```

---

## 🎮 资源管理

### 资源优化规范

| 资源类型   | 格式要求      | 大小限制   | 优化方式      |
| ---------- | ------------- | ---------- | ------------- |
| 3D 模型    | .glb (Draco)  | < 5MB/个   | Draco 压缩    |
| 纹理       | .webp / .ktx2 | < 1MB/张   | 压缩 + Mipmap |
| 音频       | .mp3 / .ogg   | < 2MB/个   | 128kbps       |
| 图片       | .webp         | < 500KB/张 | 压缩 + 响应式 |
| 故事包总计 | -             | < 50MB     | 按需加载      |

### 资源加载器

```typescript
// src/utils/resourceLoader.ts
import { useGLTF, useTexture } from '@react-three/drei'

interface StoryResources {
  models: Record<string, string>
  textures: Record<string, string>
  audio: Record<string, string>
}

export class StoryResourceLoader {
  private loaded: Map<string, any> = new Map()
  private loading: Map<string, Promise<any>> = new Map()

  async loadStory(storyId: string): Promise<StoryResources> {
    const meta = await fetch(`/stories/${storyId}/meta.json`).then((r) => r.json())

    // 并行预加载关键资源
    const preloadPromises = [
      this.preloadModels(meta.preload?.models || []),
      this.preloadTextures(meta.preload?.textures || []),
      this.preloadAudio(meta.preload?.audio || []),
    ]

    await Promise.all(preloadPromises)

    return {
      models: this.loaded.get('models') || {},
      textures: this.loaded.get('textures') || {},
      audio: this.loaded.get('audio') || {},
    }
  }

  private async preloadModels(urls: string[]) {
    for (const url of urls) {
      useGLTF.preload(url)
    }
  }

  private async preloadTextures(urls: string[]) {
    for (const url of urls) {
      useTexture.preload(url)
    }
  }

  private async preloadAudio(urls: string[]) {
    const audioPromises = urls.map((url) => {
      return new Promise((resolve, reject) => {
        const audio = new Audio()
        audio.src = url
        audio.oncanplaythrough = () => resolve(audio)
        audio.onerror = reject
      })
    })
    await Promise.all(audioPromises)
  }

  // 渐进式加载
  async loadLazy(urls: string[], onProgress?: (progress: number) => void) {
    let loaded = 0
    const total = urls.length

    for (const url of urls) {
      await this.loadResource(url)
      loaded++
      onProgress?.((loaded / total) * 100)
    }
  }

  private async loadResource(url: string) {
    if (this.loaded.has(url)) return this.loaded.get(url)

    if (!this.loading.has(url)) {
      this.loading.set(
        url,
        fetch(url).then((r) => r.blob()),
      )
    }

    const resource = await this.loading.get(url)
    this.loaded.set(url, resource)
    this.loading.delete(url)

    return resource
  }
}
```

---

## 🌍 多语言支持

### 语言文件结构

```json
// locales/zh-CN.json
{
  "story": {
    "title": "秦始皇统一六国",
    "description": "了解秦始皇如何统一六国"
  },
  "scenes": {
    "xianyang-palace": {
      "name": "咸阳宫殿",
      "description": "恢弘的咸阳宫殿，秦王正在与群臣商议统一大计"
    }
  },
  "characters": {
    "qin-shihuang": {
      "name": "秦始皇",
      "title": "始皇帝",
      "dialogs": {
        "dialog-1": "六国纷争，百姓苦不堪言。朕必统一天下！"
      }
    }
  },
  "artifacts": {
    "imperial-seal": {
      "name": "传国玉玺",
      "description": "秦始皇命李斯用和氏璧镌刻的玉玺"
    }
  },
  "quiz": {
    "q1": {
      "question": "秦始皇统一六国的顺序是？",
      "options": ["韩、赵、魏、楚、燕、齐", "赵、韩、魏、燕、楚、齐"]
    }
  },
  "ui": {
    "next": "下一步",
    "previous": "上一步",
    "start": "开始学习",
    "complete": "完成"
  }
}
```

### 多语言 Hook

```typescript
// src/hooks/useStoryLocale.ts
import { useEffect, useState } from 'react'
import { useLocaleStore } from '@/stores/localeStore'

export function useStoryLocale(storyId: string) {
  const { currentLocale } = useLocaleStore()
  const [translations, setTranslations] = useState<Record<string, any>>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadLocale() {
      setIsLoading(true)
      try {
        const response = await fetch(`/stories/${storyId}/locales/${currentLocale}.json`)
        const data = await response.json()
        setTranslations(data)
      } catch (error) {
        // 回退到默认语言
        const fallback = await fetch(`/stories/${storyId}/locales/zh-CN.json`)
        setTranslations(await fallback.json())
      }
      setIsLoading(false)
    }

    loadLocale()
  }, [storyId, currentLocale])

  const t = (key: string, params?: Record<string, string>) => {
    const keys = key.split('.')
    let value: any = translations

    for (const k of keys) {
      value = value?.[k]
    }

    if (typeof value === 'string' && params) {
      return value.replace(/\{(\w+)\}/g, (_, key) => params[key] || '')
    }

    return value || key
  }

  return { t, isLoading, translations }
}
```

---

## ✅ 内容层检查清单

### DSL 语法

- [ ] 所有标记符已定义
- [ ] 语法文档完整
- [ ] 解析器实现
- [ ] 验证工具

### 故事包

- [ ] 目录结构规范
- [ ] 元数据规范
- [ ] 版本管理
- [ ] 发布流程

### 资源管理

- [ ] 优化规范制定
- [ ] 加载器实现
- [ ] 进度追踪
- [ ] 缓存策略

### 多语言

- [ ] 语言文件结构
- [ ] 翻译工作流
- [ ] 运行时切换
- [ ] 回退机制

---

## 📚 相关文档

- [STORY-DSL.md](./STORY-DSL.md) - DSL 语法详解
- [STORY-PACKAGE.md](./STORY-PACKAGE.md) - 故事包规范
- [ASSET-MANAGEMENT.md](./ASSET-MANAGEMENT.md) - 资源管理
- [LOCALIZATION.md](./LOCALIZATION.md) - 多语言支持

---

**内容层是知识的载体，实现内容与技术分离，让创作者专注于历史故事本身！**
