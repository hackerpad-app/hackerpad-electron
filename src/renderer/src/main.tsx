import './App.css'

import * as React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

const rootElement = document.getElementById('root')

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
