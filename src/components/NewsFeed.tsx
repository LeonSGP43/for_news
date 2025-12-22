import { useStore } from '../store'
import type { NewsArticle } from '../types'

function getTrendIcon(trend: string | null) {
  switch (trend) {
    case 'new': return '🆕'
    case 'rising': return '🔥'
    case 'stable': return ''
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

function ArticleCard({ article, index }: { article: NewsArticle; index: number }) {
  const heatDisplay = formatHeat(article.heat, article.score)
  const trendIcon = getTrendIcon(article.trend)
  
  return (
    <a
      href={article.link}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-start gap-3 p-3 rounded-lg hover:bg-gray-800/50 transition-all"
    >
      {/* 排名 */}
      <div className={`flex-shrink-0 w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${
        index < 3 ? 'bg-gradient-to-br from-orange-500 to-red-500 text-white' : 'bg-gray-700 text-gray-400'
      }`}>
        {article.rank ?? index + 1}
      </div>
      
      {/* 内容 */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm text-gray-200 group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug">
          {trendIcon && <span className="mr-1">{trendIcon}</span>}
          {article.title}
        </h3>
        
        {/* 元信息 */}
        <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-500">
          {article.source && (
            <span className="truncate max-w-[100px]">{article.source}</span>
          )}
          {heatDisplay && (
            <span className="text-orange-400">{heatDisplay}</span>
          )}
          {article.time_str && (
            <span>{article.time_str}</span>
          )}
          {article.rank_change !== null && article.rank_change !== 0 && (
            <span className={article.rank_change > 0 ? 'text-green-400' : 'text-red-400'}>
              {article.rank_change > 0 ? `↑${article.rank_change}` : `↓${Math.abs(article.rank_change)}`}
            </span>
          )}
        </div>
      </div>
    </a>
  )
}

function SectionCard({ section, articles }: { section: string; articles: NewsArticle[] }) {
  return (
    <div className="bg-gray-800/30 rounded-xl border border-gray-700/50 overflow-hidden">
      {/* 标题栏 */}
      <div className="px-4 py-3 bg-gray-800/50 border-b border-gray-700/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1 h-4 bg-blue-500 rounded-full" />
          <h2 className="font-medium text-gray-200">{section}</h2>
        </div>
        <span className="text-xs text-gray-500 bg-gray-700/50 px-2 py-0.5 rounded-full">
          {articles.length}
        </span>
      </div>
      
      {/* 列表 */}
      <div className="divide-y divide-gray-700/30 max-h-[500px] overflow-y-auto">
        {articles.slice(0, 15).map((article, idx) => (
          <ArticleCard key={article.id} article={article} index={idx} />
        ))}
      </div>
    </div>
  )
}

export default function NewsFeed() {
  const { articles, platforms, selectedPlatform, setSelectedPlatform } = useStore()

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

  const totalCount = articles.length

  return (
    <div>
      {/* 筛选栏 */}
      <div className="mb-4 flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setSelectedPlatform(null)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            !selectedPlatform 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          全部 ({totalCount})
        </button>
        {platforms.map((section) => (
          <button
            key={section}
            onClick={() => setSelectedPlatform(section)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              selectedPlatform === section 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {section} ({groupedBySection[section]?.length ?? 0})
          </button>
        ))}
      </div>

      {/* 卡片网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {displaySections.map((section) => (
          <SectionCard 
            key={section} 
            section={section} 
            articles={groupedBySection[section] || []} 
          />
        ))}
      </div>
      
      {displaySections.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          <p className="text-4xl mb-4">📭</p>
          <p>暂无数据</p>
        </div>
      )}
    </div>
  )
}
