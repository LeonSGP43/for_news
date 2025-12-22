import { readFileSync } from 'fs'
import { join } from 'path'

export type Locale = 'zh' | 'en' | 'ja'

// 加载 prompts.json
const promptsPath = join(__dirname, 'prompts.json')
const prompts = JSON.parse(readFileSync(promptsPath, 'utf-8')) as {
  analysis: Record<Locale, string>
  chat: Record<Locale, string>
  trace: Record<Locale, string>
}

export const analysisPrompt = prompts.analysis
export const chatPrompt = prompts.chat
export const tracePromptTemplate = prompts.trace

export function getTracePrompt(locale: Locale, title: string, source: string): string {
  const template = tracePromptTemplate[locale] || tracePromptTemplate.en
  return template.replace('{title}', title).replace('{source}', source)
}

export function getAnalysisPrompt(locale: Locale): string {
  return analysisPrompt[locale] || analysisPrompt.en
}

export function getChatPrompt(locale: Locale): string {
  return chatPrompt[locale] || chatPrompt.en
}
