// 必须在最开始加载环境变量
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })

const __dirname = path.dirname(fileURLToPath(import.meta.url))

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
import { traceRouter } from './routes/trace'
import { promptsRouter } from './routes/prompts'

const app = express()
const PORT = process.env.PORT || 3111

app.use(cors())
app.use(express.json())

// 日志中间件（已禁用）
// app.use('/api', (req, res, next) => {
//   const start = Date.now()
//   const originalJson = res.json.bind(res)
//   res.json = (body: unknown) => {
//     const duration = Date.now() - start
//     console.log(`\n📡 ${req.method} ${req.originalUrl} [${duration}ms]`)
//     console.log(`📥 Request:`, req.method === 'GET' ? req.query : req.body)
//     console.log(`📤 Response:`, JSON.stringify(body, null, 2))
//     return originalJson(body)
//   }
//   next()
// })

// API Routes
app.use('/api', articlesRouter)
app.use('/api/analysis', analysisRouter)
app.use('/api', chatRouter)
app.use('/api', webhookRouter)
app.use('/api', traceRouter)
app.use('/api', promptsRouter)

// Health check
app.get('/api/health', (_, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// 提供前端静态文件
const distPath = path.join(__dirname, '../dist')
app.use(express.static(distPath))

// SPA 路由：所有非 API 请求返回 index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'))
})

// 初始化数据库连接后再启动服务
import { initDB } from './db'

initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`)
  })
})
