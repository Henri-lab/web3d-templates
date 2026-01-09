---
id: history-dsl-system
title: 历史场景 DSL 系统
version: 1.0.0
status: published
layer: 3
created: 2024-01-05
updated: 2024-01-05
---

# 历史场景 DSL 系统

> 基于 Markdown 的 3D 历史学习内容创作系统

---

## 系统概述

### 核心理念

**内容创作者友好的 3D 历史学习系统**

```
内容创作者 (历史学家/教师)
      ↓
   编写 Markdown DSL
      ↓
   系统自动解析
      ↓
   生成 3D 交互场景
      ↓
   学生沉浸式学习
```

### 关键创新

1. **零编程创作** - 用 Markdown 即可创建 3D 场景
2. **声明式配置** - 描述"是什么"而非"怎么做"
3. **内容可复用** - 场景、人物、文物模块化
4. **自动加载优化** - 系统智能管理资源加载

---

## 📚 系统组成

### 1. DSL 语法规范 (syntax/DSL-SYNTAX.md)

定义了 11 种核心标记符号：

| 标记           | 用途      | 示例             |
| -------------- | --------- | ---------------- |
| `#story`       | 故事模块  | 整个历史事件     |
| `#scene`       | 场景定义  | 咸阳宫、战场     |
| `#timeline`    | 时间轴    | 统一六国进程     |
| `#character`   | 历史人物  | 秦始皇、李斯     |
| `#location`    | 地点/建筑 | 长城、宫殿       |
| `#artifact`    | 文物/物品 | 兵马俑、秦简     |
| `#narration`   | 旁白/解说 | 开场白、总结     |
| `#interaction` | 交互点    | 点击、拖拽       |
| `#transition`  | 转场效果  | 场景切换         |
| `#media`       | 多媒体    | 图片、视频、音频 |
| `#quiz`        | 知识测验  | 选择题、问答     |

### 2. 内容组织规范 (syntax/CONTENT-ORGANIZATION.md)

工程化的内容管理结构：

```
stories/ancient/qin/unification/
├── story.md              # 主故事文件
├── meta.json             # 元数据
├── scenes/               # 场景模块
├── characters/           # 人物模块
├── artifacts/            # 文物模块
├── timeline.md           # 时间轴
└── quiz.md               # 测验
```

### 3. 解析器架构 (parser/PARSER-ARCHITECTURE.md)

技术实现层：

```
Markdown DSL
    ↓
Tokenizer (词法分析)
    ↓
Parser (语法分析)
    ↓
AST (抽象语法树)
    ↓
Config Builder
    ↓
Scene Config JSON
    ↓
React Components
    ↓
Three.js 3D Scene
```

### 4. 完整示例 (examples/01-qin-unification.story.md)

秦始皇统一六国的完整实现：

- 6 个历史事件时间轴
- 2 个主要历史人物
- 3 个重要文物
- 1 个建筑场景
- 3 个知识测验
- 丰富的交互和动画

---

## 🚀 快速开始

### 创建你的第一个历史故事

#### Step 1: 创建故事文件

```bash
mkdir -p my-stories/tang-dynasty/prosperity
cd my-stories/tang-dynasty/prosperity
touch story.md
```

#### Step 2: 编写基本结构

```markdown
#story 开元盛世
@id: tang-prosperity
@era: 公元713-741年
@duration: 12min
@difficulty: easy
@tags: [古代史, 唐朝, 经济繁荣]

描述唐玄宗开元年间的盛世景象...

## 学习目标

- 了解开元盛世的历史背景
- 理解唐朝繁荣的原因

---

#scene 长安街市
@id: changan-street
@environment: street
@lighting: bright

繁华的长安街市，商贩云集...

@model: /models/tang-street.glb
@music: /audio/tang-music.mp3

---

#character 唐玄宗
@id: emperor-xuanzong
@model: /models/xuanzong.glb
@position: [0, 0, 0]

## 基本信息

...
```

#### Step 3: 解析并渲染

```typescript
import { loadStory } from '@/history-dsl'

const scene = await loadStory('./story.md')

// 渲染到页面
<SceneRenderer config={scene} />
```

---

## 💡 最佳实践

### 1. 故事设计原则

**DO ✅**

- 明确学习目标
- 时间轴清晰
- 交互有意义
- 测验检验理解

**DON'T ❌**

- 不要堆砌信息
- 不要过度动画
- 不要忽略历史准确性

### 2. 内容组织建议

```
# 推荐：模块化组织
story.md          ← 主入口（引用其他模块）
scenes/           ← 场景独立文件
characters/       ← 人物独立文件

# 不推荐：全部写在一个文件
story.md          ← 5000行，难以维护
```

### 3. 资源优化

```markdown
# ✅ 优化后的模型

@model: /models/emperor-draco.glb # 2MB

# ❌ 未优化的模型

@model: /models/emperor-raw.glb # 50MB
```

**资源优化清单**：

- [ ] 3D 模型使用 Draco 压缩
- [ ] 音频使用 MP3 格式，128kbps
- [ ] 图片使用 WebP 格式
- [ ] 单个故事包 < 50MB

### 4. 渐进式加载

```markdown
#story 统一六国
@id: qin-unification

## 预加载资源（优先）

@preload:

- /models/palace.glb
- /audio/intro.mp3

## 延迟加载资源（后台）

@lazy-load:

- /models/great-wall.glb
- /models/warriors.glb
```

---

## 🎨 扩展性设计

### 1. 添加新的历史时期

```bash
# 创建新时期目录
stories/ancient/song/
├── index.md
├── economy/
│   └── commercial-revolution/
├── technology/
│   └── four-inventions/
└── culture/
    └── painting-calligraphy/
```

### 2. 添加新的主题类型

```bash
# 跨朝代主题
stories/themes/
├── economy/
│   ├── silk-road/
│   └── grand-canal/
├── technology/
│   ├── gunpowder/
│   └── compass/
└── culture/
    ├── confucianism/
    └── taoism/
```

### 3. 创建内容模板

```bash
# 复制模板
cp templates/story.template.md \
   my-stories/new-story/story.md

# 填入内容
vim my-stories/new-story/story.md
```

---

## 🔧 开发工具集成

### VS Code 扩展（未来计划）

```json
{
  "history-dsl.validate": true,
  "history-dsl.snippets": true,
  "history-dsl.preview": true
}
```

功能：

- 语法高亮
- 实时验证
- 智能补全
- 3D 预览

### CLI 工具（未来计划）

```bash
# 创建新故事
history-dsl create song-dynasty

# 验证语法
history-dsl validate ./story.md

# 构建发布
history-dsl build --optimize

# 本地预览
history-dsl serve
```

---

## 📊 工作流程

### 内容创作流程

```
1. 选题 → 确定历史事件
    ↓
2. 调研 → 收集历史资料
    ↓
3. 设计 → 规划场景和交互
    ↓
4. 编写 → 创作 Markdown DSL
    ↓
5. 准备 → 收集/制作 3D 资源
    ↓
6. 测试 → 验证语法和效果
    ↓
7. 发布 → 部署到平台
```

### 协作流程

```
历史专家 → 撰写内容 → story.md
   ↓
3D 美术 → 制作模型 → .glb 文件
   ↓
音频师 → 录制旁白 → .mp3 文件
   ↓
开发者 → 集成发布 → Web 平台
```

---

## 🎯 应用场景

### 1. 在线历史课程

```
学校历史课堂
   → 老师选择历史故事
   → 学生3D沉浸式学习
   → 完成测验
   → 获得成就
```

### 2. 博物馆数字展览

```
博物馆展厅
   → 扫描二维码
   → 加载3D历史场景
   → 虚拟文物互动
   → 了解背景知识
```

### 3. 历史文化普及

```
公众平台
   → 发布历史故事
   → 用户自主学习
   → 分享成就
   → 讨论交流
```

---

## 📈 未来扩展

### 短期计划（3个月）

- [ ] 添加 10 个历史故事示例
- [ ] 完善解析器实现
- [ ] 创建在线编辑器
- [ ] 移动端适配

### 中期计划（6个月）

- [ ] AI 语音合成集成
- [ ] VR/AR 模式支持
- [ ] 多人协作学习
- [ ] 自动生成测验

### 长期计划（1年）

- [ ] 世界历史扩展
- [ ] 多语言支持
- [ ] UGC 平台（用户生成内容）
- [ ] AI 辅助创作

---

## ✅ 质量标准

### 内容质量

- [ ] 历史事实准确
- [ ] 学习目标明确
- [ ] 叙事逻辑清晰
- [ ] 语言表述规范

### 技术质量

- [ ] DSL 语法正确
- [ ] 资源路径有效
- [ ] 加载性能优秀
- [ ] 交互流畅自然

### 教育质量

- [ ] 知识点覆盖全面
- [ ] 难度循序渐进
- [ ] 测验设计合理
- [ ] 反馈及时准确

---

## 🎓 学习资源

### 参考文档

1. `syntax/DSL-SYNTAX.md` - 语法完整说明
2. `syntax/CONTENT-ORGANIZATION.md` - 组织规范
3. `parser/PARSER-ARCHITECTURE.md` - 技术架构
4. `examples/01-qin-unification.story.md` - 完整示例

### 示例代码

```typescript
// 解析 Markdown
const ast = parseMarkdown(content)

// 生成配置
const config = buildConfig(ast)

// 渲染场景
<SceneRenderer config={config} />
```

---

## 💬 社区与反馈

### 获取帮助

- 阅读文档
- 查看示例
- 提交 Issue
- 参与讨论

### 贡献内容

1. Fork 项目
2. 创建历史故事
3. 提交 Pull Request
4. 等待审核

---

## 📝 总结

这套系统实现了：

✅ **降低创作门槛** - Markdown 即可创建 3D 场景
✅ **工程化管理** - 规范的内容组织结构
✅ **技术自动化** - 解析渲染全自动
✅ **易于扩展** - 模块化设计，灵活组合
✅ **性能优化** - 内置加载优化策略

通过这套系统，内容创作者可以专注于历史内容本身，
而技术细节由系统自动处理，真正实现了**内容与技术的分离**！

---

**开始创作你的第一个 3D 历史故事吧！**
