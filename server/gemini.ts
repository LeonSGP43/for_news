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

async function logTokenUsage(model: string, usage: TokenUsage) {
  console.log(`\n📊 ====== Token Usage [${model}] ======`)
  console.log(`   📥 Prompt tokens:   ${usage.promptTokens}`)
  console.log(`   📤 Response tokens: ${usage.responseTokens}`)
  console.log(`   🧠 Thinking tokens: ${usage.thinkingTokens}`)
  console.log(`   📈 Total tokens:    ${usage.totalTokens}`)
  console.log(`=====================================\n`)
  // 保存数据
  
}

export async function generateAnalysis(prompt: string): Promise<string> {
  // console.log('\n🤖 [Analysis] Gemini API Request')
  // console.log('📋 Prompt:\n', prompt)
  
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
  
  console.log('📤 Response:\n', result)
  
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
  console.log('\n💬 [Chat] Gemini API Request')
  console.log('📋 Prompt:\n', prompt)
  
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
  
  // console.log('📤 Response:\n', result)
  
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
