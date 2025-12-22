export type Locale = 'zh' | 'en' | 'ja'

// 溯源分析 prompt
export const tracePromptTemplate: Record<Locale, string> = {
  zh: `分析这条新闻的溯源信息。请用中文回答。

新闻：{title}
平台：{source}

返回以下JSON结构（只返回JSON，不要其他文字）：
{"summary":"一句话总结(15字)","credibility":{"score":7,"level":"中","reason":"判断理由(20字)"},"origin":{"source":"最早来源","time":"首发时间","type":"官方/媒体/网友","detail":"说明(30字)"},"spread":{"path":["微博","知乎"],"speed":"快速/中等/缓慢","scope":"全网热议/局部传播/小范围讨论","detail":"说明(30字)"},"keyPlayers":[{"name":"传播者","role":"首发/转发/评论","influence":"高/中/低"}],"timeline":[{"time":"12月20日","event":"事件(15字)"}],"distortion":{"hasDistortion":false,"level":"严重/轻微/无","examples":[]},"relatedLinks":[]}`,

  en: `Analyze the source of this news. Please respond in English.

News: {title}
Platform: {source}

Return the following JSON structure (return JSON only, no other text):
{"summary":"One sentence summary (15 words)","credibility":{"score":7,"level":"Medium","reason":"Reason (20 words)"},"origin":{"source":"Original source","time":"First published time","type":"Official/Media/User","detail":"Detail (30 words)"},"spread":{"path":["Twitter","Reddit"],"speed":"Fast/Medium/Slow","scope":"Viral/Regional/Limited","detail":"Detail (30 words)"},"keyPlayers":[{"name":"Player name","role":"Original/Repost/Comment","influence":"High/Medium/Low"}],"timeline":[{"time":"Dec 20","event":"Event (15 words)"}],"distortion":{"hasDistortion":false,"level":"Severe/Mild/None","examples":[]},"relatedLinks":[]}`,

  ja: `このニュースのソースを分析してください。日本語で回答してください。

ニュース：{title}
プラットフォーム：{source}

以下のJSON構造を返してください（JSONのみ、他のテキストなし）：
{"summary":"一文要約(15文字)","credibility":{"score":7,"level":"中","reason":"理由(20文字)"},"origin":{"source":"最初のソース","time":"初出時間","type":"公式/メディア/ユーザー","detail":"説明(30文字)"},"spread":{"path":["Twitter","Yahoo"],"speed":"速い/普通/遅い","scope":"全国的/地域的/限定的","detail":"説明(30文字)"},"keyPlayers":[{"name":"名前","role":"発信/転載/コメント","influence":"高/中/低"}],"timeline":[{"time":"12月20日","event":"イベント(15文字)"}],"distortion":{"hasDistortion":false,"level":"深刻/軽微/なし","examples":[]},"relatedLinks":[]}`
}

// 聊天系统 prompt
export const chatPrompt: Record<Locale, string> = {
  zh: `你是舆情分析助手。基于提供的新闻数据回答问题。
规则：1.只基于数据回答,不编造 2.无相关信息时明确说明 3.引用时提供标题 4.用中文回答 5.简洁有条理
数据字段：t=标题,d=描述,r=排名(数字越小越热),s=板块/平台`,

  en: `You are a news analysis assistant. Answer questions based on the provided news data.
Rules: 1.Only answer based on data, don't make up 2.Clearly state when no relevant info 3.Provide titles when citing 4.Answer in English 5.Be concise
Data fields: t=title,d=description,r=rank(lower=hotter),s=section/platform`,

  ja: `あなたはニュース分析アシスタントです。提供されたニュースデータに基づいて質問に答えてください。
ルール：1.データに基づいてのみ回答 2.関連情報がない場合は明示 3.引用時はタイトルを提供 4.日本語で回答 5.簡潔に
データフィールド：t=タイトル,d=説明,r=ランク(小さいほど人気),s=セクション`
}

// 分析任务 prompt
export const analysisPrompt: Record<Locale, Record<string, string>> = {
  zh: {
    hot_keywords: '分析以下新闻数据中的热门关键词和话题，用中文回答：',
    sentiment: '分析以下新闻数据的整体情感倾向，用中文回答：',
    trending: '基于以下新闻数据预测趋势走向，用中文回答：',
    summary: '为以下新闻数据生成综合摘要，用中文回答：',
    cross_platform: '对以下新闻数据进行跨平台对比分析，用中文回答：'
  },
  en: {
    hot_keywords: 'Analyze hot keywords and topics in the following news data. Answer in English:',
    sentiment: 'Analyze the overall sentiment of the following news data. Answer in English:',
    trending: 'Predict trends based on the following news data. Answer in English:',
    summary: 'Generate a comprehensive summary for the following news data. Answer in English:',
    cross_platform: 'Perform cross-platform comparison analysis on the following news data. Answer in English:'
  },
  ja: {
    hot_keywords: '以下のニュースデータのホットキーワードとトピックを分析してください。日本語で回答：',
    sentiment: '以下のニュースデータの全体的な感情を分析してください。日本語で回答：',
    trending: '以下のニュースデータに基づいてトレンドを予測してください。日本語で回答：',
    summary: '以下のニュースデータの総合サマリーを生成してください。日本語で回答：',
    cross_platform: '以下のニュースデータのクロスプラットフォーム比較分析を行ってください。日本語で回答：'
  }
}

export function getTracePrompt(locale: Locale, title: string, source: string): string {
  const template = tracePromptTemplate[locale] || tracePromptTemplate.zh
  return template.replace('{title}', title).replace('{source}', source)
}
