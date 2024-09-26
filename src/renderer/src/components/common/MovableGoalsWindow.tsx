import React from 'react'
import { useSessionGoals } from '../context/SessionGoalsContext'
import Draggable from 'react-draggable'

const MovableGoalsWindow: React.FC = () => {
  const { goals } = useSessionGoals()

  return (
    <Draggable handle=".handle">
      <div className="fixed top-0 right-0 w-1/4 h-1/3 bg-white p-5 rounded-lg shadow-lg">
        <div className="handle cursor-move bg-gray-200 p-2 rounded-t-lg">
          <h2 className="text-xl font-bold mb-4">Session Goals</h2>
        </div>
        <ul>
          {goals.map((goal, index) => (
            <li key={index}>{goal}</li>
          ))}
        </ul>
      </div>
    </Draggable>
  )
}

export default MovableGoalsWindow
