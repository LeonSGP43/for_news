import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { chat } from '../api'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function GlobalSearch() {
  const [query, setQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [isExpanded, setIsExpanded] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // 快捷键 Cmd/Ctrl + K 聚焦
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
        setIsExpanded(true)
      }
      if (e.key === 'Escape' && isExpanded) {
        setIsExpanded(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isExpanded])

  const handleSend = async () => {
    if (!query.trim() || isLoading) return
    
    const userMessage = query.trim()
    setQuery('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setIsLoading(true)
    setIsExpanded(true)
    
    try {
      const answer = await chat(userMessage, 24)
      setMessages(prev => [...prev, { role: 'assistant', content: answer }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '抱歉，查询失败，请稍后重试。' }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* 聊天面板 - 展开时显示 */}
      {isExpanded && (
        <div className="fixed bottom-20 right-4 w-96 max-h-[60vh] bg-gray-800 border border-gray-600 rounded-xl shadow-2xl z-50 flex flex-col">
          <div className="flex items-center justify-between p-3 border-b border-gray-700">
            <span className="font-medium text-blue-400">💬 舆情问答</span>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-[200px]">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <p>问我任何关于新闻的问题</p>
                <p className="text-xs mt-1">默认查询过去24小时数据</p>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg px-3 py-2 ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-100'
                    }`}
                  >
                    {msg.role === 'assistant' ? (
                      <div className="prose prose-invert prose-sm max-w-none">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-sm">{msg.content}</p>
                    )}
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-700 rounded-lg px-3 py-2">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      )}

      {/* 底部固定输入框 */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 p-3 z-50">
        <div className="max-w-4xl mx-auto flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsExpanded(true)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="问我任何关于新闻的问题... (⌘K)"
            className="flex-1 px-4 py-2.5 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-gray-100 placeholder-gray-500"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !query.trim()}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg"
          >
            发送
          </button>
          {messages.length > 0 && (
            <button
              onClick={() => setMessages([])}
              className="px-3 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm"
              title="清空对话"
            >
              🗑️
            </button>
          )}
        </div>
      </div>
    </>
  )
}
