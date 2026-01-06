# 📁 内容组织结构规范

定义如何工程化组织历史故事 Markdown 文件。

---

## 🏗️ 目录结构

```
history-content/
│
├── stories/                          # 故事内容目录
│   ├── ancient/                      # 古代史
│   │   ├── qin/                      # 秦朝
│   │   │   ├── index.md             # 秦朝故事索引
│   │   │   ├── unification/         # 统一六国主题
│   │   │   │   ├── story.md         # 主故事文件
│   │   │   │   ├── scenes/          # 场景定义
│   │   │   │   │   ├── palace.scene.md
│   │   │   │   │   ├── battlefield.scene.md
│   │   │   │   │   └── city.scene.md
│   │   │   │   ├── characters/      # 人物定义
│   │   │   │   │   ├── qin-emperor.char.md
│   │   │   │   │   ├── li-si.char.md
│   │   │   │   │   └── meng-tian.char.md
│   │   │   │   ├── artifacts/       # 文物定义
│   │   │   │   │   ├── terracotta-warriors.art.md
│   │   │   │   │   ├── bamboo-slip.art.md
│   │   │   │   │   └── bronze-sword.art.md
│   │   │   │   ├── timeline.md      # 时间轴
│   │   │   │   └── quiz.md          # 测验题
│   │   │   │
│   │   │   └── great-wall/          # 长城主题
│   │   │       └── ...
│   │   │
│   │   ├── han/                      # 汉朝
│   │   │   └── ...
│   │   │
│   │   └── tang/                     # 唐朝
│   │       └── ...
│   │
│   ├── modern/                       # 近现代史
│   │   └── ...
│   │
│   └── world/                        # 世界史
│       └── ...
│
├── assets/                           # 资源目录
│   ├── models/                       # 3D 模型
│   │   ├── characters/
│   │   ├── buildings/
│   │   └── artifacts/
│   ├── textures/                     # 纹理贴图
│   ├── audio/                        # 音频
│   │   ├── narration/               # 旁白
│   │   ├── music/                   # 音乐
│   │   └── effects/                 # 音效
│   └── images/                       # 图片
│
├── templates/                        # 模板文件
│   ├── story.template.md
│   ├── scene.template.md
│   ├── character.template.md
│   └── artifact.template.md
│
├── themes/                           # 主题配置
│   ├── qin-dynasty.theme.md
│   ├── han-dynasty.theme.md
│   └── modern.theme.md
│
├── config/                           # 配置文件
│   ├── manifest.json                # 全局清单
│   ├── categories.json              # 分类定义
│   └── tags.json                    # 标签系统
│
└── index.md                          # 内容总索引
```

---

## 📝 文件命名约定

### 文件类型后缀

```
.md           通用 Markdown 文件
.story.md     故事主文件
.scene.md     场景定义文件
.char.md      人物定义文件
.art.md       文物定义文件
.theme.md     主题配置文件
.quiz.md      测验文件
.timeline.md  时间轴文件
```

### 命名规则

```
kebab-case    使用短横线分隔（推荐）
示例: qin-unification.story.md
     terracotta-warriors.art.md
     xianyang-palace.scene.md

禁止:
- 空格: Qin Unification.md ❌
- 中文: 秦朝统一.md ❌
- 下划线: qin_unification.md ❌
```

---

## 📦 故事包结构

每个历史主题是一个独立的**故事包**：

```
unification/                    # 故事包目录
├── story.md                    # 主入口（必需）
├── meta.json                   # 元数据（必需）
├── scenes/                     # 场景（可选）
├── characters/                 # 人物（可选）
├── artifacts/                  # 文物（可选）
├── timeline.md                 # 时间轴（推荐）
├── quiz.md                     # 测验（推荐）
└── README.md                   # 说明文档
```

### meta.json 示例

```json
{
  "id": "qin-unification",
  "version": "1.0.0",
  "title": "秦始皇统一六国",
  "author": "历史教研组",
  "created": "2024-01-01",
  "updated": "2024-01-15",
  "era": "ancient",
  "period": "qin",
  "duration": "15min",
  "difficulty": "medium",
  "tags": ["古代史", "秦朝", "统一战争", "中央集权"],
  "prerequisites": [],
  "recommended": ["great-wall-construction", "qin-reforms"],
  "assets": {
    "models": ["palace.glb", "emperor.glb", "warriors.glb"],
    "textures": ["palace-env.hdr"],
    "audio": ["intro.mp3", "conclusion.mp3"]
  },
  "estimated_size": "45MB",
  "supported_devices": ["desktop", "mobile", "vr"],
  "languages": ["zh-CN", "en-US"]
}
```

---

## 🔗 内容引用规范

### 内部引用

```markdown
#story 秦始皇统一六国
@id: qin-unification

## 场景引用
@scenes:
  - ./scenes/palace.scene.md
  - ./scenes/battlefield.scene.md
  - ./scenes/city.scene.md

## 人物引用
@characters:
  - ./characters/qin-emperor.char.md
  - ./characters/li-si.char.md

## 文物引用
@artifacts:
  - ./artifacts/terracotta-warriors.art.md
  - ./artifacts/bronze-sword.art.md

## 时间轴引用
@timeline: ./timeline.md

## 测验引用
@quiz: ./quiz.md
```

### 跨故事引用

```markdown
## 相关故事
@related:
  - ../../han/silk-road/story.md
  - ../../tang/prosperity/story.md

## 前置知识
@prerequisites:
  - ../reforms/story.md (商鞅变法)
```

### 资源引用

```markdown
## 3D 模型
@model: /assets/models/characters/qin-emperor.glb

## 音频
@voice: /assets/audio/narration/qin-speech-01.mp3
@music: /assets/audio/music/ancient-palace.mp3

## 图片
@image: /assets/images/qin/empire-map.jpg
```

---

## 📚 索引系统

### 全局索引 (index.md)

```markdown
# 历史故事内容索引

## 古代史

### 秦朝 (公元前221年 - 公元前206年)
- [秦始皇统一六国](./stories/ancient/qin/unification/story.md) ⭐⭐⭐⭐⭐
- [长城修建](./stories/ancient/qin/great-wall/story.md) ⭐⭐⭐⭐
- [焚书坑儒](./stories/ancient/qin/book-burning/story.md) ⭐⭐⭐

### 汉朝 (公元前206年 - 公元220年)
- [丝绸之路](./stories/ancient/han/silk-road/story.md)
- [张骞出使西域](./stories/ancient/han/zhang-qian/story.md)

## 近现代史
...

## 世界史
...
```

### 分类索引 (categories.json)

```json
{
  "categories": [
    {
      "id": "era",
      "name": "历史时期",
      "items": [
        { "id": "ancient", "name": "古代史", "range": "远古-1840" },
        { "id": "modern", "name": "近现代史", "range": "1840-现在" },
        { "id": "world", "name": "世界史", "range": "全球" }
      ]
    },
    {
      "id": "theme",
      "name": "主题分类",
      "items": [
        { "id": "war", "name": "战争与征服" },
        { "id": "culture", "name": "文化与艺术" },
        { "id": "technology", "name": "科技与发明" },
        { "id": "politics", "name": "政治与制度" },
        { "id": "economy", "name": "经济与贸易" }
      ]
    },
    {
      "id": "difficulty",
      "name": "难度等级",
      "items": [
        { "id": "easy", "name": "初级", "icon": "⭐" },
        { "id": "medium", "name": "中级", "icon": "⭐⭐⭐" },
        { "id": "hard", "name": "高级", "icon": "⭐⭐⭐⭐⭐" }
      ]
    }
  ]
}
```

---

## 🎯 内容发现机制

### 标签系统 (tags.json)

```json
{
  "tags": {
    "dynasty": ["秦朝", "汉朝", "唐朝", "宋朝", "明朝", "清朝"],
    "event-type": ["战争", "改革", "发明", "外交", "文化"],
    "character-type": ["皇帝", "将军", "学者", "发明家", "外交官"],
    "region": ["中原", "江南", "西域", "岭南", "东北"],
    "concept": ["中央集权", "科举制度", "丝绸之路", "四大发明"]
  }
}
```

### 推荐算法配置

```markdown
#story 秦始皇统一六国
@id: qin-unification

## 推荐关联
@recommendations:
  # 同时期故事
  - type: same-period
    items: [qin-reforms, qin-legalism]
    weight: 0.8

  # 相似主题
  - type: similar-theme
    items: [han-unification, sui-unification]
    weight: 0.6

  # 后续发展
  - type: continuation
    items: [qin-fall, chu-han-contention]
    weight: 0.9

  # 对比学习
  - type: comparison
    items: [roman-empire-expansion]
    weight: 0.4
```

---

## 🔄 版本管理

### 语义化版本

```
版本格式: major.minor.patch

1.0.0  首次发布
1.1.0  添加新场景
1.1.1  修复旁白错误
2.0.0  重大改版（不兼容旧版本）
```

### 变更日志

```markdown
# CHANGELOG.md

## [1.2.0] - 2024-01-15

### Added
- 新增李斯人物模型
- 添加秦简文物交互

### Changed
- 优化宫殿场景灯光
- 更新时间轴动画效果

### Fixed
- 修复旁白音频同步问题
- 修正历史年份错误

## [1.1.0] - 2024-01-10
...
```

---

## 🌐 多语言支持

### 目录结构

```
unification/
├── story.zh-CN.md          # 中文版本
├── story.en-US.md          # 英文版本
├── story.ja-JP.md          # 日文版本
└── meta.json               # 标注支持的语言
```

### 语言标记

```markdown
#story 秦始皇统一六国
@lang: zh-CN
@translations:
  - en-US: ./story.en-US.md
  - ja-JP: ./story.ja-JP.md
```

---

## 📊 资源清单 (manifest.json)

全局资源管理：

```json
{
  "version": "1.0.0",
  "stories": [
    {
      "id": "qin-unification",
      "path": "./stories/ancient/qin/unification/story.md",
      "status": "published",
      "featured": true,
      "downloads": 1523,
      "rating": 4.8
    }
  ],
  "assets": {
    "models": {
      "total_size": "2.3GB",
      "count": 156,
      "formats": ["glb", "gltf"]
    },
    "audio": {
      "total_size": "450MB",
      "count": 234,
      "formats": ["mp3", "ogg"]
    }
  },
  "themes": [
    {
      "id": "qin-dynasty",
      "name": "秦朝风格",
      "path": "./themes/qin-dynasty.theme.md"
    }
  ]
}
```

---

## ✅ 内容质量检查清单

### 必需内容
- [ ] story.md 主文件存在
- [ ] meta.json 元数据完整
- [ ] 至少 1 个场景定义
- [ ] 时间轴或叙事结构
- [ ] 学习目标明确

### 资源检查
- [ ] 所有引用的模型文件存在
- [ ] 音频文件格式正确
- [ ] 图片分辨率适当
- [ ] 资源总大小 < 100MB

### 内容质量
- [ ] 历史事实准确
- [ ] 语言表述清晰
- [ ] 交互设计合理
- [ ] 学习目标可达成

### 技术规范
- [ ] 文件命名符合规范
- [ ] 引用路径正确
- [ ] DSL 语法无错误
- [ ] 版本号符合规范

---

这套组织结构让内容管理规范化、可扩展、易维护！
