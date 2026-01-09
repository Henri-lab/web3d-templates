import { Token, TokenType, tokenize } from '../tokenizer'

// AST 节点类型
export interface ASTNode {
  type: string
  value?: unknown
  children?: ASTNode[]
  attributes?: Record<string, unknown>
  position?: { line: number; column: number }
}

export interface StoryNode extends ASTNode {
  type: 'story'
  id: string
  title: string
  attributes: Record<string, unknown>
  scenes: SceneNode[]
  characters: CharacterNode[]
  artifacts: ArtifactNode[]
  timeline: TimelineEventNode[]
  quiz?: QuizNode
}

export interface SceneNode extends ASTNode {
  type: 'scene'
  id: string
  title: string
  attributes: Record<string, unknown>
  content: ASTNode[]
  narration?: NarrationNode
  interactions: InteractionNode[]
}

export interface CharacterNode extends ASTNode {
  type: 'character'
  id: string
  name: string
  attributes: Record<string, unknown>
  content: ASTNode[]
}

export interface ArtifactNode extends ASTNode {
  type: 'artifact'
  id: string
  name: string
  attributes: Record<string, unknown>
  content: ASTNode[]
}

export interface TimelineNode extends ASTNode {
  type: 'timeline'
  events: TimelineEventNode[]
}

export interface TimelineEventNode extends ASTNode {
  type: 'timeline-event'
  year: string
  title: string
  description: string
}

export interface NarrationNode extends ASTNode {
  type: 'narration'
  text: string
  attributes: Record<string, unknown>
}

export interface InteractionNode extends ASTNode {
  type: 'interaction'
  attributes: Record<string, unknown>
}

export interface QuizNode extends ASTNode {
  type: 'quiz'
  id: string
  title: string
  questions: QuizQuestionNode[]
}

export interface QuizQuestionNode extends ASTNode {
  type: 'quiz-question'
  question: string
  options: string[]
  answer: number | string
}

export class Parser {
  private tokens: Token[]
  private position: number = 0

  constructor(tokens: Token[]) {
    this.tokens = tokens
  }

  parse(): StoryNode {
    // 跳过 frontmatter
    if (this.check('FRONTMATTER')) {
      this.advance()
    }

    // 解析故事
    if (!this.check('STORY')) {
      throw new Error('Expected #story at the beginning')
    }

    return this.parseStory()
  }

  private parseStory(): StoryNode {
    const storyToken = this.advance()
    const storyNode: StoryNode = {
      type: 'story',
      id: '',
      title: storyToken.value,
      attributes: {},
      scenes: [],
      characters: [],
      artifacts: [],
      timeline: [],
    }

    // 收集属性
    while (this.check('ATTRIBUTE')) {
      const attr = this.advance()
      const key = attr.attributes?.key as string
      const value = attr.attributes?.value
      storyNode.attributes[key] = value

      if (key === 'id') {
        storyNode.id = value as string
      }
    }

    // 跳过分隔符和文本内容
    while (!this.isAtEnd()) {
      if (this.check('SEPARATOR')) {
        this.advance()
        continue
      }

      if (this.check('SCENE')) {
        storyNode.scenes.push(this.parseScene())
      } else if (this.check('CHARACTER')) {
        storyNode.characters.push(this.parseCharacter())
      } else if (this.check('ARTIFACT')) {
        storyNode.artifacts.push(this.parseArtifact())
      } else if (this.check('TIMELINE')) {
        storyNode.timeline.push(...this.parseTimeline().events)
      } else if (this.check('QUIZ')) {
        storyNode.quiz = this.parseQuiz()
      } else {
        this.advance() // 跳过其他 token
      }
    }

    return storyNode
  }

  private parseScene(): SceneNode {
    const sceneToken = this.advance()
    const sceneNode: SceneNode = {
      type: 'scene',
      id: '',
      title: sceneToken.value,
      attributes: {},
      content: [],
      interactions: [],
    }

    // 收集属性
    while (this.check('ATTRIBUTE')) {
      const attr = this.advance()
      const key = attr.attributes?.key as string
      const value = attr.attributes?.value
      sceneNode.attributes[key] = value

      if (key === 'id') {
        sceneNode.id = value as string
      }
    }

    // 收集内容直到下一个主要块
    while (!this.isAtEnd() && !this.isMainBlock()) {
      if (this.check('NARRATION')) {
        sceneNode.narration = this.parseNarration()
      } else if (this.check('INTERACTION')) {
        sceneNode.interactions.push(this.parseInteraction())
      } else if (this.check('SEPARATOR')) {
        this.advance()
        break
      } else if (this.check('TEXT') || this.check('HEADING') || this.check('LIST_ITEM')) {
        sceneNode.content.push({
          type: this.peek().type.toLowerCase(),
          value: this.advance().value,
        })
      } else {
        this.advance()
      }
    }

    return sceneNode
  }

  private parseCharacter(): CharacterNode {
    const charToken = this.advance()
    const charNode: CharacterNode = {
      type: 'character',
      id: '',
      name: charToken.value,
      attributes: {},
      content: [],
    }

    while (this.check('ATTRIBUTE')) {
      const attr = this.advance()
      const key = attr.attributes?.key as string
      const value = attr.attributes?.value
      charNode.attributes[key] = value

      if (key === 'id') {
        charNode.id = value as string
      }
    }

    while (!this.isAtEnd() && !this.isMainBlock() && !this.check('SEPARATOR')) {
      if (this.check('TEXT') || this.check('HEADING') || this.check('LIST_ITEM')) {
        charNode.content.push({
          type: this.peek().type.toLowerCase(),
          value: this.advance().value,
        })
      } else {
        this.advance()
      }
    }

    return charNode
  }

  private parseArtifact(): ArtifactNode {
    const artifactToken = this.advance()
    const artifactNode: ArtifactNode = {
      type: 'artifact',
      id: '',
      name: artifactToken.value,
      attributes: {},
      content: [],
    }

    while (this.check('ATTRIBUTE')) {
      const attr = this.advance()
      const key = attr.attributes?.key as string
      const value = attr.attributes?.value
      artifactNode.attributes[key] = value

      if (key === 'id') {
        artifactNode.id = value as string
      }
    }

    while (!this.isAtEnd() && !this.isMainBlock() && !this.check('SEPARATOR')) {
      if (this.check('TEXT') || this.check('HEADING') || this.check('LIST_ITEM')) {
        artifactNode.content.push({
          type: this.peek().type.toLowerCase(),
          value: this.advance().value,
        })
      } else {
        this.advance()
      }
    }

    return artifactNode
  }

  private parseTimeline(): TimelineNode {
    this.advance() // 跳过 #timeline
    const timelineNode: TimelineNode = {
      type: 'timeline',
      events: [],
    }

    while (!this.isAtEnd() && !this.isMainBlock() && !this.check('SEPARATOR')) {
      if (this.check('LIST_ITEM')) {
        const item = this.advance()
        // 解析格式: 年份 - 标题 - 描述
        const parts = item.value.split(' - ')
        if (parts.length >= 2) {
          timelineNode.events.push({
            type: 'timeline-event',
            year: parts[0].trim(),
            title: parts[1].trim(),
            description: parts.slice(2).join(' - ').trim() || '',
          })
        }
      } else {
        this.advance()
      }
    }

    return timelineNode
  }

  private parseNarration(): NarrationNode {
    this.advance() // 跳过 #narration 标记
    const narrationNode: NarrationNode = {
      type: 'narration',
      text: '',
      attributes: {},
    }

    while (this.check('ATTRIBUTE')) {
      const attr = this.advance()
      const key = attr.attributes?.key as string
      const value = attr.attributes?.value
      narrationNode.attributes[key] = value
    }

    // 收集旁白文本
    let text = ''
    while (
      !this.isAtEnd() &&
      !this.isMainBlock() &&
      !this.check('SEPARATOR') &&
      !this.check('INTERACTION')
    ) {
      if (this.check('TEXT')) {
        text += this.advance().value + '\n'
      } else {
        this.advance()
      }
    }

    narrationNode.text = text.trim()
    return narrationNode
  }

  private parseInteraction(): InteractionNode {
    this.advance() // 跳过 #interaction
    const interactionNode: InteractionNode = {
      type: 'interaction',
      attributes: {},
    }

    while (this.check('ATTRIBUTE')) {
      const attr = this.advance()
      const key = attr.attributes?.key as string
      const value = attr.attributes?.value
      interactionNode.attributes[key] = value
    }

    return interactionNode
  }

  private parseQuiz(): QuizNode {
    const quizToken = this.advance()
    const quizNode: QuizNode = {
      type: 'quiz',
      id: '',
      title: quizToken.value,
      questions: [],
    }

    while (this.check('ATTRIBUTE')) {
      const attr = this.advance()
      const key = attr.attributes?.key as string
      const value = attr.attributes?.value

      if (key === 'id') {
        quizNode.id = value as string
      }
    }

    // 解析题目
    while (!this.isAtEnd() && !this.isMainBlock() && !this.check('SEPARATOR')) {
      if (this.check('HEADING')) {
        const questionNode = this.parseQuizQuestion()
        if (questionNode) {
          quizNode.questions.push(questionNode)
        }
      } else {
        this.advance()
      }
    }

    return quizNode
  }

  private parseQuizQuestion(): QuizQuestionNode | null {
    const heading = this.advance()
    const questionNode: QuizQuestionNode = {
      type: 'quiz-question',
      question: heading.value,
      options: [],
      answer: 0,
    }

    // 收集选项
    while (this.check('LIST_ITEM')) {
      const item = this.advance()
      questionNode.options.push(item.value)
    }

    // 收集答案属性
    while (this.check('ATTRIBUTE')) {
      const attr = this.advance()
      const key = attr.attributes?.key as string
      const value = attr.attributes?.value

      if (key === 'answer') {
        questionNode.answer = value as number | string
      }
    }

    return questionNode.options.length > 0 ? questionNode : null
  }

  // 辅助方法
  private isMainBlock(): boolean {
    const mainTypes: TokenType[] = ['STORY', 'SCENE', 'CHARACTER', 'ARTIFACT', 'TIMELINE', 'QUIZ']
    return mainTypes.includes(this.peek().type)
  }

  private check(type: TokenType): boolean {
    return this.peek().type === type
  }

  private peek(): Token {
    return this.tokens[this.position] || { type: 'EOF', value: '', line: 0, column: 0 }
  }

  private advance(): Token {
    if (!this.isAtEnd()) {
      this.position++
    }
    return this.tokens[this.position - 1]
  }

  private isAtEnd(): boolean {
    return this.peek().type === 'EOF'
  }
}

export function parse(source: string): StoryNode {
  const tokens = tokenize(source)
  const parser = new Parser(tokens)
  return parser.parse()
}
