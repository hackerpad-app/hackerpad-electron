import './App.css'

import * as React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

console.log('Main.tsx is running')

const rootElement = document.getElementById('root')
console.log('Root element:', rootElement)

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
  console.log('App rendered')
} else {
  console.error('Root element not found')
}
