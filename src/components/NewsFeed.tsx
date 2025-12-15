import { useStore } from '../store'
import type { NewsArticle } from '../types'

function getTrendIcon(trend: string | null) {
  switch (trend) {
    case 'new': return '🆕'
    case 'rising': return '🔥'
    case 'stable': return '➡️'
    case 'falling': return '📉'
    case 'returning': return '🔄'
    default: return ''
  }
}

function formatHeat(heat: number | null, score: number | null) {
  const value = heat ?? score
  if (!value) return null
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
  return value.toString()
}

function ArticleCard({ article }: { article: NewsArticle }) {
  const heatDisplay = formatHeat(article.heat, article.score)
  
  return (
    <a
      href={article.link}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-4 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors border border-gray-700 hover:border-gray-600"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
          {article.rank ?? '-'}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-gray-100 font-medium line-clamp-2 mb-1">
            {getTrendIcon(article.trend)} {article.title}
          </h3>
          {article.description && (
            <p className="text-gray-400 text-sm line-clamp-2 mb-2">
              {article.description}
            </p>
          )}
          <div className="flex items-center gap-3 text-xs text-gray-500">
            {article.source && <span>📌 {article.source}</span>}
            {heatDisplay && <span>🔥 {heatDisplay}</span>}
            {article.time_str && <span>🕐 {article.time_str}</span>}
            {article.rank_change !== null && article.rank_change !== 0 && (
              <span className={article.rank_change > 0 ? 'text-green-400' : 'text-red-400'}>
                {article.rank_change > 0 ? `↑${article.rank_change}` : `↓${Math.abs(article.rank_change)}`}
              </span>
            )}
          </div>
        </div>
      </div>
    </a>
  )
}

export default function NewsFeed() {
  const { articles, platforms, selectedPlatform, setSelectedPlatform, lastUpdated, isLoading } = useStore()

  // 按 section 分组
  const groupedBySection = articles.reduce((acc, article) => {
    const section = article.section || '未分类'
    if (!acc[section]) acc[section] = []
    acc[section].push(article)
    return acc
  }, {} as Record<string, NewsArticle[]>)

  Object.values(groupedBySection).forEach(list => {
    list.sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999))
  })

  const displaySections = selectedPlatform 
    ? [selectedPlatform] 
    : platforms.filter(p => groupedBySection[p]?.length > 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setSelectedPlatform(null)}
            className={`px-3 py-1 rounded-full text-sm ${
              !selectedPlatform ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            全部
          </button>
          {platforms.map((section) => (
            <button
              key={section}
              onClick={() => setSelectedPlatform(section)}
              className={`px-3 py-1 rounded-full text-sm ${
                selectedPlatform === section ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              {section} ({groupedBySection[section]?.length ?? 0})
            </button>
          ))}
        </div>
        <div className="text-sm text-gray-400">
          {isLoading ? '加载中...' : `更新于 ${lastUpdated}`}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {displaySections.map((section) => (
          <div key={section} className="bg-gray-850 rounded-xl p-4 border border-gray-700">
            <h2 className="text-lg font-bold text-blue-400 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              {section}
              <span className="text-sm text-gray-500 font-normal">
                ({groupedBySection[section]?.length ?? 0})
              </span>
            </h2>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {groupedBySection[section]?.slice(0, 20).map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
