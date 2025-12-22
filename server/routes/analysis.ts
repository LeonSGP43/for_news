import { Router } from 'express'
import { getArticlesForAI } from '../db'
import { generateAnalysis, buildNewsContext } from '../gemini'
import { type Locale, getAnalysisPrompt } from '../i18n'

export const analysisRouter = Router()

// 缓存最新分析结果（按语言缓存）
const cachedAnalysis: Record<string, {
  results: Record<string, string>
  generatedAt: string
}> = {}

analysisRouter.post('/run', async (req, res) => {
  try {
    const { taskId, locale = 'en' } = req.body as { taskId?: string; locale?: Locale }
    
    // 如果有缓存且请求单个任务，直接返回缓存
    if (cachedAnalysis[locale] && taskId && cachedAnalysis[locale].results[taskId]) {
      return res.json({
        taskId,
        taskName: getTaskName(taskId, locale),
        content: cachedAnalysis[locale].results[taskId],
        generatedAt: cachedAnalysis[locale].generatedAt
      })
    }

    const articles = await getArticlesForAI(1)
    const context = buildNewsContext(articles)
    const basePrompt = getAnalysisPrompt(locale)
    
    const prompt = `${basePrompt}

News data (${articles.length} items):${context}`

    console.log('🤖 Running combined analysis...', { locale })
    const response = await generateAnalysis(prompt)
    
    // 解析JSON响应
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Invalid JSON response')
    }
    
    const results = JSON.parse(jsonMatch[0]) as Record<string, string>
    const generatedAt = new Date().toLocaleString(locale === 'zh' ? 'zh-CN' : locale === 'ja' ? 'ja-JP' : 'en-US')
    
    // 缓存结果
    cachedAnalysis[locale] = { results, generatedAt }
    
    // 返回请求的任务或全部
    if (taskId) {
      res.json({
        taskId,
        taskName: getTaskName(taskId, locale),
        content: results[taskId] || 'Analysis failed',
        generatedAt
      })
    } else {
      res.json({ results, generatedAt })
    }
  } catch (err) {
    console.error('Analysis failed:', err)
    res.status(500).json({ error: 'Analysis failed' })
  }
})

// 获取全部分析结果
analysisRouter.get('/all', async (req, res) => {
  try {
    const locale = (req.query.locale as Locale) || 'en'
    
    if (cachedAnalysis[locale]) {
      return res.json(cachedAnalysis[locale])
    }
    
    const articles = await getArticlesForAI(1)
    const context = buildNewsContext(articles)
    const basePrompt = getAnalysisPrompt(locale)
    
    const prompt = `${basePrompt}

News data (${articles.length} items):${context}`

    console.log('🤖 Running combined analysis...', { locale })
    const response = await generateAnalysis(prompt)
    
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Invalid JSON response')
    }
    
    const results = JSON.parse(jsonMatch[0]) as Record<string, string>
    const generatedAt = new Date().toLocaleString(locale === 'zh' ? 'zh-CN' : locale === 'ja' ? 'ja-JP' : 'en-US')
    
    cachedAnalysis[locale] = { results, generatedAt }
    res.json(cachedAnalysis[locale])
  } catch (err) {
    console.error('Analysis failed:', err)
    res.status(500).json({ error: 'Analysis failed' })
  }
})

// 清除缓存，强制重新分析
analysisRouter.post('/refresh', async (req, res) => {
  const locale = (req.body.locale as Locale) || 'en'
  delete cachedAnalysis[locale]
  res.json({ message: 'Cache cleared' })
})

function getTaskName(taskId: string, locale: Locale): string {
  const names: Record<Locale, Record<string, string>> = {
    zh: {
      hot_keywords: '🔥 热词分析',
      sentiment: '😊 情感分析',
      trending: '📈 趋势预测',
      summary: '📋 综合摘要',
      cross_platform: '🔗 跨板块分析'
    },
    en: {
      hot_keywords: '🔥 Hot Keywords',
      sentiment: '😊 Sentiment',
      trending: '📈 Trending',
      summary: '📋 Summary',
      cross_platform: '🔗 Cross Platform'
    },
    ja: {
      hot_keywords: '🔥 キーワード',
      sentiment: '😊 感情分析',
      trending: '📈 トレンド',
      summary: '📋 サマリー',
      cross_platform: '🔗 クロス分析'
    }
  }
  return names[locale]?.[taskId] || taskId
}
