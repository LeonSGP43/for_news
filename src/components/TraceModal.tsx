import { useState, useEffect } from 'react'
import type { NewsArticle } from '../types'
import { useStore } from '../store'

interface TraceResult {
  summary: string
  credibility: {
    score: number
    level: string
    reason: string
  }
  origin: {
    source: string
    time: string
    type: string
    detail: string
  }
  spread: {
    path: string[]
    speed: string
    scope: string
    detail: string
  }
  keyPlayers: Array<{
    name: string
    role: string
    influence: string
  }>
  timeline: Array<{
    time: string
    event: string
  }>
  distortion: {
    hasDistortion: boolean
    level: string
    examples: string[]
  }
  relatedLinks: Array<{
    title: string
    url: string
  }>
}

interface Props {
  article: NewsArticle | null
  onClose: () => void
}

function ScoreRing({ score }: { score: number }) {
  const percentage = score * 10
  const color = score >= 7 ? '#22c55e' : score >= 4 ? '#eab308' : '#ef4444'
  
  return (
    <div className="relative w-16 h-16">
      <svg className="w-full h-full -rotate-90">
        <circle cx="32" cy="32" r="28" fill="none" stroke="#333" strokeWidth="4" />
        <circle 
          cx="32" cy="32" r="28" fill="none" 
          stroke={color} strokeWidth="4"
          strokeDasharray={`${percentage * 1.76} 176`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold" style={{ color }}>{score}</span>
      </div>
    </div>
  )
}

function Card({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="bg-neutral-800/50 rounded-xl p-4 border border-neutral-700/50">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base">{icon}</span>
        <h3 className="text-sm font-medium text-neutral-200">{title}</h3>
      </div>
      {children}
    </div>
  )
}

function Tag({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'default' | 'success' | 'warning' | 'error' }) {
  const colors = {
    default: 'bg-neutral-700 text-neutral-300',
    success: 'bg-green-900/50 text-green-400 border border-green-800',
    warning: 'bg-yellow-900/50 text-yellow-400 border border-yellow-800',
    error: 'bg-red-900/50 text-red-400 border border-red-800'
  }
  return (
    <span className={`px-2 py-0.5 rounded text-xs ${colors[variant]}`}>
      {children}
    </span>
  )
}

export default function TraceModal({ article, onClose }: Props) {
  const [result, setResult] = useState<TraceResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { locale, t } = useStore()

  useEffect(() => {
    if (!article) return
    
    setResult(null)
    setError(null)
    setIsLoading(true)
    
    fetch('/api/trace', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: article.title,
        link: article.link,
        source: article.source || article.section,
        locale
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error)
        } else {
          setResult(data)
        }
      })
      .catch(() => setError(t.traceError))
      .finally(() => setIsLoading(false))
  }, [article, locale, t])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  if (!article) return null

  const getCredibilityVariant = (level: string) => {
    if (['高', 'High', '高'].includes(level)) return 'success'
    if (['中', 'Medium', '中'].includes(level)) return 'warning'
    return 'error'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      
      <div 
        className="relative w-full max-w-4xl max-h-[90vh] bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* 头部 */}
        <div className="flex items-start justify-between p-5 border-b border-neutral-800 bg-neutral-900/80">
          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-neutral-500 bg-neutral-800 px-2 py-0.5 rounded">{article.section}</span>
              <span className="text-sm font-medium text-neutral-300">{t.traceTitle}</span>
            </div>
            <h2 className="text-lg font-medium text-white leading-snug">{article.title}</h2>
            {result?.summary && (
              <p className="text-sm text-neutral-400 mt-2">{result.summary}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* 内容区 */}
        <div className="flex-1 overflow-y-auto p-5">
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="flex gap-1.5 justify-center mb-4">
                  <span className="w-3 h-3 bg-white rounded-full animate-bounce" />
                  <span className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <span className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
                <p className="text-neutral-400">{t.traceLoading}</p>
                <p className="text-xs text-neutral-600 mt-1">{t.traceLoadingHint}</p>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <p className="text-4xl mb-3">😵</p>
                <p className="text-neutral-400">{error}</p>
              </div>
            </div>
          )}

          {result && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 可信度评估 */}
              <Card title={t.credibility} icon="🎯">
                <div className="flex items-center gap-4">
                  <ScoreRing score={result.credibility.score} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Tag variant={getCredibilityVariant(result.credibility.level)}>
                        {result.credibility.level}
                      </Tag>
                    </div>
                    <p className="text-xs text-neutral-400">{result.credibility.reason}</p>
                  </div>
                </div>
              </Card>

              {/* 信息起源 */}
              <Card title={t.origin} icon="📍">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-neutral-500">{t.originSource}</span>
                    <span className="text-sm text-neutral-200">{result.origin.source}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-neutral-500">{t.originTime}</span>
                    <span className="text-sm text-neutral-200">{result.origin.time}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-neutral-500">{t.originType}</span>
                    <Tag>{result.origin.type}</Tag>
                  </div>
                  <p className="text-xs text-neutral-400 pt-1 border-t border-neutral-700/50">{result.origin.detail}</p>
                </div>
              </Card>

              {/* 传播路径 */}
              <Card title={t.spreadPath} icon="🌐">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    {result.spread.path.map((p, i) => (
                      <div key={i} className="flex items-center gap-1">
                        <Tag>{p}</Tag>
                        {i < result.spread.path.length - 1 && <span className="text-neutral-600">→</span>}
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-4 text-xs">
                    <div>
                      <span className="text-neutral-500">{t.spreadSpeed}：</span>
                      <span className="text-neutral-300">{result.spread.speed}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500">{t.spreadScope}：</span>
                      <span className="text-neutral-300">{result.spread.scope}</span>
                    </div>
                  </div>
                  <p className="text-xs text-neutral-400">{result.spread.detail}</p>
                </div>
              </Card>

              {/* 关键传播者 */}
              <Card title={t.keyPlayers} icon="👥">
                <div className="space-y-2">
                  {result.keyPlayers.length > 0 ? result.keyPlayers.map((player, i) => (
                    <div key={i} className="flex items-center justify-between py-1.5 border-b border-neutral-700/30 last:border-0">
                      <span className="text-sm text-neutral-200">{player.name}</span>
                      <div className="flex items-center gap-2">
                        <Tag>{player.role}</Tag>
                        <span className="text-xs text-neutral-400">
                          {player.influence} {t.influence}
                        </span>
                      </div>
                    </div>
                  )) : (
                    <p className="text-xs text-neutral-500">{t.noData}</p>
                  )}
                </div>
              </Card>

              {/* 时间线 */}
              <Card title={t.timeline} icon="⏱️">
                <div className="space-y-3">
                  {result.timeline.length > 0 ? result.timeline.map((item, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-2 h-2 rounded-full bg-white" />
                        {i < result.timeline.length - 1 && <div className="w-px flex-1 bg-neutral-700 mt-1" />}
                      </div>
                      <div className="flex-1 pb-2">
                        <p className="text-xs text-neutral-500">{item.time}</p>
                        <p className="text-sm text-neutral-200">{item.event}</p>
                      </div>
                    </div>
                  )) : (
                    <p className="text-xs text-neutral-500">{t.noData}</p>
                  )}
                </div>
              </Card>

              {/* 信息失真 */}
              <Card title={t.distortion} icon="⚠️">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Tag variant={result.distortion.hasDistortion ? 'error' : 'success'}>
                      {result.distortion.hasDistortion ? t.hasDistortion : t.noDistortion}
                    </Tag>
                    {result.distortion.hasDistortion && (
                      <span className="text-xs text-neutral-400">{result.distortion.level}</span>
                    )}
                  </div>
                  {result.distortion.examples.length > 0 && (
                    <ul className="space-y-1 mt-2">
                      {result.distortion.examples.map((ex, i) => (
                        <li key={i} className="text-xs text-neutral-400 flex items-start gap-2">
                          <span className="text-red-400">•</span>
                          {ex}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </Card>

              {/* 相关链接 */}
              {result.relatedLinks.length > 0 && (
                <Card title={t.relatedLinks} icon="🔗">
                  <div className="space-y-2">
                    {result.relatedLinks.map((link, i) => (
                      <a
                        key={i}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-sm text-neutral-300 hover:text-white truncate"
                      >
                        {link.title} →
                      </a>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          )}
        </div>

        {/* 底部 */}
        <div className="flex items-center justify-between p-4 border-t border-neutral-800 bg-neutral-900/80">
          <span className="text-xs text-neutral-500">
            {article.source && `${t.source}: ${article.source}`}
          </span>
          <a
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-white text-black hover:bg-neutral-200 rounded-lg text-sm font-medium transition-colors"
          >
            {t.visitOriginal}
          </a>
        </div>
      </div>
    </div>
  )
}
