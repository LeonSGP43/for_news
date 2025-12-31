# Tech Stack & Build System

## Frontend
- React 18 with TypeScript
- Vite for dev server and bundling
- Tailwind CSS for styling
- Zustand for state management
- react-markdown for rendering AI responses

## Backend
- Express.js with TypeScript
- tsx for running TypeScript directly
- mysql2 for database connections
- dotenv for environment configuration

## AI Integration
- Google Gemini API (@google/genai)
- Models: `gemini-3-pro-preview` (deep analysis), `gemini-2.5-flash` (chat)
- Streaming responses with token usage logging

## Database
- MySQL with connection pooling

## Common Commands

```bash
# Install dependencies
npm install

# Development (frontend + backend concurrently)
npm run dev:all

# Frontend only (Vite dev server on :5173)
npm run dev

# Backend only (Express on :3111)
npm run server

# Production build
npm run build

# Preview production build
npm run preview
```

## Environment Variables

Required in `.env`:
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` - MySQL connection
- `GEMINI_API_KEY` - Google AI API key
- `PORT` - Server port (default: 3111)

## Dev Server Proxy

Vite proxies `/api` requests to `http://localhost:3111` during development.
