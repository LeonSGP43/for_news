import { Router } from 'express'
import { getArticlesForAI } from '../db'
import { generateChat, buildNewsContext } from '../gemini'
import { getNewsCache, setNewsCache } from '../cache'
import { type Locale, getChatPrompt } from '../i18n'

export const chatRouter = Router()

// 构建精简摘要 - 只保留标题和板块，大幅减少 token
function buildCompactSummary(articles: Array<{ t: string; s: string }>): string {
  // 按板块分组
  const bySection: Record<string, string[]> = {}
  for (const a of articles) {
    const section = a.s || '其他'
    if (!bySection[section]) bySection[section] = []
    bySection[section].push(a.t)
  }
  
  // 每个板块只保留前20条标题
  const parts: string[] = []
  for (const [section, titles] of Object.entries(bySection)) {
    parts.push(`[${section}]${titles.slice(0, 20).join('|')}`)
  }
  return parts.join('\n')
}

// 刷新缓存
async function refreshCache(hours: number) {
  const articles = await getArticlesForAI(hours)
  const sections = [...new Set((articles as Array<{ s: string }>).map((a) => a.s).filter(Boolean))]
  const summary = buildCompactSummary(articles as Array<{ t: string; s: string }>)
  
  setNewsCache({
    summary,
    articleCount: articles.length,
    sections: sections as string[],
    updatedAt: new Date().toISOString(),
    hours
  })
  
  return { summary, articleCount: articles.length }
}

chatRouter.post('/chat', async (req, res) => {
  try {
    const { question, hours = 24, locale = 'en' } = req.body as { 
      question: string
      hours?: number
      locale?: Locale 
    }
    
    if (!question) {
      return res.status(400).json({ error: 'Question is required' })
    }

    const systemPrompt = getChatPrompt(locale)

    // 检查缓存是否有效
    let cache = getNewsCache()
    const cacheAge = cache ? (Date.now() - new Date(cache.updatedAt).getTime()) / 1000 / 60 : Infinity
    
    // 缓存超过10分钟或时间范围变化，刷新缓存
    if (!cache || cacheAge > 10 || cache.hours !== hours) {
      console.log('🔄 刷新新闻缓存...')
      await refreshCache(hours)
      cache = getNewsCache()!
    }
    
    const prompt = `${systemPrompt}

News data (${cache.articleCount} items, last ${hours} hours):
${cache.summary}

Question: ${question}`

    const answer = await generateChat(prompt)
    res.json({ answer, cacheInfo: { articleCount: cache.articleCount, hours } })
  } catch (err) {
    console.error('Chat failed:', err)
    res.status(500).json({ error: 'Chat failed' })
  }
})

// 手动刷新缓存
chatRouter.post('/chat/refresh', async (req, res) => {
  const { hours = 24 } = req.body
  await refreshCache(hours)
  res.json({ message: 'Cache refreshed', cache: getNewsCache() })
})
