import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { useStore } from '../store'
import { chat } from '../api'

const EXAMPLE_QUESTIONS = [
  '今天有哪些重大新闻？',
  '微博上最热门的话题是什么？',
  '有没有关于AI的新闻？',
  '各平台的热点有什么共同点？',
  '有哪些负面舆情需要关注？'
]

export default function ChatPanel() {
  const { chatMessages, addChatMessage, chatTimeRange, setChatTimeRange } = useStore()
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  const handleSend = async (question?: string) => {
    const q = question || input.trim()
    if (!q || isLoading) return

    addChatMessage({
      role: 'user',
      content: q,
      timestamp: new Date().toLocaleTimeString('zh-CN')
    })
    setInput('')
    setIsLoading(true)

    try {
      const answer = await chat(q, chatTimeRange)
      addChatMessage({
        role: 'assistant',
        content: answer,
        timestamp: new Date().toLocaleTimeString('zh-CN')
      })
    } catch (err) {
      addChatMessage({
        role: 'assistant',
        content: '抱歉，处理您的问题时出现错误，请稍后重试。',
        timestamp: new Date().toLocaleTimeString('zh-CN')
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-180px)]">
      <div className="lg:col-span-1">
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <h3 className="font-bold text-blue-400 mb-3">时间范围</h3>
          <div className="space-y-2">
            {[1, 3, 6, 12, 24].map((hours) => (
              <button
                key={hours}
                onClick={() => setChatTimeRange(hours)}
                className={`w-full px-3 py-2 rounded text-sm text-left ${
                  chatTimeRange === hours
                    ? 'bg-blue-600'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                过去 {hours} 小时
              </button>
            ))}
          </div>

          <h3 className="font-bold text-blue-400 mt-6 mb-3">示例问题</h3>
          <div className="space-y-2">
            {EXAMPLE_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                disabled={isLoading}
                className="w-full px-3 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 rounded text-sm text-left text-gray-300"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="lg:col-span-3 flex flex-col bg-gray-800 rounded-xl border border-gray-700">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {chatMessages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-400">
              <div className="text-center">
                <p className="text-4xl mb-4">💬</p>
                <p>基于新闻数据的智能问答</p>
                <p className="text-sm mt-2">选择时间范围，然后提问</p>
              </div>
            </div>
          ) : (
            chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-xl px-4 py-3 ${
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
                    <p>{msg.content}</p>
                  )}
                  <p className="text-xs opacity-60 mt-2">{msg.timestamp}</p>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-700 rounded-xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-gray-700">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="输入您的问题..."
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 disabled:opacity-50"
            />
            <button
              onClick={() => handleSend()}
              disabled={isLoading || !input.trim()}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg"
            >
              发送
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
