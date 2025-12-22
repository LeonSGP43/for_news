import { Router } from 'express'
import { getArticlesForAI } from '../db'
import { generateAnalysis, buildNewsContext } from '../gemini'
import { type Locale } from '../i18n'

export const analysisRouter = Router()

// 缓存最新分析结果（按语言缓存）
const cachedAnalysis: Record<string, {
  results: Record<string, string>
  generatedAt: string
}> = {}

const PROMPTS: Record<Locale, string> = {
  zh: `你是舆情分析助手。请用中文回答。

请一次性完成以下5个分析任务，严格按JSON格式返回，每个任务的content必须是美化的Markdown格式，重点突出、层次分明。

任务列表：
1. hot_keywords: 提取10个高频热词，按热度排序，说明来源
2. sentiment: 情感分析，按板块统计正/中/负面比例，指出负面舆情
3. trending: 识别上升话题，预测潜在热点
4. summary: 生成舆情简报，含各板块热点、重大事件、异常情况
5. cross_platform: 找出跨板块共同话题

严格返回以下JSON格式（不要有其他内容）：
{"hot_keywords":"markdown内容","sentiment":"markdown内容","trending":"markdown内容","summary":"markdown内容","cross_platform":"markdown内容"}`,

  en: `You are a news analysis assistant. Please respond in English.

Complete the following 5 analysis tasks at once, return strictly in JSON format, each task's content must be well-formatted Markdown with clear hierarchy.

Tasks:
1. hot_keywords: Extract 10 high-frequency keywords, sorted by popularity, with sources
2. sentiment: Sentiment analysis, statistics of positive/neutral/negative ratio by section
3. trending: Identify rising topics, predict potential hot topics
4. summary: Generate news briefing, including hot topics, major events, anomalies
5. cross_platform: Find common topics across sections

Return strictly in this JSON format (no other content):
{"hot_keywords":"markdown content","sentiment":"markdown content","trending":"markdown content","summary":"markdown content","cross_platform":"markdown content"}`,

  ja: `あなたはニュース分析アシスタントです。日本語で回答してください。

以下の5つの分析タスクを一度に完了し、JSON形式で厳密に返してください。各タスクのcontentは整形されたMarkdown形式で、階層が明確である必要があります。

タスク：
1. hot_keywords: 10個の高頻度キーワードを抽出、人気順にソート、ソースを記載
2. sentiment: 感情分析、セクション別のポジティブ/ニュートラル/ネガティブ比率
3. trending: 上昇トピックを特定、潜在的なホットトピックを予測
4. summary: ニュースブリーフィングを生成、ホットトピック、重大イベント、異常を含む
5. cross_platform: セクション間の共通トピックを見つける

以下のJSON形式で厳密に返してください（他のコンテンツなし）：
{"hot_keywords":"markdown内容","sentiment":"markdown内容","trending":"markdown内容","summary":"markdown内容","cross_platform":"markdown内容"}`
}

analysisRouter.post('/run', async (req, res) => {
  try {
    const { taskId, locale = 'zh' } = req.body as { taskId?: string; locale?: Locale }
    
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
    const basePrompt = PROMPTS[locale] || PROMPTS.zh
    
    const prompt = `${basePrompt}

新闻数据(${articles.length}条):${context}`

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
    const locale = (req.query.locale as Locale) || 'zh'
    
    if (cachedAnalysis[locale]) {
      return res.json(cachedAnalysis[locale])
    }
    
    const articles = await getArticlesForAI(1)
    const context = buildNewsContext(articles)
    const basePrompt = PROMPTS[locale] || PROMPTS.zh
    
    const prompt = `${basePrompt}

新闻数据(${articles.length}条):${context}`

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
  const locale = (req.body.locale as Locale) || 'zh'
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
