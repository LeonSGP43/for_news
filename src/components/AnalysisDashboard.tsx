import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { useStore } from '../store'
import { runAnalysis } from '../api'
import type { AnalysisTask } from '../types'

const ANALYSIS_TASKS: AnalysisTask[] = [
  {
    id: 'hot_keywords',
    name: '🔥 热词分析',
    description: '提取过去一小时的高频关键词和热门话题',
    prompt: '分析以下新闻数据，提取出现频率最高的10个关键词/话题，并简要说明每个话题的热度来源和趋势。'
  },
  {
    id: 'sentiment',
    name: '😊 情感分析',
    description: '分析各平台舆论情感倾向',
    prompt: '对以下新闻进行情感分析，按平台分类统计正面、中性、负面新闻的比例，并指出值得关注的负面舆情。'
  },
  {
    id: 'trending',
    name: '📈 趋势预测',
    description: '识别正在上升的话题和潜在热点',
    prompt: '分析以下新闻数据中的趋势变化（关注 trend、rank_change、momentum 字段），识别正在快速上升的话题，预测未来可能成为热点的内容。'
  },
  {
    id: 'summary',
    name: '📋 综合摘要',
    description: '生成过去一小时的舆情简报',
    prompt: '基于以下新闻数据，生成一份简洁的舆情简报，包括：1) 各平台热点概览 2) 重大事件汇总 3) 值得关注的异常情况。'
  },
  {
    id: 'cross_platform',
    name: '🔗 跨平台分析',
    description: '发现多平台同时关注的话题',
    prompt: '分析以下新闻数据，找出在多个平台同时出现或被讨论的话题，这些通常是真正的热点事件。'
  }
]

export default function AnalysisDashboard() {
  const { analysisResults, addAnalysisResult } = useStore()
  const [runningTask, setRunningTask] = useState<string | null>(null)

  const handleRunTask = async (task: AnalysisTask) => {
    setRunningTask(task.id)
    try {
      const result = await runAnalysis(task.id)
      addAnalysisResult(result)
    } catch (err) {
      console.error('Analysis failed:', err)
    } finally {
      setRunningTask(null)
    }
  }

  const handleRunAll = async () => {
    for (const task of ANALYSIS_TASKS) {
      await handleRunTask(task)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 sticky top-20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-blue-400">分析任务</h2>
            <button
              onClick={handleRunAll}
              disabled={runningTask !== null}
              className="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded text-sm"
            >
              全部运行
            </button>
          </div>
          <div className="space-y-3">
            {ANALYSIS_TASKS.map((task) => (
              <div
                key={task.id}
                className="p-3 bg-gray-750 rounded-lg border border-gray-600"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium">{task.name}</span>
                  <button
                    onClick={() => handleRunTask(task)}
                    disabled={runningTask !== null}
                    className={`px-2 py-1 rounded text-xs ${
                      runningTask === task.id
                        ? 'bg-yellow-600 animate-pulse'
                        : 'bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600'
                    }`}
                  >
                    {runningTask === task.id ? '运行中...' : '运行'}
                  </button>
                </div>
                <p className="text-sm text-gray-400">{task.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="lg:col-span-2">
        <h2 className="text-lg font-bold text-blue-400 mb-4">分析结果</h2>
        {analysisResults.length === 0 ? (
          <div className="bg-gray-800 rounded-xl p-8 border border-gray-700 text-center text-gray-400">
            <p>暂无分析结果</p>
            <p className="text-sm mt-2">点击左侧任务开始分析</p>
          </div>
        ) : (
          <div className="space-y-4">
            {analysisResults.map((result, idx) => (
              <div
                key={`${result.taskId}-${idx}`}
                className="bg-gray-800 rounded-xl p-4 border border-gray-700"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-blue-400">{result.taskName}</h3>
                  <span className="text-xs text-gray-500">{result.generatedAt}</span>
                </div>
                <div className="prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown>{result.content}</ReactMarkdown>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
