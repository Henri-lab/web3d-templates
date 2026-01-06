# 🔧 解析器和渲染引擎架构

将 Markdown DSL 转换为 Three.js 3D 场景的技术架构。

---

## 📊 系统架构图

```
┌─────────────────────────────────────────────────────────┐
│                    Content Layer                         │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐        │
│  │ story.md   │  │ scene.md   │  │ char.md    │        │
│  │ (DSL)      │  │ (DSL)      │  │ (DSL)      │        │
│  └──────┬─────┘  └──────┬─────┘  └──────┬─────┘        │
└─────────┼────────────────┼────────────────┼─────────────┘
          │                │                │
          ▼                ▼                ▼
┌─────────────────────────────────────────────────────────┐
│                    Parser Layer                          │
│  ┌────────────────────────────────────────────┐         │
│  │         Markdown DSL Parser                │         │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐ │         │
│  │  │Tokenizer │→ │ Analyzer │→ │Generator │ │         │
│  │  └──────────┘  └──────────┘  └──────────┘ │         │
│  └────────────────────┬───────────────────────┘         │
└───────────────────────┼─────────────────────────────────┘
                        │
                        ▼ (AST - Abstract Syntax Tree)
┌─────────────────────────────────────────────────────────┐
│                   Transform Layer                        │
│  ┌────────────────────────────────────────────┐         │
│  │         Scene Configuration Builder        │         │
│  │                                             │         │
│  │  AST → Scene Config JSON                   │         │
│  └────────────────────┬───────────────────────┘         │
└───────────────────────┼─────────────────────────────────┘
                        │
                        ▼ (Scene Config Object)
┌─────────────────────────────────────────────────────────┐
│                    Engine Layer                          │
│  ┌─────────────────────────────────────────┐            │
│  │         3D Rendering Engine             │            │
│  │                                          │            │
│  │  ┌───────────┐  ┌──────────────┐       │            │
│  │  │ Three.js  │  │ React Three  │       │            │
│  │  │  Core     │  │   Fiber      │       │            │
│  │  └─────┬─────┘  └──────┬───────┘       │            │
│  │        │                │               │            │
│  │        ▼                ▼               │            │
│  │  ┌──────────────────────────┐          │            │
│  │  │   Component Renderer     │          │            │
│  │  │  - Scene                 │          │            │
│  │  │  - Camera                │          │            │
│  │  │  - Lights                │          │            │
│  │  │  - Objects               │          │            │
│  │  └──────────────────────────┘          │            │
│  └─────────────────────────────────────────┘            │
└─────────────────────────────────────────────────────────┘
```

---

## 🔨 解析器设计

### 1. Tokenizer (词法分析器)

将 Markdown 文本分解为 tokens。

```typescript
// src/parser/Tokenizer.ts

interface Token {
  type: TokenType
  value: string
  line: number
  column: number
}

enum TokenType {
  TAG = 'TAG',              // #story, #scene, etc.
  ATTRIBUTE = 'ATTRIBUTE',  // @id, @position, etc.
  TEXT = 'TEXT',
  HEADING = 'HEADING',
  LIST = 'LIST',
  CODE_BLOCK = 'CODE_BLOCK',
  SEPARATOR = 'SEPARATOR',  // ---
}

class Tokenizer {
  tokenize(markdown: string): Token[] {
    const tokens: Token[] = []
    const lines = markdown.split('\n')

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      // 识别 DSL 标记
      if (line.startsWith('#story')) {
        tokens.push({
          type: TokenType.TAG,
          value: 'story',
          line: i,
          column: 0
        })
        continue
      }

      // 识别属性
      if (line.startsWith('@')) {
        const match = line.match(/@(\w+):\s*(.+)/)
        if (match) {
          tokens.push({
            type: TokenType.ATTRIBUTE,
            value: JSON.stringify({ key: match[1], value: match[2] }),
            line: i,
            column: 0
          })
        }
        continue
      }

      // ... 其他token识别
    }

    return tokens
  }
}
```

### 2. Parser (语法分析器)

将 tokens 转换为 AST。

```typescript
// src/parser/Parser.ts

interface ASTNode {
  type: string
  attributes: Record<string, any>
  children: ASTNode[]
  content?: string
}

interface StoryAST extends ASTNode {
  type: 'story'
  attributes: {
    id: string
    title: string
    era: string
    duration: string
    difficulty: string
    tags: string[]
  }
  children: (SceneAST | TimelineAST | CharacterAST)[]
}

class Parser {
  parse(tokens: Token[]): StoryAST {
    const ast: ASTNode = {
      type: 'root',
      attributes: {},
      children: []
    }

    let current = 0
    let currentNode = ast

    while (current < tokens.length) {
      const token = tokens[current]

      switch (token.type) {
        case TokenType.TAG:
          const newNode = this.parseTag(tokens, current)
          currentNode.children.push(newNode)
          current = newNode.endIndex
          break

        case TokenType.ATTRIBUTE:
          const { key, value } = JSON.parse(token.value)
          currentNode.attributes[key] = this.parseValue(value)
          current++
          break

        default:
          current++
      }
    }

    return ast.children[0] as StoryAST
  }

  private parseTag(tokens: Token[], start: number): ASTNode {
    const tag = tokens[start].value
    const node: ASTNode = {
      type: tag,
      attributes: {},
      children: []
    }

    // 解析标记内容...

    return node
  }

  private parseValue(value: string): any {
    // 解析属性值
    // 支持: string, number, array, object, Vector3Tuple
    if (value.startsWith('[') && value.endsWith(']')) {
      return JSON.parse(value)  // Array
    }
    if (!isNaN(Number(value))) {
      return Number(value)  // Number
    }
    return value  // String
  }
}
```

### 3. Validator (验证器)

验证 AST 的合法性。

```typescript
// src/parser/Validator.ts

interface ValidationRule {
  field: string
  type: 'required' | 'type' | 'range' | 'pattern'
  params?: any
  message: string
}

const storyRules: ValidationRule[] = [
  {
    field: 'id',
    type: 'required',
    message: 'Story must have an ID'
  },
  {
    field: 'id',
    type: 'pattern',
    params: /^[a-z0-9-]+$/,
    message: 'ID must be kebab-case'
  },
  {
    field: 'difficulty',
    type: 'type',
    params: ['easy', 'medium', 'hard'],
    message: 'Difficulty must be easy, medium, or hard'
  }
]

class Validator {
  validate(ast: ASTNode): ValidationResult {
    const errors: ValidationError[] = []

    // 验证规则...
    for (const rule of storyRules) {
      const error = this.validateRule(ast, rule)
      if (error) errors.push(error)
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }
}
```

---

## 🏗️ 配置生成器

将 AST 转换为 Scene Config。

```typescript
// src/transform/ConfigBuilder.ts

class ConfigBuilder {
  build(ast: StoryAST): SceneConfig {
    return {
      meta: this.buildMeta(ast),
      scene: this.buildScene(ast),
      camera: this.buildCamera(ast),
      lights: this.buildLights(ast),
      objects: this.buildObjects(ast),
      materials: this.buildMaterials(ast),
      animations: this.buildAnimations(ast),
      postProcessing: this.buildPostProcessing(ast),
      interactions: this.buildInteractions(ast)
    }
  }

  private buildMeta(ast: StoryAST) {
    return {
      name: ast.attributes.title,
      version: "1.0.0",
      description: ast.content,
      author: ast.attributes.author,
      createdAt: new Date().toISOString()
    }
  }

  private buildScene(ast: StoryAST): SceneSettings {
    const sceneNode = ast.children.find(n => n.type === 'scene')
    if (!sceneNode) {
      return this.getDefaultScene()
    }

    return {
      background: {
        type: "color",
        value: sceneNode.attributes.background || "#1a1a1a"
      },
      environment: sceneNode.attributes.environment,
      fog: sceneNode.attributes.fog
    }
  }

  private buildObjects(ast: StoryAST): ObjectConfig[] {
    const objects: ObjectConfig[] = []

    // 从 AST 提取 characters
    const characters = ast.children.filter(n => n.type === 'character')
    for (const char of characters) {
      objects.push({
        id: char.attributes.id,
        type: 'gltf',
        url: char.attributes.model,
        transform: {
          position: char.attributes.position || [0, 0, 0],
          rotation: [0, 0, 0],
          scale: [1, 1, 1]
        },
        properties: {
          castShadow: true,
          receiveShadow: true
        }
      })
    }

    // 从 AST 提取 artifacts
    const artifacts = ast.children.filter(n => n.type === 'artifact')
    for (const art of artifacts) {
      objects.push({
        id: art.attributes.id,
        type: 'gltf',
        url: art.attributes.model,
        transform: {
          position: art.attributes.position || [0, 0, 0]
        },
        interactive: art.attributes.interactive
      })
    }

    return objects
  }

  private buildAnimations(ast: StoryAST): AnimationConfig {
    const timeline = ast.children.find(n => n.type === 'timeline')
    if (!timeline) return {}

    // 将时间轴转换为 GSAP 动画配置
    const animations = {}
    // ... 实现逻辑

    return animations
  }
}
```

---

## ⚛️ React 组件渲染器

将 Scene Config 渲染为 React 组件。

```typescript
// src/engine/SceneRenderer.tsx

interface SceneRendererProps {
  config: SceneConfig
}

export function SceneRenderer({ config }: SceneRendererProps) {
  return (
    <Canvas>
      {/* Scene Setup */}
      <SceneSetup config={config.scene} />

      {/* Camera */}
      <CameraController config={config.camera} />

      {/* Lights */}
      <LightsSystem config={config.lights} />

      {/* Objects */}
      {config.objects.map(obj => (
        <Object3DRenderer key={obj.id} config={obj} />
      ))}

      {/* Post Processing */}
      {config.postProcessing?.enabled && (
        <Effects config={config.postProcessing} />
      )}

      {/* Interactions */}
      <InteractionManager config={config.interactions} />
    </Canvas>
  )
}

// 对象渲染器
function Object3DRenderer({ config }: { config: ObjectConfig }) {
  switch (config.type) {
    case 'gltf':
      return <GLTFObject config={config} />
    case 'mesh':
      return <MeshObject config={config} />
    case 'particles':
      return <ParticleSystem config={config} />
    default:
      return null
  }
}

// GLTF 对象组件
function GLTFObject({ config }: { config: ObjectConfig }) {
  const { scene } = useGLTF(config.url)
  const ref = useRef<THREE.Group>(null)

  useEffect(() => {
    if (ref.current) {
      const { position, rotation, scale } = config.transform
      ref.current.position.set(...position)
      if (rotation) ref.current.rotation.set(...rotation)
      if (scale) {
        const s = Array.isArray(scale) ? scale : [scale, scale, scale]
        ref.current.scale.set(...s)
      }
    }
  }, [config])

  // 处理交互
  const handleClick = config.interactive?.clickable
    ? (e: ThreeEvent) => {
        // 触发交互事件
        eventBus.emit('object:click', { id: config.id, event: e })
      }
    : undefined

  return (
    <primitive
      ref={ref}
      object={scene.clone()}
      onClick={handleClick}
      castShadow={config.properties?.castShadow}
      receiveShadow={config.properties?.receiveShadow}
    />
  )
}
```

---

## 🎬 动画控制器

```typescript
// src/engine/AnimationController.ts

class AnimationController {
  private timelines: Map<string, gsap.core.Timeline> = new Map()

  playIntro(config: AnimationConfig) {
    if (!config.intro) return

    const tl = gsap.timeline()

    for (const step of config.intro.timeline) {
      const target = this.resolveTarget(step.target)

      tl.to(target, {
        ...step.properties,
        duration: step.duration,
        delay: step.delay,
        ease: step.ease
      }, step.delay ? `-=${step.delay}` : undefined)
    }

    this.timelines.set('intro', tl)
    return tl
  }

  playTimeline(events: TimelineEvent[]) {
    const tl = gsap.timeline()

    events.forEach((event, index) => {
      tl.add(() => {
        // 显示事件
        this.showEvent(event)
      }, index * 2) // 每个事件间隔2秒
    })

    return tl
  }

  private resolveTarget(targetPath: string): any {
    // 解析目标路径
    // 例如: "camera" → camera object
    //      "objects[0]" → first object
    //      "lights.point[0]" → first point light
  }
}
```

---

## 🎮 交互管理器

```typescript
// src/engine/InteractionManager.tsx

function InteractionManager({ config }: { config: InteractionConfig }) {
  const eventBus = useEventBus()

  useEffect(() => {
    // 注册全局事件监听
    Object.entries(config.handlers || {}).forEach(([event, handler]) => {
      eventBus.on(event, (data) => {
        executeHandler(handler, data)
      })
    })

    // 注册键盘快捷键
    Object.entries(config.keyboard || {}).forEach(([key, action]) => {
      window.addEventListener('keydown', (e) => {
        if (e.key === key) {
          executeAction(action)
        }
      })
    })

    return () => {
      eventBus.removeAllListeners()
    }
  }, [config])

  const executeHandler = (handler: EventHandler, data: any) => {
    switch (handler.action) {
      case 'callback':
        // 执行回调
        break
      case 'animation':
        // 触发动画
        break
      case 'material':
        // 改变材质
        break
      case 'camera':
        // 移动相机
        break
    }
  }

  return null
}
```

---

## 📦 完整工作流

```typescript
// src/index.ts

async function loadStory(markdownUrl: string) {
  // 1. 加载 Markdown
  const markdown = await fetch(markdownUrl).then(r => r.text())

  // 2. 解析为 AST
  const tokenizer = new Tokenizer()
  const parser = new Parser()
  const tokens = tokenizer.tokenize(markdown)
  const ast = parser.parse(tokens)

  // 3. 验证
  const validator = new Validator()
  const validation = validator.validate(ast)
  if (!validation.valid) {
    throw new Error(`Validation failed: ${validation.errors}`)
  }

  // 4. 生成配置
  const builder = new ConfigBuilder()
  const config = builder.build(ast)

  // 5. 渲染场景
  return <SceneRenderer config={config} />
}

// 使用
function App() {
  const [scene, setScene] = useState(null)

  useEffect(() => {
    loadStory('/stories/qin-unification/story.md')
      .then(setScene)
  }, [])

  return scene
}
```

---

## 🔌 插件系统

支持扩展自定义功能。

```typescript
// src/plugins/PluginSystem.ts

interface Plugin {
  name: string
  version: string
  install: (engine: RenderEngine) => void
}

class PluginSystem {
  private plugins: Map<string, Plugin> = new Map()

  register(plugin: Plugin) {
    this.plugins.set(plugin.name, plugin)
  }

  use(name: string, engine: RenderEngine) {
    const plugin = this.plugins.get(name)
    if (plugin) {
      plugin.install(engine)
    }
  }
}

// 示例插件: VR 支持
const VRPlugin: Plugin = {
  name: 'vr-support',
  version: '1.0.0',
  install(engine) {
    engine.enableVR()
    engine.addVRControllers()
  }
}
```

---

这套架构实现了从 Markdown → AST → Config → 3D Scene 的完整流程！
