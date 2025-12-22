import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { runAllAnalysis, refreshAnalysis } from '../api'
import { useStore } from '../store'

interface AnalysisResults {
  results: Record<string, string>
  generatedAt: string
}

export default function AnalysisDashboard() {
  const [data, setData] = useState<AnalysisResults | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTask, setActiveTask] = useState<string>('summary')
  const { t, locale } = useStore()

  const TASK_INFO: Record<string, { name: string; icon: string }> = {
    hot_keywords: { name: t.hotKeywords, icon: '🔥' },
    sentiment: { name: t.sentiment, icon: '😊' },
    trending: { name: t.trending, icon: '📈' },
    summary: { name: t.summary, icon: '📋' },
    cross_platform: { name: t.crossPlatform, icon: '🔗' }
  }

  const loadAnalysis = async (forceRefresh = false, currentLocale = locale) => {
    setIsLoading(true)
    try {
      if (forceRefresh) {
        await refreshAnalysis(currentLocale)
      }
      const result = await runAllAnalysis(currentLocale)
      setData(result)
    } catch (err) {
      console.error('Failed to load analysis:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // 语言变化时重新加载分析
  useEffect(() => {
    loadAnalysis(true, locale)
  }, [locale])

  const taskIds = Object.keys(TASK_INFO)

  return (
    <div>
      {/* 工具栏 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1 flex-wrap">
          {taskIds.map((id) => (
            <button
              key={id}
              onClick={() => setActiveTask(id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTask === id
                  ? 'bg-white text-black'
                  : 'bg-neutral-900 text-neutral-400 hover:bg-neutral-800'
              }`}
            >
              {TASK_INFO[id].icon} {TASK_INFO[id].name}
            </button>
          ))}
        </div>
        <button
          onClick={() => loadAnalysis(true)}
          disabled={isLoading}
          className="px-3 py-1.5 bg-white text-black hover:bg-neutral-200 disabled:bg-neutral-800 disabled:text-neutral-500 rounded-lg text-xs"
        >
          {isLoading ? t.analyzing : t.reAnalyze}
        </button>
      </div>

      {/* 内容区 */}
      <div className="bg-neutral-900 rounded-xl border border-neutral-800 overflow-hidden">
        <div className="px-4 py-3 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">{TASK_INFO[activeTask]?.icon}</span>
            <h2 className="font-medium text-neutral-100">{TASK_INFO[activeTask]?.name}</h2>
          </div>
          {data?.generatedAt && (
            <span className="text-xs text-neutral-500">{data.generatedAt}</span>
          )}
        </div>
        
        <div className="p-4 min-h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="flex gap-1 justify-center mb-3">
                  <span className="w-3 h-3 bg-neutral-400 rounded-full animate-bounce" />
                  <span className="w-3 h-3 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <span className="w-3 h-3 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
                <p className="text-neutral-500">{t.aiAnalyzing}</p>
              </div>
            </div>
          ) : data?.results?.[activeTask] ? (
            <div className="prose prose-invert prose-sm max-w-none">
              <ReactMarkdown>{data.results[activeTask]}</ReactMarkdown>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-neutral-500">
              <div className="text-center">
                <p className="text-4xl mb-3">📊</p>
                <p>{t.clickToAnalyze}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
