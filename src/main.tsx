import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './app/styles/tailwind.css'
import './app/styles/fonts.css'
import './app/styles/theme.css'
import './app/styles/index.css'
import App from './app/App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
