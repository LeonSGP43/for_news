export interface NewsArticle {
  id: number
  title: string
  link: string
  source: string | null
  platform: string
  section: string | null
  time_str: string | null
  datetime: string | null
  rank: number | null
  heat: number | null
  search_volume: number | null
  growth_rate: number | null
  score: number | null
  comment_count: number | null
  description: string | null
  author: string | null
  language: string | null
  post_type: string | null
  thumbnail: string | null
  country: string | null
  extra_data: Record<string, unknown> | null
  is_new: boolean
  prev_rank: number | null
  rank_change: number | null
  momentum: number | null
  trend: string | null
  scraped_at: string
}

export interface AnalysisTask {
  id: string
  name: string
  prompt: string
  description: string
}

export interface AnalysisResult {
  taskId: string
  taskName: string
  content: string
  generatedAt: string
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}
