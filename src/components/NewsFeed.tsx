import { useState } from 'react'
import { useStore } from '../store'
import type { NewsArticle } from '../types'
import TraceModal from './TraceModal'

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

function ArticleCard({ 
  article, 
  index, 
  showRank = true,
  onClick 
}: { 
  article: NewsArticle
  index: number
  showRank?: boolean
  onClick: () => void
}) {
  const heatDisplay = formatHeat(article.heat, article.score)
  const trendIcon = getTrendIcon(article.trend)
  
  return (
    <div
      onClick={onClick}
      className="group flex items-start gap-3 p-3 rounded-lg hover:bg-neutral-800/50 transition-all cursor-pointer"
    >
      {/* 排名 */}
      {showRank && (
        <div className={`flex-shrink-0 w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${
          index < 3 ? 'bg-white text-black' : 'bg-neutral-800 text-neutral-400'
        }`}>
          {article.rank ?? index + 1}
        </div>
      )}
      
      {/* 内容 */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm text-neutral-200 group-hover:text-white transition-colors line-clamp-2 leading-snug">
          {trendIcon && <span className="mr-1">{trendIcon}</span>}
          {article.title}
        </h3>
        
        {/* 元信息 */}
        <div className="flex items-center gap-2 mt-1.5 text-xs text-neutral-500">
          {article.source && (
            <span className="truncate max-w-[100px]">{article.source}</span>
          )}
          {heatDisplay && (
            <span className="text-neutral-400">{heatDisplay}</span>
          )}
          {article.time_str && (
            <span>{article.time_str}</span>
          )}
          {article.rank_change !== null && article.rank_change !== 0 && (
            <span className={article.rank_change > 0 ? 'text-neutral-300' : 'text-neutral-500'}>
              {article.rank_change > 0 ? `↑${article.rank_change}` : `↓${Math.abs(article.rank_change)}`}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

function SectionCard({ 
  section, 
  articles,
  onArticleClick 
}: { 
  section: string
  articles: NewsArticle[]
  onArticleClick: (article: NewsArticle) => void
}) {
  return (
    <div className="bg-neutral-900 rounded-xl border border-neutral-800 overflow-hidden">
      {/* 标题栏 */}
      <div className="px-4 py-3 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1 h-4 bg-white rounded-full" />
          <h2 className="font-medium text-neutral-100">{section}</h2>
        </div>
        <span className="text-xs text-neutral-500 bg-neutral-800 px-2 py-0.5 rounded-full">
          {articles.length}
        </span>
      </div>
      
      {/* 列表 */}
      <div className="divide-y divide-neutral-800/50 max-h-[500px] overflow-y-auto">
        {articles.slice(0, 15).map((article, idx) => (
          <ArticleCard 
            key={article.id} 
            article={article} 
            index={idx}
            onClick={() => onArticleClick(article)}
          />
        ))}
      </div>
    </div>
  )
}

function MergedSectionCard({ 
  articles, 
  sections,
  onArticleClick,
  otherLabel
}: { 
  articles: NewsArticle[]
  sections: string[]
  onArticleClick: (article: NewsArticle) => void
  otherLabel: string
}) {
  return (
    <div className="bg-neutral-900 rounded-xl border border-neutral-800 overflow-hidden">
      {/* 标题栏 */}
      <div className="px-4 py-3 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1 h-4 bg-neutral-400 rounded-full" />
          <h2 className="font-medium text-neutral-100">{otherLabel}</h2>
        </div>
        <span className="text-xs text-neutral-500 bg-neutral-800 px-2 py-0.5 rounded-full">
          {sections.join(' · ')}
        </span>
      </div>
      
      {/* 列表 */}
      <div className="divide-y divide-neutral-800/50 max-h-[500px] overflow-y-auto">
        {articles.slice(0, 15).map((article, idx) => (
          <div key={article.id} className="relative">
            <ArticleCard 
              article={article} 
              index={idx} 
              showRank={false}
              onClick={() => onArticleClick(article)}
            />
            {/* 来源标签 */}
            <span className="absolute top-3 right-3 text-[10px] text-neutral-500 bg-neutral-800 px-1.5 py-0.5 rounded">
              {article.section}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function NewsFeed() {
  const { articles, platforms, selectedPlatform, setSelectedPlatform, t } = useStore()
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null)

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

  // 合并元素少的 section（少于4条的合并到"其他"）
  const MERGE_THRESHOLD = 4
  const smallSections: string[] = []
  const largeSections: string[] = []
  
  platforms.forEach(p => {
    const count = groupedBySection[p]?.length ?? 0
    if (count === 0) return
    if (count < MERGE_THRESHOLD) {
      smallSections.push(p)
    } else {
      largeSections.push(p)
    }
  })

  // 合并小 section 的文章
  const mergedArticles: NewsArticle[] = []
  smallSections.forEach(section => {
    groupedBySection[section]?.forEach(article => {
      mergedArticles.push({ ...article, section })
    })
  })
  // 按热度/排名排序
  mergedArticles.sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999))

  const displaySections = selectedPlatform 
    ? [selectedPlatform] 
    : largeSections

  const totalCount = articles.length

  return (
    <div>
      {/* 筛选栏 */}
      <div className="mb-4 flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setSelectedPlatform(null)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            !selectedPlatform 
              ? 'bg-white text-black' 
              : 'bg-neutral-900 text-neutral-400 hover:bg-neutral-800'
          }`}
        >
          {t.all} ({totalCount})
        </button>
        {platforms.map((section) => (
          <button
            key={section}
            onClick={() => setSelectedPlatform(section)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              selectedPlatform === section 
                ? 'bg-white text-black' 
                : 'bg-neutral-900 text-neutral-400 hover:bg-neutral-800'
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
            onArticleClick={setSelectedArticle}
          />
        ))}
        {/* 合并的小列表 */}
        {!selectedPlatform && mergedArticles.length > 0 && (
          <MergedSectionCard 
            articles={mergedArticles} 
            sections={smallSections}
            onArticleClick={setSelectedArticle}
            otherLabel={t.otherHot}
          />
        )}
      </div>
      
      {displaySections.length === 0 && mergedArticles.length === 0 && (
        <div className="text-center py-20 text-neutral-500">
          <p className="text-4xl mb-4">📭</p>
          <p>{t.noData}</p>
        </div>
      )}

      {/* 溯源弹窗 */}
      <TraceModal 
        article={selectedArticle} 
        onClose={() => setSelectedArticle(null)} 
      />
    </div>
  )
}
