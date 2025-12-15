import { Router } from 'express'
import { getArticles, getSections } from '../db'

export const articlesRouter = Router()

articlesRouter.get('/articles', async (req, res) => {
  try {
    const hours = parseInt(req.query.hours as string) || 1
    const articles = await getArticles(hours)
    res.json(articles)
  } catch (err) {
    console.error('Failed to fetch articles:', err)
    res.status(500).json({ error: 'Failed to fetch articles' })
  }
})

articlesRouter.get('/platforms', async (_, res) => {
  try {
    const sections = await getSections()
    res.json(sections)
  } catch (err) {
    console.error('Failed to fetch sections:', err)
    res.status(500).json({ error: 'Failed to fetch sections' })
  }
})
