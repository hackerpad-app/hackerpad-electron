import React, { useEffect } from 'react'
import { useSessionGoals } from '../context/SessionGoalsContext'

const MovableGoalsWindow: React.FC = () => {
  const { goals, showMovableGoalsWindow } = useSessionGoals()

  useEffect(() => {
    if (showMovableGoalsWindow) {
      window.electron.ipcRenderer.send('open-movable-goals-window', goals)
    }
  }, [showMovableGoalsWindow, goals])

  return null
}

export default MovableGoalsWindow
