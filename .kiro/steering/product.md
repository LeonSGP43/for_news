# Product Overview

News Monitor (舆情监控平台) - A real-time news aggregation and AI-powered analysis platform.

## Core Features

- **News Feed**: Aggregates news from multiple platforms, displays by rank/heat/trends
- **AI Analysis**: Uses Gemini AI for keyword extraction, sentiment analysis, trend prediction, and cross-platform insights
- **Chat Assistant**: Q&A interface grounded in actual news data to minimize AI hallucinations
- **Webhook Integration**: Receives crawler completion callbacks to trigger auto-analysis
- **i18n Support**: Multi-language UI (Chinese, English, Japanese)

## Design Philosophy

Uses "Context Stuffing" over Vector RAG - feeds all relevant news data directly into Gemini's large context window (up to 1M tokens) for better global understanding of rankings and trends.
