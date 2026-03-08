import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { inject } from '@vercel/analytics'
import { injectSpeedInsights } from '@vercel/speed-insights'
import { locale } from './i18n'
import { EDITION_TITLE } from './edition-2026'
import './edition-2026-theme.css'
import './index.css'
import App from './App.tsx'

inject()
injectSpeedInsights()

document.documentElement.lang = locale
document.title = EDITION_TITLE

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
