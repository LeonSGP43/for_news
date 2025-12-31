import { Router } from 'express'
import { GoogleGenAI } from '@google/genai'
import { type Locale, getTracePrompt } from '../i18n'

const router = Router()

let ai: GoogleGenAI | null = null
function getAI(): GoogleGenAI {
  if (!ai) {
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })
  }
  return ai
}

// 默认响应
function getDefaultResponse(source?: string, message?: string) {
  return {
    summary: message || 'Unable to trace this news source',
    credibility: { score: 5, level: 'Unknown', reason: 'Insufficient data for analysis' },
    origin: { source: source || 'Unknown', time: 'Unknown', type: 'Unknown', detail: 'Could not determine origin' },
    spread: { path: [], speed: 'Unknown', scope: 'Unknown', detail: 'No spread data available' },
    keyPlayers: [],
    timeline: [],
    distortion: { hasDistortion: false, level: 'None', examples: [] },
    relatedLinks: []
  }
}

// 带重试的 API 调用
async function callWithRetry(prompt: string, maxRetries = 3): Promise<string> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await getAI().models.generateContent({
        model: 'gemini-2.5-flash',
        config: {
          tools: [{ googleSearch: {} }]
        },
        contents: [{
          role: 'user',
          parts: [{ text: prompt }]
        }]
      })
      // console.log("resp_trace",response)
      // 打印 token 消耗
      const usage = response.usageMetadata
      if (usage) {
        console.log(`\n📊 ====== Token Usage [gemini-2.5-flash + Search] ======`)
        console.log(`   📥 Prompt tokens:   ${usage.promptTokenCount || 0}`)
        console.log(`   📤 Response tokens: ${usage.candidatesTokenCount || 0}`)
        console.log(`   🧠 Thinking tokens: ${usage.thoughtsTokenCount || 0}`)
        console.log(`   📈 Total tokens:    ${usage.totalTokenCount || 0}`)
        console.log(`=======================================================\n`)
      }
      
      return response.text || ''
    } catch (error: unknown) {
      const err = error as { status?: number }
      console.log(`⚠️ Attempt ${i + 1} failed:`, err.status || 'unknown error')
      if (err.status === 503 && i < maxRetries - 1) {
        // 等待后重试
        await new Promise(r => setTimeout(r, 2000 * (i + 1)))
        continue
      }
      throw error
    }
  }
  return ''
}

router.post('/trace', async (req, res) => {
  const { title, source, locale = 'en' } = req.body as { 
    title: string
    source?: string
    locale?: Locale 
  }
  
  if (!title) {
    return res.status(400).json({ error: 'title is required' })
  }

  const prompt = getTracePrompt(locale, title, source || 'Unknown')

  try {
    console.log('🔍 Trace request:', { title, source, locale })
    // console.log('📋 Full prompt:\n', prompt)
    
    const text = await callWithRetry(prompt)
    // console.log('📝 Gemini full response:\n', text)
    
    // 空响应时返回默认结果
    if (!text.trim()) {
      console.log('⚠️ Empty response, returning default')
      return res.json(getDefaultResponse(source))
    }
    
    // 尝试提取 JSON
    let jsonResult: Record<string, unknown> | null = null
    try {
      jsonResult = JSON.parse(text)
    } catch {
      const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/)
      if (jsonMatch) {
        jsonResult = JSON.parse(jsonMatch[1].trim())
      } else {
        const startIdx = text.indexOf('{')
        const endIdx = text.lastIndexOf('}')
        if (startIdx !== -1 && endIdx !== -1) {
          jsonResult = JSON.parse(text.slice(startIdx, endIdx + 1))
        }
      }
    }

    if (jsonResult) {
      // console.log('✅ Parsed result:\n', JSON.stringify(jsonResult, null, 2))
      return res.json(jsonResult)
    }
    
    // 无法解析时返回默认
    console.log('⚠️ Cannot parse, returning default')
    return res.json(getDefaultResponse(source, text.substring(0, 100)))
    
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string }
    console.error('❌ Trace error:', err.message || error)
    
    // 任何错误都返回默认响应，不要 500
    const message = err.status === 503 
      ? 'AI service is busy, please try again later'
      : 'Analysis temporarily unavailable'
    return res.json(getDefaultResponse(source, message))
  }
})

export { router as traceRouter }
