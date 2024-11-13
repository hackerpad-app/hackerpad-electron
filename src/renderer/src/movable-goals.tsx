import './App.css'
import * as React from 'react'
import ReactDOM from 'react-dom/client'
import MovableGoalsWindow from './components/common/MovableGoalsWindow'
import { TimerProvider } from './components/context/TimeContext'
import { SessionGoalsProvider } from './components/context/SessionGoalsContext'
import { NotesProvider } from './components/context/NotesContext'

const App = () => {
  return (
    <div
      style={{
        background: 'transparent',
        width: 'fit-content',
        height: 'fit-content',
        margin: 0,
        padding: 0,
        overflow: 'hidden'
      }}
    >
      <TimerProvider>
        <NotesProvider pad="daybook">
          <SessionGoalsProvider>
            <MovableGoalsWindow />
          </SessionGoalsProvider>
        </NotesProvider>
      </TimerProvider>
    </div>
  )
}

const rootElement = document.getElementById('root')

if (rootElement) {
  rootElement.style.background = 'transparent'
  rootElement.style.margin = '0'
  rootElement.style.padding = '0'
  rootElement.style.overflow = 'hidden'
  rootElement.style.width = 'fit-content'
  rootElement.style.height = 'fit-content'

  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
}
