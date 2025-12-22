import type { NewsArticle, AnalysisResult } from './types'

const API_BASE = '/api'

export async function fetchArticles(hours = 1): Promise<NewsArticle[]> {
  const res = await fetch(`${API_BASE}/articles?hours=${hours}`)
  if (!res.ok) throw new Error('Failed to fetch articles')
  return res.json()
}

export async function fetchPlatforms(): Promise<string[]> {
  const res = await fetch(`${API_BASE}/platforms`)
  if (!res.ok) throw new Error('Failed to fetch platforms')
  return res.json()
}

export async function runAnalysis(taskId: string): Promise<AnalysisResult> {
  const res = await fetch(`${API_BASE}/analysis/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ taskId })
  })
  if (!res.ok) throw new Error('Analysis failed')
  return res.json()
}

export async function runAllAnalysis(locale = 'zh'): Promise<{ results: Record<string, string>; generatedAt: string }> {
  const res = await fetch(`${API_BASE}/analysis/all?locale=${locale}`)
  if (!res.ok) throw new Error('Analysis failed')
  return res.json()
}

export async function refreshAnalysis(locale = 'zh'): Promise<void> {
  await fetch(`${API_BASE}/analysis/refresh`, { 
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ locale })
  })
}

export async function chat(
  question: string, 
  hours: number,
  locale = 'zh'
): Promise<string> {
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, hours, locale })
  })
  if (!res.ok) throw new Error('Chat failed')
  const data = await res.json()
  return data.answer
}
