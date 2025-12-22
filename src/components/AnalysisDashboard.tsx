import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { runAllAnalysis, refreshAnalysis } from '../api'

interface AnalysisResults {
  results: Record<string, string>
  generatedAt: string
}

const TASK_INFO: Record<string, { name: string; icon: string }> = {
  hot_keywords: { name: '热词分析', icon: '🔥' },
  sentiment: { name: '情感分析', icon: '😊' },
  trending: { name: '趋势预测', icon: '📈' },
  summary: { name: '综合摘要', icon: '📋' },
  cross_platform: { name: '跨板块分析', icon: '🔗' }
}

export default function AnalysisDashboard() {
  const [data, setData] = useState<AnalysisResults | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTask, setActiveTask] = useState<string>('summary')

  const loadAnalysis = async (forceRefresh = false) => {
    setIsLoading(true)
    try {
      if (forceRefresh) {
        await refreshAnalysis()
      }
      const result = await runAllAnalysis()
      setData(result)
    } catch (err) {
      console.error('Failed to load analysis:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadAnalysis()
  }, [])

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
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {TASK_INFO[id].icon} {TASK_INFO[id].name}
            </button>
          ))}
        </div>
        <button
          onClick={() => loadAnalysis(true)}
          disabled={isLoading}
          className="px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 rounded-lg text-xs"
        >
          {isLoading ? '分析中...' : '🔄 重新分析'}
        </button>
      </div>

      {/* 内容区 */}
      <div className="bg-gray-800/30 rounded-xl border border-gray-700/50 overflow-hidden">
        <div className="px-4 py-3 bg-gray-800/50 border-b border-gray-700/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">{TASK_INFO[activeTask]?.icon}</span>
            <h2 className="font-medium text-gray-200">{TASK_INFO[activeTask]?.name}</h2>
          </div>
          {data?.generatedAt && (
            <span className="text-xs text-gray-500">生成于 {data.generatedAt}</span>
          )}
        </div>
        
        <div className="p-4 min-h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="flex gap-1 justify-center mb-3">
                  <span className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" />
                  <span className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <span className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
                <p className="text-gray-500">AI 正在分析...</p>
              </div>
            </div>
          ) : data?.results?.[activeTask] ? (
            <div className="prose prose-invert prose-sm max-w-none">
              <ReactMarkdown>{data.results[activeTask]}</ReactMarkdown>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <div className="text-center">
                <p className="text-4xl mb-3">📊</p>
                <p>点击"重新分析"开始</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
