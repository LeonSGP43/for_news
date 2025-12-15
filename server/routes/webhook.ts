import { Router } from 'express'
import { getArticlesForAI } from '../db'
import { generateAnalysis, buildNewsContext, SYSTEM_PROMPT } from '../gemini'

export const webhookRouter = Router()

// 存储最新的自动分析结果
let latestAutoAnalysis: {
  content: string
  generatedAt: string
} | null = null

// 爬虫完成后的 webhook 回调
webhookRouter.post('/webhook/crawl-complete', async (req, res) => {
  console.log('📥 Received crawl complete webhook')
  
  try {
    // 立即返回响应，后台执行分析
    res.json({ status: 'received', message: 'Analysis started' })
    
    // 异步执行自动分析
    runAutoAnalysis()
  } catch (err) {
    console.error('Webhook handling failed:', err)
  }
})

// 获取最新的自动分析结果
webhookRouter.get('/auto-analysis', (_, res) => {
  if (latestAutoAnalysis) {
    res.json(latestAutoAnalysis)
  } else {
    res.json({ content: null, generatedAt: null })
  }
})

async function runAutoAnalysis() {
  console.log('🤖 Starting auto analysis (gemini-3-pro-preview with HIGH thinking)...')
  
  try {
    const articles = await getArticlesForAI(1)
    const context = buildNewsContext(articles)
    
    const prompt = `${SYSTEM_PROMPT}

当前新闻数据（最新一小时，共 ${articles.length} 条）：
${context}

请执行以下综合分析任务：

1. **热点概览**：列出各平台 Top 3 热点
2. **热词提取**：提取 5 个最热门的关键词
3. **趋势洞察**：识别正在上升的话题
4. **异常检测**：是否有值得关注的异常情况

输出格式要求：简洁、有条理、使用 Markdown 格式`

    const content = await generateAnalysis(prompt)
    
    latestAutoAnalysis = {
      content,
      generatedAt: new Date().toLocaleString('zh-CN')
    }
    
    console.log('✅ Auto analysis completed')
  } catch (err) {
    console.error('Auto analysis failed:', err)
  }
}
