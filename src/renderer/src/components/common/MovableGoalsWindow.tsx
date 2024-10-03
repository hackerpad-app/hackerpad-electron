import React, { useState } from 'react'
import Draggable from 'react-draggable'
import { useTimer } from '../context/TimeContext'
import { useSessionGoals } from '../context/SessionGoalsContext'
import { SlArrowRight, SlArrowLeft } from 'react-icons/sl'
import { GiDistraction } from 'react-icons/gi'
import { IoCheckmarkDoneCircleOutline, IoCheckmarkDoneCircleSharp } from 'react-icons/io5'

// Updated LargeGoalsView component
const LargeGoalsView: React.FC<{ onShrink: () => void }> = ({ onShrink }) => {
  const { goals, toggleGoalStatus } = useSessionGoals()

  console.log('Goals in LargeGoalsView:', goals) // Debugging log

  return (
    <div className="flex flex-row h-full">
      <div className="flex-grow overflow-auto pr-4">
        {goals.length === 0 ? (
          <p className="text-bright-green text-lg">No goals added yet.</p>
        ) : (
          goals.map((goal, index) => {
            const goalText =
              typeof goal === 'string'
                ? goal
                : typeof goal === 'object' && 'text' in goal
                  ? goal.text
                  : JSON.stringify(goal)

            return (
              <div
                key={index}
                className="bg-green-800 bg-opacity-75 rounded-lg p-4 mb-3 shadow-sm flex items-center justify-between"
              >
                <p
                  className="text-bright-green text-lg flex-grow"
                  style={{
                    textDecorationLine: goal.finished ? 'line-through' : 'none',
                    textDecorationColor: 'currentColor',
                    textDecorationThickness: '1px'
                  }}
                >
                  {goalText}
                </p>
                <button
                  onClick={() => toggleGoalStatus(index)}
                  className="ml-3 bg-transparent text-bright-green hover:text-green-600 transition-colors duration-200"
                >
                  {goal.finished ? (
                    <IoCheckmarkDoneCircleSharp size={24} />
                  ) : (
                    <IoCheckmarkDoneCircleOutline size={24} />
                  )}
                </button>
              </div>
            )
          })
        )}
      </div>
      <div className="flex items-center p-3">
        <button
          onClick={onShrink}
          className="w-10 h-10 text-bright-green bg-transparent flex items-center justify-center hover:bg-bright-green hover:text-white rounded-full transition-colors duration-200"
          aria-label="Switch to small window"
        >
          <SlArrowRight size={24} />
        </button>
      </div>
    </div>
  )
}

const MovableGoalsWindow: React.FC = () => {
  const [isLarge, setIsLarge] = useState(false)
  const [distractions, setDistractions] = useState<string[]>([])
  const [currentDistraction, setCurrentDistraction] = useState('')
  const { time } = useTimer()
  const { addGoal } = useSessionGoals()

  const toggleSize = () => setIsLarge(!isLarge)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentDistraction(e.target.value)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (currentDistraction.trim()) {
      setDistractions([...distractions, currentDistraction.trim()])
      addGoal(currentDistraction.trim())
      setCurrentDistraction('')
    }
  }

  return (
    <Draggable handle=".handle">
      <div
        className={`fixed top-2 right-1 ${isLarge ? 'w-1/2 h-2/3' : 'w-1/4 h-1/8'} bg-green-800 bg-opacity-75 p-5 rounded-lg shadow-lg z-50 flex flex-col`}
      >
        {isLarge ? (
          <LargeGoalsView onShrink={toggleSize} />
        ) : (
          <>
            <div className="border-white border-2 handle cursor-move p-2 rounded-t-lg mb-4 flex flex-row items-center space-x-4 justify-between">
              <button
                onClick={toggleSize}
                className="w-8 h-8 text-bright-green bg-transparent flex items-center justify-center"
                aria-label={isLarge ? 'Switch to small window' : 'Switch to large overview'}
              >
                {isLarge ? <SlArrowRight /> : <SlArrowLeft />}
              </button>
              <div className="text-xl font-bold">
                {String(time.minutes).padStart(2, '0')}:{String(time.seconds).padStart(2, '0')}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  className="w-8 h-8 text-bright-green bg-transparent focus:outline-none flex items-center justify-center opacity-50 cursor-not-allowed"
                  aria-label="Distractions"
                  disabled
                >
                  <GiDistraction />
                </button>
                <span className="font-bold">{distractions.length}</span>
              </div>
              <form onSubmit={handleSubmit} className="flex-grow">
                <input
                  type="text"
                  value={currentDistraction}
                  onChange={handleInputChange}
                  placeholder="Distractions.."
                  className="w-full p-2 rounded bg-white bg-opacity-50"
                />
              </form>
            </div>
          </>
        )}
      </div>
    </Draggable>
  )
}

export default MovableGoalsWindow
