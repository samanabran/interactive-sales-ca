import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from "react-error-boundary";

import App from './App.tsx'
import { ErrorFallback } from './ErrorFallback.tsx'
import { logger } from './lib/logger';

import "./main.css"
import "./styles/theme.css"
import "./index.css"

logger.info('Application starting', {
  metadata: {
    environment: import.meta.env.VITE_ENVIRONMENT || 'development',
    hasAI: !!(import.meta.env.VITE_OPENAI_API_KEY || import.meta.env.VITE_OLLAMA_BASE_URL),
  }
});

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary FallbackComponent={ErrorFallback}>
    <App />
  </ErrorBoundary>
)
