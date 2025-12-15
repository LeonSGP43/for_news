import { GoogleGenAI, type ThinkingLevel } from '@google/genai'

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || ''
})

// 深度分析模型配置 (gemini-3-pro-preview with thinking)
export const analysisConfig = {
  thinkingConfig: {
    thinkingLevel: 'high' as ThinkingLevel
  }
}

// 快速问答模型配置
export const chatConfig = {
  thinkingConfig: {
    thinkingLevel: 'low' as ThinkingLevel
  }
}

export async function generateAnalysis(prompt: string): Promise<string> {
  const response = await ai.models.generateContentStream({
    model: 'gemini-3-pro-preview',
    config: analysisConfig,
    contents: [{
      role: 'user',
      parts: [{ text: prompt }]
    }]
  })

  let result = ''
  for await (const chunk of response) {
    result += chunk.text || ''
  }
  return result
}

export async function generateChat(prompt: string): Promise<string> {
  const response = await ai.models.generateContentStream({
    model: 'gemini-2.5-flash',
    config: chatConfig,
    contents: [{
      role: 'user',
      parts: [{ text: prompt }]
    }]
  })

  let result = ''
  for await (const chunk of response) {
    result += chunk.text || ''
  }
  return result
}

export function buildNewsContext(articles: unknown[]): string {
  return JSON.stringify(articles, null, 2)
}

export const SYSTEM_PROMPT = `你是一个专业的舆情分析助手。你的任务是基于提供的新闻数据回答问题。

重要规则：
1. 只基于提供的数据回答，不要编造信息
2. 如果数据中没有相关信息，明确说明"数据中未找到相关信息"
3. 引用具体新闻时，提供标题和来源
4. 使用中文回答
5. 回答要简洁、有条理

数据字段说明：
- platform: 数据来源平台
- rank: 在该平台的排名
- heat/score: 热度值
- trend: 趋势 (new=新上榜, rising=上升, stable=稳定, falling=下降)
- rank_change: 排名变化 (正数=上升, 负数=下降)
- momentum: 动量分数 (0-100)
`
