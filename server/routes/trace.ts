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

router.post('/trace', async (req, res) => {
  const { title, link, source, locale = 'zh' } = req.body as { 
    title: string
    link?: string
    source?: string
    locale?: Locale 
  }
  
  if (!title) {
    return res.status(400).json({ error: 'title is required' })
  }

  const prompt = getTracePrompt(locale, title, source || 'Unknown')

  try {
    console.log('🔍 Trace request:', { title, source, locale })
    
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

    const text = response.text || ''
    console.log('📝 Gemini response:', text.substring(0, 500))
    
    // 尝试提取 JSON
    let jsonResult
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
        } else {
          throw new Error('Cannot parse response')
        }
      }
    }

    console.log('✅ Parsed result:', JSON.stringify(jsonResult).substring(0, 200))
    res.json(jsonResult)
  } catch (error) {
    console.error('❌ Trace error:', error)
    res.status(500).json({ error: 'Trace failed' })
  }
})

export { router as traceRouter }
