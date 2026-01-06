// DSL Token 类型定义
export type TokenType =
  | 'STORY'
  | 'SCENE'
  | 'TIMELINE'
  | 'CHARACTER'
  | 'LOCATION'
  | 'ARTIFACT'
  | 'NARRATION'
  | 'INTERACTION'
  | 'TRANSITION'
  | 'MEDIA'
  | 'QUIZ'
  | 'ATTRIBUTE'
  | 'TEXT'
  | 'HEADING'
  | 'LIST_ITEM'
  | 'CODE_BLOCK'
  | 'SEPARATOR'
  | 'FRONTMATTER'
  | 'EOF'

export interface Token {
  type: TokenType
  value: string
  line: number
  column: number
  attributes?: Record<string, unknown>
}

export interface TokenizerState {
  source: string
  position: number
  line: number
  column: number
  tokens: Token[]
}

// DSL 标记映射
const DSL_MARKERS: Record<string, TokenType> = {
  '#story': 'STORY',
  '#scene': 'SCENE',
  '#timeline': 'TIMELINE',
  '#character': 'CHARACTER',
  '#location': 'LOCATION',
  '#artifact': 'ARTIFACT',
  '#narration': 'NARRATION',
  '#interaction': 'INTERACTION',
  '#transition': 'TRANSITION',
  '#media': 'MEDIA',
  '#quiz': 'QUIZ',
}

export class Tokenizer {
  private state: TokenizerState

  constructor(source: string) {
    this.state = {
      source,
      position: 0,
      line: 1,
      column: 1,
      tokens: [],
    }
  }

  tokenize(): Token[] {
    while (!this.isAtEnd()) {
      this.scanToken()
    }

    this.addToken('EOF', '')
    return this.state.tokens
  }

  private scanToken(): void {
    const char = this.peek()

    // 跳过空白
    if (this.isWhitespace(char)) {
      this.advance()
      return
    }

    // 换行
    if (char === '\n') {
      this.state.line++
      this.state.column = 1
      this.advance()
      return
    }

    // YAML Frontmatter
    if (char === '-' && this.state.column === 1 && this.matchFrontmatter()) {
      return
    }

    // 分隔符 ---
    if (char === '-' && this.state.column === 1 && this.matchSeparator()) {
      return
    }

    // DSL 标记
    if (char === '#' && this.state.column === 1) {
      this.scanDSLMarker()
      return
    }

    // 属性 @key: value
    if (char === '@') {
      this.scanAttribute()
      return
    }

    // 标题 ## Heading
    if (char === '#') {
      this.scanHeading()
      return
    }

    // 列表项 - item
    if (char === '-' && this.state.column === 1) {
      this.scanListItem()
      return
    }

    // 代码块 ```
    if (char === '`' && this.match('```')) {
      this.scanCodeBlock()
      return
    }

    // 普通文本
    this.scanText()
  }

  private scanDSLMarker(): void {
    const start = this.state.position
    let word = ''

    while (!this.isAtEnd() && !this.isWhitespace(this.peek()) && this.peek() !== '\n') {
      word += this.advance()
    }

    const lowerWord = word.toLowerCase()
    const type = DSL_MARKERS[lowerWord]

    if (type) {
      // 获取标记后的标题
      this.skipWhitespace()
      let title = ''
      while (!this.isAtEnd() && this.peek() !== '\n') {
        title += this.advance()
      }
      this.addToken(type, title.trim())
    } else {
      // 普通标题
      this.state.position = start
      this.scanHeading()
    }
  }

  private scanAttribute(): void {
    this.advance() // 跳过 @
    let key = ''
    let value = ''

    // 读取键
    while (!this.isAtEnd() && this.peek() !== ':' && this.peek() !== '\n') {
      key += this.advance()
    }

    if (this.peek() === ':') {
      this.advance() // 跳过 :
      this.skipWhitespace()

      // 读取值
      while (!this.isAtEnd() && this.peek() !== '\n') {
        value += this.advance()
      }
    }

    this.addToken('ATTRIBUTE', key.trim(), {
      key: key.trim(),
      value: this.parseAttributeValue(value.trim()),
    })
  }

  private parseAttributeValue(value: string): unknown {
    // 数组 [a, b, c]
    if (value.startsWith('[') && value.endsWith(']')) {
      const inner = value.slice(1, -1)
      return inner.split(',').map((s) => this.parseAttributeValue(s.trim()))
    }

    // 数字
    if (!isNaN(Number(value))) {
      return Number(value)
    }

    // 布尔值
    if (value === 'true') return true
    if (value === 'false') return false

    // 移除引号
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      return value.slice(1, -1)
    }

    return value
  }

  private scanHeading(): void {
    let level = 0
    while (this.peek() === '#') {
      level++
      this.advance()
    }

    this.skipWhitespace()
    let text = ''
    while (!this.isAtEnd() && this.peek() !== '\n') {
      text += this.advance()
    }

    this.addToken('HEADING', text.trim(), { level })
  }

  private scanListItem(): void {
    this.advance() // 跳过 -
    this.skipWhitespace()

    let text = ''
    while (!this.isAtEnd() && this.peek() !== '\n') {
      text += this.advance()
    }

    this.addToken('LIST_ITEM', text.trim())
  }

  private scanCodeBlock(): void {
    // 跳过开始的 ```
    this.advance()
    this.advance()
    this.advance()

    // 获取语言标识
    let language = ''
    while (!this.isAtEnd() && this.peek() !== '\n') {
      language += this.advance()
    }
    this.advance() // 跳过换行

    // 读取代码内容
    let code = ''
    while (!this.isAtEnd()) {
      if (this.peek() === '`' && this.match('```')) {
        this.advance()
        this.advance()
        this.advance()
        break
      }
      if (this.peek() === '\n') {
        this.state.line++
        this.state.column = 1
      }
      code += this.advance()
    }

    this.addToken('CODE_BLOCK', code, { language: language.trim() })
  }

  private scanText(): void {
    let text = ''
    while (!this.isAtEnd() && this.peek() !== '\n') {
      text += this.advance()
    }

    if (text.trim()) {
      this.addToken('TEXT', text.trim())
    }
  }

  private matchFrontmatter(): boolean {
    if (this.state.line !== 1) return false

    if (this.state.source.slice(this.state.position, this.state.position + 3) !== '---') {
      return false
    }

    // 跳过开始的 ---
    this.advance()
    this.advance()
    this.advance()
    this.skipToNextLine()

    let content = ''
    while (!this.isAtEnd()) {
      if (this.peek() === '-' && this.state.column === 1 &&
          this.state.source.slice(this.state.position, this.state.position + 3) === '---') {
        this.advance()
        this.advance()
        this.advance()
        this.skipToNextLine()
        break
      }
      if (this.peek() === '\n') {
        this.state.line++
        this.state.column = 1
      }
      content += this.advance()
    }

    this.addToken('FRONTMATTER', content.trim())
    return true
  }

  private matchSeparator(): boolean {
    if (this.state.source.slice(this.state.position, this.state.position + 3) !== '---') {
      return false
    }

    this.advance()
    this.advance()
    this.advance()
    this.addToken('SEPARATOR', '---')
    return true
  }

  private match(expected: string): boolean {
    return this.state.source.slice(this.state.position, this.state.position + expected.length) === expected
  }

  private peek(): string {
    return this.state.source[this.state.position] || '\0'
  }

  private advance(): string {
    const char = this.state.source[this.state.position]
    this.state.position++
    this.state.column++
    return char
  }

  private isAtEnd(): boolean {
    return this.state.position >= this.state.source.length
  }

  private isWhitespace(char: string): boolean {
    return char === ' ' || char === '\t' || char === '\r'
  }

  private skipWhitespace(): void {
    while (!this.isAtEnd() && this.isWhitespace(this.peek())) {
      this.advance()
    }
  }

  private skipToNextLine(): void {
    while (!this.isAtEnd() && this.peek() !== '\n') {
      this.advance()
    }
    if (this.peek() === '\n') {
      this.state.line++
      this.state.column = 1
      this.advance()
    }
  }

  private addToken(type: TokenType, value: string, attributes?: Record<string, unknown>): void {
    this.state.tokens.push({
      type,
      value,
      line: this.state.line,
      column: this.state.column,
      attributes,
    })
  }
}

export function tokenize(source: string): Token[] {
  const tokenizer = new Tokenizer(source)
  return tokenizer.tokenize()
}
