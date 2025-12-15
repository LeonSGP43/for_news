import { create } from 'zustand'
import type { NewsArticle, AnalysisResult, ChatMessage } from './types'

interface AppState {
  articles: NewsArticle[]
  platforms: string[]
  selectedPlatform: string | null
  analysisResults: AnalysisResult[]
  chatMessages: ChatMessage[]
  chatTimeRange: number
  isLoading: boolean
  lastUpdated: string | null
  
  setArticles: (articles: NewsArticle[]) => void
  setPlatforms: (platforms: string[]) => void
  setSelectedPlatform: (platform: string | null) => void
  addAnalysisResult: (result: AnalysisResult) => void
  addChatMessage: (message: ChatMessage) => void
  setChatTimeRange: (hours: number) => void
  setIsLoading: (loading: boolean) => void
  setLastUpdated: (time: string) => void
}

export const useStore = create<AppState>((set) => ({
  articles: [],
  platforms: [],
  selectedPlatform: null,
  analysisResults: [],
  chatMessages: [],
  chatTimeRange: 1,
  isLoading: false,
  lastUpdated: null,

  setArticles: (articles) => set({ articles }),
  setPlatforms: (platforms) => set({ platforms }),
  setSelectedPlatform: (platform) => set({ selectedPlatform: platform }),
  addAnalysisResult: (result) => set((s) => ({ 
    analysisResults: [result, ...s.analysisResults].slice(0, 20) 
  })),
  addChatMessage: (message) => set((s) => ({ 
    chatMessages: [...s.chatMessages, message] 
  })),
  setChatTimeRange: (hours) => set({ chatTimeRange: hours }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setLastUpdated: (time) => set({ lastUpdated: time })
}))
