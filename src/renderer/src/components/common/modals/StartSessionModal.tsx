import React, { useState } from 'react'
import { FaPlay } from 'react-icons/fa'
import { useSession } from '../../context/SessionContext'

const StartSessionModal: React.FC = () => {
  const {  setShowStartSessionModal, currentSessionId } = useSession()
  const [newGoal, setNewGoal] = useState('')
  const [goals, setGoals] = useState<{ text: string }[]>([])

  const handleAddGoal = (e: React.FormEvent): void => {
    e.preventDefault()
    if (newGoal.trim()) {
      setGoals([...goals, { text: newGoal.trim() }])
      setNewGoal('')
    }
  }

  const handleStartSession = async (): Promise<void> => {
    try {
      // Add goals to the database
      await Promise.all(
        goals.map(goal => 
          window.electron.ipcRenderer.send('update-goals-state', {
            type: 'add-goal',
            goal: {
              session_id: currentSessionId,
              name: goal.text,
              is_completed: false
            }
          })
        )
      )

      // Close modal and show movable window
      setShowStartSessionModal(false)
      window.electron.ipcRenderer.send('show-goals-window', true)
    } catch (error) {
      console.error('Failed to start session:', error)
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-session-goals-green rounded-lg shadow-lg w-96 max-w-full">
        <div className="flex justify-between items-center p-4">
          <h2 className="text-xl font-bold">Session Goals</h2>
          <button
            onClick={handleStartSession}
            className="text-bright-green bg-transparent p-1 transition-colors"
            aria-label="Start session"
            disabled={goals.length === 0}
          >
            <FaPlay />
          </button>
        </div>
        <form onSubmit={handleAddGoal} className="px-4 pb-4">
          <input
            type="text"
            value={newGoal}
            onChange={(e) => setNewGoal(e.target.value)}
            placeholder="Add a goal..."
            className="w-full p-2 text-lg rounded bg-white bg-opacity-5"
          />
        </form>
        {goals.length > 0 && (
          <>
            <div className="mx-4 border-t border-gray-300"></div>
            <ul className="p-4 space-y-2 max-h-60 overflow-y-auto">
              {goals.map((goal, index) => (
                <li key={index} className="bg-macdonalds-shit text-black p-2 rounded">
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

export default StartSessionModal
