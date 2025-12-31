# Project Structure

```
├── server/                 # Express backend
│   ├── index.ts           # App entry, middleware, route mounting
│   ├── db.ts              # MySQL connection pool and queries
│   ├── gemini.ts          # Gemini AI client and helpers
│   ├── cache.ts           # Caching utilities
│   ├── i18n.ts            # Server-side translations
│   ├── prompts.json       # AI prompt templates
│   └── routes/            # API route handlers
│       ├── articles.ts    # GET /api/articles, /api/platforms
│       ├── analysis.ts    # POST /api/analysis/run, GET /api/analysis/all
│       ├── chat.ts        # POST /api/chat
│       ├── webhook.ts     # POST /api/webhook/crawl-complete
│       ├── trace.ts       # Request tracing endpoints
│       └── prompts.ts     # Prompt management endpoints
│
├── src/                    # React frontend
│   ├── main.tsx           # React entry point
│   ├── App.tsx            # Root component with tab navigation
│   ├── api.ts             # API client functions
│   ├── store.ts           # Zustand global state
│   ├── types.ts           # TypeScript interfaces
│   ├── i18n.ts            # Client-side translations
│   ├── index.css          # Tailwind imports
│   └── components/
│       ├── NewsFeed.tsx        # News list by platform
│       ├── AnalysisDashboard.tsx # AI analysis results
│       ├── ChatPanel.tsx       # Chat interface
│       ├── GlobalSearch.tsx    # Search input in footer
│       ├── PromptEditor.tsx    # Edit AI prompts
│       └── TraceModal.tsx      # Debug trace viewer
│
├── vite.config.ts          # Vite config with API proxy
├── tailwind.config.js      # Tailwind configuration
├── tsconfig.json           # Frontend TypeScript config
└── tsconfig.node.json      # Node/Vite TypeScript config
```

## Conventions

- Backend routes are modular, one file per resource under `server/routes/`
- Frontend components are flat under `src/components/`
- Types are centralized in `src/types.ts`
- State management via single Zustand store in `src/store.ts`
- API calls abstracted in `src/api.ts`
- Production build outputs to `dist/`, served by Express
