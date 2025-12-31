import { useEffect, useState } from 'react'
import { useStore } from './store'
import { fetchArticles, fetchPlatforms } from './api'
import NewsFeed from './components/NewsFeed'
import AnalysisDashboard from './components/AnalysisDashboard'
import GlobalSearch from './components/GlobalSearch'
import PromptEditor from './components/PromptEditor'
import { locales } from './i18n'

type Tab = 'feed' | 'analysis' | 'prompts'

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('feed')
  const { setArticles, setPlatforms, setLastUpdated, setIsLoading, lastUpdated, isLoading, locale, setLocale, t } = useStore()

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [articles, platforms] = await Promise.all([
        fetchArticles(1),
        fetchPlatforms()
      ])
      setArticles(articles)
      setPlatforms(platforms)
      setLastUpdated(new Date().toLocaleString(locale === 'zh' ? 'zh-CN' : locale === 'ja' ? 'ja-JP' : 'en-US'))
    } catch (err) {
      console.error('Failed to load data:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 60000)
    return () => clearInterval(interval)
  }, [])

  const tabs: { key: Tab; label: string }[] = [
    { key: 'feed', label: t.tabFeed },
    { key: 'analysis', label: t.tabAnalysis },
    { key: 'prompts', label: '⚙️ Prompts' }
  ]

  return (
    <div className="min-h-screen pb-16">
      {/* 主内容区 */}
      <main className="max-w-7xl mx-auto px-4 py-4">
        {activeTab === 'feed' && <NewsFeed />}
        {activeTab === 'analysis' && <AnalysisDashboard />}
        {activeTab === 'prompts' && <PromptEditor />}
      </main>
      
      {/* 底部固定导航栏 */}
      <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-neutral-800 z-50">
        {/* Tab 切换 + 状态 */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-900">
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  activeTab === tab.key
                    ? 'bg-white text-black'
                    : 'bg-neutral-900 text-neutral-400 hover:bg-neutral-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            {/* 语言切换 */}
            <select
              value={locale}
              onChange={(e) => setLocale(e.target.value as typeof locale)}
              className="bg-neutral-900 text-neutral-400 text-xs px-2 py-1 rounded border border-neutral-800 focus:outline-none"
            >
              {locales.map(l => (
                <option key={l.code} value={l.code}>{l.name}</option>
              ))}
            </select>
            
            <span className="text-xs text-neutral-500">
              {isLoading ? t.loading : `${t.update}: ${lastUpdated}`}
            </span>
            <button
              onClick={loadData}
              disabled={isLoading}
              className="p-1.5 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 rounded text-sm"
              title={t.refresh}
            >
              🔄
            </button>
          </div>
        </div>
        
        {/* 聊天输入框 */}
        <GlobalSearch />
      </div>
    </div>
  )
}
