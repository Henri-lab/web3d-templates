import { StoryNode, SceneNode, CharacterNode, ArtifactNode, TimelineEventNode, QuizNode } from './parser'
import type { Story, Scene, Character, Artifact, TimelineEvent, Quiz, QuizQuestion, Narration } from '@/types'

export class ConfigBuilder {
  private storyNode: StoryNode

  constructor(storyNode: StoryNode) {
    this.storyNode = storyNode
  }

  build(): Story {
    return {
      id: this.storyNode.id || this.generateId(this.storyNode.title),
      title: this.storyNode.title,
      era: (this.storyNode.attributes.era as string) || '',
      dynasty: this.storyNode.attributes.dynasty as string,
      duration: (this.storyNode.attributes.duration as string) || '10min',
      difficulty: (this.storyNode.attributes.difficulty as 'easy' | 'medium' | 'hard') || 'medium',
      thumbnail: (this.storyNode.attributes.thumbnail as string) || '/images/default-thumbnail.jpg',
      description: (this.storyNode.attributes.description as string) || '',
      tags: (this.storyNode.attributes.tags as string[]) || [],
      scenes: this.storyNode.scenes.map((s) => this.buildScene(s)),
      timeline: this.buildTimeline(),
      characters: this.storyNode.characters.map((c) => this.buildCharacter(c)),
      artifacts: this.storyNode.artifacts.map((a) => this.buildArtifact(a)),
      quiz: this.storyNode.quiz ? this.buildQuiz(this.storyNode.quiz) : undefined,
      preloadAssets: this.storyNode.attributes.preload as string[],
      lazyLoadAssets: this.storyNode.attributes['lazy-load'] as string[],
    }
  }

  private buildScene(node: SceneNode): Scene {
    return {
      id: node.id || this.generateId(node.title),
      title: node.title,
      description: this.extractDescription(node.content),
      environment: (node.attributes.environment as Scene['environment']) || 'custom',
      lighting: (node.attributes.lighting as Scene['lighting']) || 'bright',
      modelUrl: node.attributes.model as string,
      position: this.parseVector3(node.attributes.position),
      cameraPosition: this.parseVector3(node.attributes.camera) || this.parseVector3(node.attributes.cameraPosition),
      cameraTarget: this.parseVector3(node.attributes.cameraTarget) || this.parseVector3(node.attributes.target),
      narration: node.narration
        ? {
            text: node.narration.text,
            audioUrl: node.narration.attributes.audio as string,
            duration: node.narration.attributes.duration as number,
            voice: node.narration.attributes.voice as 'male' | 'female',
          }
        : undefined,
      interactions: node.interactions.map((i) => ({
        id: (i.attributes.id as string) || this.generateId('interaction'),
        type: (i.attributes.type as 'click' | 'hover' | 'drag' | 'proximity') || 'click',
        targetId: i.attributes.target as string,
        action: {
          type: (i.attributes.action as string) || 'showInfo',
          payload: i.attributes.payload as Record<string, unknown>,
        },
        feedback: i.attributes.feedback as string,
      })),
      music: node.attributes.music as string,
      ambientSound: node.attributes.ambient as string,
    }
  }

  private buildCharacter(node: CharacterNode): Character {
    return {
      id: node.id || this.generateId(node.name),
      name: node.name,
      title: node.attributes.title as string,
      dynasty: node.attributes.dynasty as string,
      lifespan: node.attributes.lifespan as string,
      description: this.extractDescription(node.content),
      avatar: node.attributes.avatar as string,
      modelUrl: node.attributes.model as string,
      position: this.parseVector3(node.attributes.position),
      significance: (node.attributes.significance as string) || '',
    }
  }

  private buildArtifact(node: ArtifactNode): Artifact {
    return {
      id: node.id || this.generateId(node.name),
      name: node.name,
      era: node.attributes.era as string,
      material: node.attributes.material as string,
      dimensions: node.attributes.dimensions as string,
      location: node.attributes.location as string,
      description: this.extractDescription(node.content),
      significance: (node.attributes.significance as string) || '',
      modelUrl: node.attributes.model as string,
      imageUrl: node.attributes.image as string,
      position: this.parseVector3(node.attributes.position),
      scale: node.attributes.scale as number,
      rotation: this.parseVector3(node.attributes.rotation),
      interactable: (node.attributes.interactable as boolean) ?? true,
    }
  }

  private buildTimeline(): TimelineEvent[] {
    return this.storyNode.timeline.map((event, index) => ({
      id: `event-${index}`,
      year: event.year,
      title: event.title,
      description: event.description,
      type: 'major' as const,
    }))
  }

  private buildQuiz(node: QuizNode): Quiz {
    return {
      id: node.id || this.generateId('quiz'),
      title: node.title,
      questions: node.questions.map((q, i) => ({
        id: `q-${i}`,
        type: 'multiple-choice' as const,
        question: q.question,
        options: q.options,
        correctAnswer: q.answer,
        points: 10,
      })),
      passingScore: 60,
    }
  }

  // 辅助方法
  private extractDescription(content: Array<{ type: string; value: unknown }>): string {
    return content
      .filter((c) => c.type === 'text')
      .map((c) => c.value)
      .join('\n')
  }

  private parseVector3(value: unknown): [number, number, number] | undefined {
    if (!value) return undefined

    if (Array.isArray(value) && value.length >= 3) {
      return [Number(value[0]), Number(value[1]), Number(value[2])]
    }

    if (typeof value === 'string') {
      const parts = value.replace(/[\[\]]/g, '').split(',').map(Number)
      if (parts.length >= 3 && parts.every((n) => !isNaN(n))) {
        return [parts[0], parts[1], parts[2]]
      }
    }

    return undefined
  }

  private generateId(base: string): string {
    return base
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }
}

export function buildConfig(storyNode: StoryNode): Story {
  const builder = new ConfigBuilder(storyNode)
  return builder.build()
}
