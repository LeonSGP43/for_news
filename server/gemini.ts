import { GoogleGenAI, type ThinkingLevel } from '@google/genai'

let ai: GoogleGenAI | null = null

function getAI(): GoogleGenAI {
  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set')
    }
    console.log('🤖 Initializing Gemini AI...')
    ai = new GoogleGenAI({ apiKey })
  }
  return ai
}

// 深度分析模型配置 (gemini-3-pro-preview with thinking)
const analysisConfig = {
  thinkingConfig: {
    thinkingLevel: 'high' as ThinkingLevel
  }
}

// 快速问答模型配置
const chatConfig = {
  thinkingConfig: {
    thinkingLevel: 'low' as ThinkingLevel
  }
}

interface TokenUsage {
  promptTokens: number
  responseTokens: number
  thinkingTokens: number
  totalTokens: number
}

function logTokenUsage(model: string, usage: TokenUsage) {
  console.log(`📊 [${model}] Token消耗: 输入=${usage.promptTokens} 输出=${usage.responseTokens} 思考=${usage.thinkingTokens} 总计=${usage.totalTokens}`)
}

export async function generateAnalysis(prompt: string): Promise<string> {
  const response = await getAI().models.generateContentStream({
    model: 'gemini-3-pro-preview',
    config: analysisConfig,
    contents: [{
      role: 'user',
      parts: [{ text: prompt }]
    }]
  })

  let result = ''
  let usageMetadata: unknown = null
  
  for await (const chunk of response) {
    result += chunk.text || ''
    if (chunk.usageMetadata) {
      usageMetadata = chunk.usageMetadata
    }
  }
  
  // 打印token消耗
  if (usageMetadata) {
    const meta = usageMetadata as Record<string, number>
    logTokenUsage('gemini-3-pro', {
      promptTokens: meta.promptTokenCount || 0,
      responseTokens: meta.candidatesTokenCount || 0,
      thinkingTokens: meta.thoughtsTokenCount || 0,
      totalTokens: meta.totalTokenCount || 0
    })
  }
  
  return result
}

export async function generateChat(prompt: string): Promise<string> {
  const response = await getAI().models.generateContentStream({
    model: 'gemini-2.5-flash',
    contents: [{
      role: 'user',
      parts: [{ text: prompt }]
    }]
  })

  let result = ''
  let usageMetadata: unknown = null
  
  for await (const chunk of response) {
    result += chunk.text || ''
    if (chunk.usageMetadata) {
      usageMetadata = chunk.usageMetadata
    }
  }
  
  // 打印token消耗
  if (usageMetadata) {
    const meta = usageMetadata as Record<string, number>
    logTokenUsage('gemini-2.5-flash', {
      promptTokens: meta.promptTokenCount || 0,
      responseTokens: meta.candidatesTokenCount || 0,
      thinkingTokens: meta.thoughtsTokenCount || 0,
      totalTokens: meta.totalTokenCount || 0
    })
  }
  
  return result
}

export function buildNewsContext(articles: unknown[]): string {
  // 压缩JSON，无空格无换行
  return JSON.stringify(articles)
}

export const SYSTEM_PROMPT = `你是舆情分析助手。基于提供的新闻数据回答问题。
规则：1.只基于数据回答,不编造 2.无相关信息时明确说明 3.引用时提供标题 4.中文回答 5.简洁有条理
数据字段：t=标题,d=描述,r=排名(数字越小越热),s=板块/平台`
