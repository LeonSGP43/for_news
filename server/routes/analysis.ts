import { Router } from 'express'
import { getArticlesForAI } from '../db'
import { generateAnalysis, buildNewsContext, SYSTEM_PROMPT } from '../gemini'

export const analysisRouter = Router()

// 缓存最新分析结果
let cachedAnalysis: {
  results: Record<string, string>
  generatedAt: string
} | null = null

const COMBINED_PROMPT = `${SYSTEM_PROMPT}

请一次性完成以下5个分析任务，严格按JSON格式返回，每个任务的content必须是美化的Markdown格式，重点突出、层次分明。

任务列表：
1. hot_keywords: 提取10个高频热词，按热度排序，说明来源
2. sentiment: 情感分析，按板块统计正/中/负面比例，指出负面舆情
3. trending: 识别上升话题，预测潜在热点
4. summary: 生成舆情简报，含各板块热点、重大事件、异常情况
5. cross_platform: 找出跨板块共同话题

严格返回以下JSON格式（不要有其他内容）：
{"hot_keywords":"markdown内容","sentiment":"markdown内容","trending":"markdown内容","summary":"markdown内容","cross_platform":"markdown内容"}`

analysisRouter.post('/run', async (req, res) => {
  try {
    const { taskId } = req.body
    
    // 如果有缓存且请求单个任务，直接返回缓存
    if (cachedAnalysis && taskId && cachedAnalysis.results[taskId]) {
      return res.json({
        taskId,
        taskName: getTaskName(taskId),
        content: cachedAnalysis.results[taskId],
        generatedAt: cachedAnalysis.generatedAt
      })
    }

    const articles = await getArticlesForAI(1)
    const context = buildNewsContext(articles)
    
    const prompt = `${COMBINED_PROMPT}

新闻数据(${articles.length}条):${context}`

    console.log('🤖 Running combined analysis...')
    const response = await generateAnalysis(prompt)
    
    // 解析JSON响应
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Invalid JSON response')
    }
    
    const results = JSON.parse(jsonMatch[0]) as Record<string, string>
    const generatedAt = new Date().toLocaleString('zh-CN')
    
    // 缓存结果
    cachedAnalysis = { results, generatedAt }
    
    // 返回请求的任务或全部
    if (taskId) {
      res.json({
        taskId,
        taskName: getTaskName(taskId),
        content: results[taskId] || '分析失败',
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
    if (cachedAnalysis) {
      return res.json(cachedAnalysis)
    }
    
    const articles = await getArticlesForAI(1)
    const context = buildNewsContext(articles)
    
    const prompt = `${COMBINED_PROMPT}

新闻数据(${articles.length}条):${context}`

    console.log('🤖 Running combined analysis...')
    const response = await generateAnalysis(prompt)
    
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Invalid JSON response')
    }
    
    const results = JSON.parse(jsonMatch[0]) as Record<string, string>
    const generatedAt = new Date().toLocaleString('zh-CN')
    
    cachedAnalysis = { results, generatedAt }
    res.json(cachedAnalysis)
  } catch (err) {
    console.error('Analysis failed:', err)
    res.status(500).json({ error: 'Analysis failed' })
  }
})

// 清除缓存，强制重新分析
analysisRouter.post('/refresh', async (req, res) => {
  cachedAnalysis = null
  res.json({ message: 'Cache cleared' })
})

function getTaskName(taskId: string): string {
  const names: Record<string, string> = {
    hot_keywords: '🔥 热词分析',
    sentiment: '😊 情感分析',
    trending: '📈 趋势预测',
    summary: '📋 综合摘要',
    cross_platform: '🔗 跨板块分析'
  }
  return names[taskId] || taskId
}
