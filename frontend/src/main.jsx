import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'

// Aplicar classes iniciais de tema antes de renderizar a aplicação
const initTheme = () => {
  if (localStorage.getItem('darkMode') === 'true') {
    document.documentElement.classList.add('dark')
  }
  if (localStorage.getItem('highContrast') === 'true') {
    document.documentElement.classList.add('high-contrast')
  }
}

initTheme()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
