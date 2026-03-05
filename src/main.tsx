import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { locale } from './i18n'
import './index.css'
import App from './App.tsx'

document.documentElement.lang = locale

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
