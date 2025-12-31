import { useState, useEffect } from 'react'
import { useStore } from '../store'

type PromptType = 'analysis' | 'chat' | 'trace'
type Locale = 'zh' | 'en' | 'ja'

interface Prompts {
  analysis: Record<Locale, string>
  chat: Record<Locale, string>
  trace: Record<Locale, string>
}

const PROMPT_LABELS: Record<PromptType, { icon: string; name: string; desc: string }> = {
  analysis: { icon: '📊', name: 'Analysis', desc: 'News analysis tasks (keywords, sentiment, trending, etc.)' },
  chat: { icon: '💬', name: 'Chat', desc: 'Q&A system prompt' },
  trace: { icon: '🔍', name: 'Trace', desc: 'News source tracing' }
}

const LOCALE_LABELS: Record<Locale, string> = {
  zh: '中文',
  en: 'English', 
  ja: '日本語'
}

export default function PromptEditor() {
  const [prompts, setPrompts] = useState<Prompts | null>(null)
  const [activeType, setActiveType] = useState<PromptType>('analysis')
  const [activeLocale, setActiveLocale] = useState<Locale>('en')
  const [editValue, setEditValue] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const { t } = useStore()

  useEffect(() => {
    fetch('/api/prompts')
      .then(res => res.json())
      .then(data => {
        setPrompts(data)
        setEditValue(data[activeType][activeLocale] || '')
      })
      .catch(err => console.error('Failed to load prompts:', err))
  }, [])

  useEffect(() => {
    if (prompts) {
      setEditValue(prompts[activeType][activeLocale] || '')
    }
  }, [activeType, activeLocale, prompts])

  const handleSave = async () => {
    if (!prompts) return
    
    setIsSaving(true)
    setSaveStatus('idle')
    
    try {
      const res = await fetch(`/api/prompts/${activeType}/${activeLocale}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editValue })
      })
      
      if (res.ok) {
        setPrompts({
          ...prompts,
          [activeType]: {
            ...prompts[activeType],
            [activeLocale]: editValue
          }
        })
        setSaveStatus('success')
        setTimeout(() => setSaveStatus('idle'), 2000)
      } else {
        setSaveStatus('error')
      }
    } catch {
      setSaveStatus('error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    if (prompts) {
      setEditValue(prompts[activeType][activeLocale] || '')
    }
  }

  if (!prompts) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-neutral-500">{t.loading}</p>
      </div>
    )
  }

  const hasChanges = prompts[activeType][activeLocale] !== editValue

  return (
    <div className="space-y-4">
      {/* Prompt 类型选择 */}
      <div className="flex gap-2">
        {(Object.keys(PROMPT_LABELS) as PromptType[]).map(type => (
          <button
            key={type}
            onClick={() => setActiveType(type)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeType === type
                ? 'bg-white text-black'
                : 'bg-neutral-900 text-neutral-400 hover:bg-neutral-800'
            }`}
          >
            {PROMPT_LABELS[type].icon} {PROMPT_LABELS[type].name}
          </button>
        ))}
      </div>

      {/* 描述 */}
      <p className="text-sm text-neutral-500">{PROMPT_LABELS[activeType].desc}</p>

      {/* 语言选择 */}
      <div className="flex gap-2">
        {(Object.keys(LOCALE_LABELS) as Locale[]).map(locale => (
          <button
            key={locale}
            onClick={() => setActiveLocale(locale)}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              activeLocale === locale
                ? 'bg-neutral-700 text-white'
                : 'bg-neutral-900 text-neutral-500 hover:bg-neutral-800'
            }`}
          >
            {LOCALE_LABELS[locale]}
          </button>
        ))}
      </div>

      {/* 编辑器 */}
      <div className="relative">
        <textarea
          value={editValue}
          onChange={e => setEditValue(e.target.value)}
          className="w-full h-96 p-4 bg-neutral-900 border border-neutral-800 rounded-xl text-sm text-neutral-200 font-mono resize-none focus:outline-none focus:border-neutral-600"
          placeholder="Enter prompt..."
        />
        <div className="absolute bottom-3 right-3 text-xs text-neutral-600">
          {editValue.length} chars
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {saveStatus === 'success' && (
            <span className="text-sm text-green-500">✓ Saved</span>
          )}
          {saveStatus === 'error' && (
            <span className="text-sm text-red-500">✗ Save failed</span>
          )}
          {hasChanges && saveStatus === 'idle' && (
            <span className="text-sm text-yellow-500">• Unsaved changes</span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            disabled={!hasChanges}
            className="px-4 py-2 bg-neutral-800 text-neutral-300 hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm"
          >
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || !hasChanges}
            className="px-4 py-2 bg-white text-black hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* 提示 */}
      <div className="p-3 bg-neutral-900/50 border border-neutral-800 rounded-lg">
        <p className="text-xs text-neutral-500">
          💡 Tips: Use <code className="bg-neutral-800 px-1 rounded">{'{title}'}</code> and <code className="bg-neutral-800 px-1 rounded">{'{source}'}</code> as placeholders in trace prompts. Changes take effect immediately after saving.
        </p>
      </div>
    </div>
  )
}
