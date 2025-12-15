import { useEffect, useState } from 'react'
import { useStore } from './store'
import { fetchArticles, fetchPlatforms } from './api'
import NewsFeed from './components/NewsFeed'
import AnalysisDashboard from './components/AnalysisDashboard'
import ChatPanel from './components/ChatPanel'

type Tab = 'feed' | 'analysis' | 'chat'

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('feed')
  const { setArticles, setPlatforms, setLastUpdated, setIsLoading } = useStore()

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [articles, platforms] = await Promise.all([
        fetchArticles(1),
        fetchPlatforms()
      ])
      setArticles(articles)
      setPlatforms(platforms)
      setLastUpdated(new Date().toLocaleString('zh-CN'))
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
    { key: 'feed', label: '📰 数据聚合' },
    { key: 'analysis', label: '📊 智能分析' },
    { key: 'chat', label: '💬 问答助手' }
  ]

  return (
    <div className="min-h-screen">
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-blue-400">🔍 舆情监控平台</h1>
            <div className="flex gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    activeTab === tab.key
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <button
              onClick={loadData}
              className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm"
            >
              🔄 刷新
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'feed' && <NewsFeed />}
        {activeTab === 'analysis' && <AnalysisDashboard />}
        {activeTab === 'chat' && <ChatPanel />}
      </main>
    </div>
  )
}
