export type Locale = 'zh' | 'en' | 'ja'

export const locales: { code: Locale; name: string }[] = [
  { code: 'zh', name: '中文' },
  { code: 'en', name: 'English' },
  { code: 'ja', name: '日本語' }
]

export const translations = {
  zh: {
    // 通用
    all: '全部',
    loading: '加载中...',
    noData: '暂无数据',
    refresh: '刷新',
    send: '发送',
    clear: '清空',
    close: '关闭',
    update: '更新',
    
    // 导航
    tabFeed: '📰 数据',
    tabAnalysis: '📊 分析',
    
    // NewsFeed
    otherHot: '其他热点',
    
    // 分析
    hotKeywords: '热词分析',
    sentiment: '情感分析',
    trending: '趋势预测',
    summary: '综合摘要',
    crossPlatform: '跨板块分析',
    reAnalyze: '🔄 重新分析',
    analyzing: '分析中...',
    aiAnalyzing: 'AI 正在分析...',
    clickToAnalyze: '点击"重新分析"开始',
    
    // 聊天
    chatTitle: '💬 舆情问答 (24h)',
    chatPlaceholder: '问我任何问题... ⌘K',
    chatEmpty: '问我任何关于新闻的问题',
    chatEmptyHint: '基于过去24小时数据回答',
    chatError: '抱歉，查询失败，请稍后重试。',
    
    // 溯源
    traceTitle: '🔍 全网溯源分析',
    traceLoading: '正在全网搜索溯源...',
    traceLoadingHint: '这可能需要 10-20 秒',
    traceError: '溯源分析失败，请稍后重试',
    visitOriginal: '访问原文 →',
    source: '来源',
    
    // 溯源模块
    credibility: '可信度评估',
    credibilityHigh: '高可信度',
    credibilityMid: '中可信度', 
    credibilityLow: '低可信度',
    origin: '信息起源',
    originSource: '来源',
    originTime: '时间',
    originType: '类型',
    spreadPath: '传播路径',
    spreadSpeed: '传播速度',
    spreadScope: '影响范围',
    keyPlayers: '关键传播者',
    influence: '影响力',
    timeline: '传播时间线',
    distortion: '信息失真检测',
    hasDistortion: '存在失真',
    noDistortion: '未发现失真',
    relatedLinks: '相关报道'
  },
  en: {
    all: 'All',
    loading: 'Loading...',
    noData: 'No data',
    refresh: 'Refresh',
    send: 'Send',
    clear: 'Clear',
    close: 'Close',
    update: 'Update',
    
    tabFeed: '📰 Feed',
    tabAnalysis: '📊 Analysis',
    
    otherHot: 'Other Hot',
    
    hotKeywords: 'Hot Keywords',
    sentiment: 'Sentiment',
    trending: 'Trending',
    summary: 'Summary',
    crossPlatform: 'Cross Platform',
    reAnalyze: '🔄 Re-analyze',
    analyzing: 'Analyzing...',
    aiAnalyzing: 'AI is analyzing...',
    clickToAnalyze: 'Click "Re-analyze" to start',
    
    chatTitle: '💬 News Q&A (24h)',
    chatPlaceholder: 'Ask me anything... ⌘K',
    chatEmpty: 'Ask me anything about news',
    chatEmptyHint: 'Based on last 24 hours data',
    chatError: 'Sorry, query failed. Please try again.',
    
    traceTitle: '🔍 Source Tracing',
    traceLoading: 'Searching across the web...',
    traceLoadingHint: 'This may take 10-20 seconds',
    traceError: 'Tracing failed, please try again',
    visitOriginal: 'Visit Original →',
    source: 'Source',
    
    credibility: 'Credibility',
    credibilityHigh: 'High',
    credibilityMid: 'Medium',
    credibilityLow: 'Low',
    origin: 'Origin',
    originSource: 'Source',
    originTime: 'Time',
    originType: 'Type',
    spreadPath: 'Spread Path',
    spreadSpeed: 'Speed',
    spreadScope: 'Scope',
    keyPlayers: 'Key Players',
    influence: 'Influence',
    timeline: 'Timeline',
    distortion: 'Distortion Check',
    hasDistortion: 'Distorted',
    noDistortion: 'No distortion',
    relatedLinks: 'Related Links'
  },
  ja: {
    all: 'すべて',
    loading: '読み込み中...',
    noData: 'データなし',
    refresh: '更新',
    send: '送信',
    clear: 'クリア',
    close: '閉じる',
    update: '更新',
    
    tabFeed: '📰 フィード',
    tabAnalysis: '📊 分析',
    
    otherHot: 'その他',
    
    hotKeywords: 'キーワード',
    sentiment: '感情分析',
    trending: 'トレンド',
    summary: 'サマリー',
    crossPlatform: 'クロス分析',
    reAnalyze: '🔄 再分析',
    analyzing: '分析中...',
    aiAnalyzing: 'AI分析中...',
    clickToAnalyze: '「再分析」をクリック',
    
    chatTitle: '💬 ニュースQ&A (24h)',
    chatPlaceholder: '質問してください... ⌘K',
    chatEmpty: 'ニュースについて質問してください',
    chatEmptyHint: '過去24時間のデータに基づく',
    chatError: '申し訳ありません、クエリに失敗しました。',
    
    traceTitle: '🔍 ソース追跡',
    traceLoading: 'ウェブ全体を検索中...',
    traceLoadingHint: '10-20秒かかる場合があります',
    traceError: '追跡に失敗しました',
    visitOriginal: '元記事へ →',
    source: 'ソース',
    
    credibility: '信頼性',
    credibilityHigh: '高',
    credibilityMid: '中',
    credibilityLow: '低',
    origin: '起源',
    originSource: 'ソース',
    originTime: '時間',
    originType: 'タイプ',
    spreadPath: '拡散経路',
    spreadSpeed: '速度',
    spreadScope: '範囲',
    keyPlayers: 'キープレイヤー',
    influence: '影響力',
    timeline: 'タイムライン',
    distortion: '情報歪曲',
    hasDistortion: '歪曲あり',
    noDistortion: '歪曲なし',
    relatedLinks: '関連リンク'
  }
} as const

export type TranslationKey = keyof typeof translations.zh

export function getTranslation(locale: Locale) {
  return translations[locale]
}

// 获取浏览器语言
export function detectLocale(): Locale {
  const saved = localStorage.getItem('locale') as Locale
  if (saved && locales.some(l => l.code === saved)) return saved
  
  const browserLang = navigator.language.toLowerCase()
  if (browserLang.startsWith('zh')) return 'zh'
  if (browserLang.startsWith('ja')) return 'ja'
  return 'en'
}
