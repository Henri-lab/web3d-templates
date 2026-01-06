import { tokenize } from './tokenizer'
import { parse, StoryNode } from './parser'
import { buildConfig } from './parser/configBuilder'
import type { Story } from '@/types'

export async function loadStory(path: string): Promise<Story> {
  const response = await fetch(path)
  if (!response.ok) {
    throw new Error(`Failed to load story: ${path}`)
  }

  const content = await response.text()
  return parseStoryContent(content)
}

export function parseStoryContent(content: string): Story {
  const ast = parse(content)
  return buildConfig(ast)
}

export async function loadStoryFromUrl(url: string): Promise<Story> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch story from: ${url}`)
  }

  const content = await response.text()
  return parseStoryContent(content)
}

// 验证 DSL 语法
export function validateDSL(content: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  try {
    const tokens = tokenize(content)

    // 检查是否有 story 标记
    const hasStory = tokens.some((t) => t.type === 'STORY')
    if (!hasStory) {
      errors.push('Missing #story marker')
    }

    // 尝试解析
    parse(content)
  } catch (e) {
    errors.push((e as Error).message)
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

// 导出所有模块
export { tokenize } from './tokenizer'
export { parse, Parser, type StoryNode, type SceneNode, type CharacterNode, type ArtifactNode } from './parser'
export { buildConfig, ConfigBuilder } from './parser/configBuilder'
