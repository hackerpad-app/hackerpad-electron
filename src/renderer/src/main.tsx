import './App.css'
import * as React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import GoalsRoute from './routes/goals'

const rootElement = document.getElementById('root')

if (rootElement) {
  // Get the route from the URL hash
  const route = window.location.hash.slice(1)

  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>{route === '/goals' ? <GoalsRoute /> : <App />}</React.StrictMode>
  )
  console.log('App rendered')
} else {
  console.error('Root element not found')
}
