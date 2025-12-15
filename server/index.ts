// 必须在最开始加载环境变量
import dotenv from 'dotenv'
import path from 'path'
dotenv.config({ path: path.resolve(process.cwd(), '.env') })

// 打印确认
console.log('📦 ENV loaded:', {
  DB_HOST: process.env.DB_HOST,
  DB_USER: process.env.DB_USER,
  DB_NAME: process.env.DB_NAME
})

// 然后再导入其他模块
import express from 'express'
import cors from 'cors'
import { articlesRouter } from './routes/articles'
import { analysisRouter } from './routes/analysis'
import { chatRouter } from './routes/chat'
import { webhookRouter } from './routes/webhook'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

// Routes
app.use('/api', articlesRouter)
app.use('/api/analysis', analysisRouter)
app.use('/api', chatRouter)
app.use('/api', webhookRouter)

// Health check
app.get('/api/health', (_, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// 初始化数据库连接后再启动服务
import { initDB } from './db'

initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`)
  })
})
