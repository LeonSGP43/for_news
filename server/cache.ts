// 新闻摘要缓存 - 避免每次问答都传全量数据给 AI
interface NewsCache {
  summary: string        // 压缩后的新闻摘要
  articleCount: number
  sections: string[]
  updatedAt: string
  hours: number
}

let newsCache: NewsCache | null = null

export function setNewsCache(cache: NewsCache) {
  newsCache = cache
  console.log(`📦 缓存更新: ${cache.articleCount}条新闻, ${cache.summary.length}字符`)
}

export function getNewsCache(): NewsCache | null {
  return newsCache
}

export function clearNewsCache() {
  newsCache = null
}
