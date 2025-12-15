import { Router } from 'express'
import { getArticlesForAI } from '../db'
import { generateChat, buildNewsContext, SYSTEM_PROMPT } from '../gemini'

export const chatRouter = Router()

chatRouter.post('/chat', async (req, res) => {
  try {
    const { question, hours = 1 } = req.body
    
    if (!question) {
      return res.status(400).json({ error: 'Question is required' })
    }

    const articles = await getArticlesForAI(hours)
    const context = buildNewsContext(articles)
    
    const prompt = `${SYSTEM_PROMPT}

当前新闻数据（过去 ${hours} 小时，共 ${articles.length} 条）：
${context}

用户问题：${question}

请基于以上数据回答用户的问题。如果数据中没有相关信息，请明确说明。`

    const answer = await generateChat(prompt)

    res.json({ answer })
  } catch (err) {
    console.error('Chat failed:', err)
    res.status(500).json({ error: 'Chat failed' })
  }
})
