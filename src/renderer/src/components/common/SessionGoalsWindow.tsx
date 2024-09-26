import React, { useState } from 'react'
import { useSessionGoals } from '../context/SessionGoalsContext'

const SessionGoalsWindow: React.FC = () => {
  const { goals, setGoals, showGoalsWindow, transitionToMovableWindow } = useSessionGoals()
  const [newGoal, setNewGoal] = useState('')

  const handleAddGoal = () => {
    if (newGoal.trim()) {
      setGoals([...goals, newGoal])
      setNewGoal('')
    }
  }

  if (!showGoalsWindow) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-5 rounded-lg shadow-lg w-1/3">
        <h2 className="text-xl font-bold mb-4">Session Goals</h2>
        <ul>
          {goals.map((goal, index) => (
            <li key={index}>{goal}</li>
          ))}
        </ul>
        <input
          type="text"
          value={newGoal}
          onChange={(e) => setNewGoal(e.target.value)}
          className="border p-2 rounded w-full mb-2"
        />
        <button onClick={handleAddGoal} className="bg-green-500 text-white p-2 rounded w-full">
          Add Goal
        </button>
        <button onClick={transitionToMovableWindow} className="bg-red-500 text-white p-2 rounded w-full mt-2">
          Let's Go!
        </button>
      </div>
    </div>
  )
}

export default SessionGoalsWindow
