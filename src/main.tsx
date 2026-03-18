import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Self-XSS security warning
if (import.meta.env.PROD) {
  console.log(
    '%cSTOP!',
    'color: #ff0000; font-size: 40px; font-weight: bold;'
  )
  console.log(
    '%cThis is a browser feature intended for developers. If someone told you to copy-paste something here to enable a Vimars feature or "hack" an account, it is a scam and will give them access to your Vimars account.',
    'color: #ff4500; font-size: 14px;'
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
