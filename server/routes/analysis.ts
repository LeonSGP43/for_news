import { Router } from 'express'
import { getArticlesForAI } from '../db'
import { generateAnalysis, buildNewsContext, SYSTEM_PROMPT } from '../gemini'

export const analysisRouter = Router()

const ANALYSIS_PROMPTS: Record<string, { name: string; prompt: string }> = {
  hot_keywords: {
    name: '🔥 热词分析',
    prompt: '分析以下新闻数据，提取出现频率最高的10个关键词/话题，并简要说明每个话题的热度来源和趋势。按热度排序输出。'
  },
  sentiment: {
    name: '😊 情感分析',
    prompt: '对以下新闻进行情感分析，按平台分类统计正面、中性、负面新闻的比例，并指出值得关注的负面舆情。'
  },
  trending: {
    name: '📈 趋势预测',
    prompt: '分析以下新闻数据中的趋势变化（关注 trend、rank_change、momentum 字段），识别正在快速上升的话题，预测未来可能成为热点的内容。'
  },
  summary: {
    name: '📋 综合摘要',
    prompt: '基于以下新闻数据，生成一份简洁的舆情简报，包括：1) 各平台热点概览 2) 重大事件汇总 3) 值得关注的异常情况。'
  },
  cross_platform: {
    name: '🔗 跨平台分析',
    prompt: '分析以下新闻数据，找出在多个平台同时出现或被讨论的话题，这些通常是真正的热点事件。列出跨平台话题及其在各平台的表现。'
  }
}

analysisRouter.post('/run', async (req, res) => {
  try {
    const { taskId } = req.body
    const task = ANALYSIS_PROMPTS[taskId]
    
    if (!task) {
      return res.status(400).json({ error: 'Invalid task ID' })
    }

    const articles = await getArticlesForAI(1)
    const context = buildNewsContext(articles)
    
    const prompt = `${SYSTEM_PROMPT}

当前新闻数据（共 ${articles.length} 条）：
${context}

任务：${task.prompt}`

    const response = await generateAnalysis(prompt)

    res.json({
      taskId,
      taskName: task.name,
      content: response,
      generatedAt: new Date().toLocaleString('zh-CN')
    })
  } catch (err) {
    console.error('Analysis failed:', err)
    res.status(500).json({ error: 'Analysis failed' })
  }
})
