import { Router } from 'express'
import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const router = Router()
const promptsPath = join(__dirname, '../prompts.json')

// 获取所有 prompts
router.get('/prompts', (req, res) => {
  try {
    const data = readFileSync(promptsPath, 'utf-8')
    res.json(JSON.parse(data))
  } catch (err) {
    console.error('Failed to read prompts:', err)
    res.status(500).json({ error: 'Failed to read prompts' })
  }
})

// 更新 prompts
router.put('/prompts', (req, res) => {
  try {
    const prompts = req.body
    writeFileSync(promptsPath, JSON.stringify(prompts, null, 2), 'utf-8')
    res.json({ success: true })
  } catch (err) {
    console.error('Failed to save prompts:', err)
    res.status(500).json({ error: 'Failed to save prompts' })
  }
})

// 更新单个 prompt
router.put('/prompts/:type/:locale', (req, res) => {
  try {
    const { type, locale } = req.params
    const { content } = req.body
    
    const data = JSON.parse(readFileSync(promptsPath, 'utf-8'))
    if (!data[type]) {
      return res.status(404).json({ error: 'Prompt type not found' })
    }
    
    data[type][locale] = content
    writeFileSync(promptsPath, JSON.stringify(data, null, 2), 'utf-8')
    res.json({ success: true })
  } catch (err) {
    console.error('Failed to update prompt:', err)
    res.status(500).json({ error: 'Failed to update prompt' })
  }
})

export { router as promptsRouter }
