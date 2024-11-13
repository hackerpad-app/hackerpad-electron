import React, { useState, useEffect } from 'react'
import { useSessionGoals } from '../context/SessionGoalsContext'
import { FaPlay } from 'react-icons/fa'
import { useNotesContext } from './../context/NotesContext'

const SessionGoalsWindow: React.FC = () => {
  const { currentSession, addGoal, showGoalsWindow, transitionToMovableWindow, startNewSession } =
    useSessionGoals()
  const [newGoal, setNewGoal] = useState('')
  const { displayedNoteDaybook } = useNotesContext()

  const handleTransition = (): void => {
    transitionToMovableWindow()
    window.electron.ipcRenderer.send('show-goals-window')
  }

  useEffect(() => {
    if (!currentSession) {
      if (displayedNoteDaybook) {
        startNewSession(displayedNoteDaybook.id)
      }
    }
  }, [currentSession, displayedNoteDaybook, startNewSession])

  const handleAddGoal = (e: React.FormEvent): void => {
    e.preventDefault()
    if (newGoal.trim()) {
      addGoal(newGoal.trim())
      setNewGoal('')
    }
  }

  if (!showGoalsWindow) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-session-goals-green rounded-lg shadow-lg w-96 max-w-full">
        <div className="flex justify-between items-center p-4">
          <h2 className="text-xl font-bold">Session Goals</h2>
          <button
            onClick={handleTransition}
            className="text-bright-green bg-transparent p-1 transition-colors"
            aria-label="Start session"
          >
            <FaPlay />
          </button>
        </div>
        <form onSubmit={handleAddGoal} className="px-4 pb-4">
          <input
            type="text"
            value={newGoal}
            onChange={(e) => setNewGoal(e.target.value)}
            placeholder="Tasks..."
            className="w-full p-2 text-lg rounded bg-white bg-opacity-5"
          />
        </form>
        {currentSession && currentSession.goals.length > 0 && (
          <>
            <div className="mx-4 border-t border-gray-300"></div>
            <ul className="p-4 space-y-2 max-h-60 overflow-y-auto">
              {currentSession.goals.map((goal) => (
                <li key={goal.id} className="bg-macdonalds-shit text-black p-2 rounded">
                  {goal.text}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  )
}

export default SessionGoalsWindow
