import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { installDemoFetch, isDemoMode } from './demo/mockServer'

if (isDemoMode()) {
  installDemoFetch()
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
