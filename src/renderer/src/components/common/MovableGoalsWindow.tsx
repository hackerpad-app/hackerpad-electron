import React, { useState, useRef } from 'react'
import Draggable from 'react-draggable'
import { useTimer } from '../context/TimeContext'
import { useSessionGoals } from '../context/SessionGoalsContext'
import { SlArrowRight, SlArrowLeft } from 'react-icons/sl'
import { GiDistraction } from 'react-icons/gi'
import { IoCheckmarkDoneCircleOutline, IoCheckmarkDoneCircleSharp } from 'react-icons/io5'

const LargeGoalsView: React.FC<{ onShrink: () => void }> = ({ onShrink }) => {
  const { goals, toggleGoalStatus } = useSessionGoals()

  return (
    <div className="flex flex-row h-full">
      <div className="flex items-center py-2 px-2">
        <button
          onClick={onShrink}
          className="w-5 h-2 text-bright-green bg-transparent flex items-center justify-center"
          aria-label="Switch to small window"
        >
          <SlArrowRight size={16} />
        </button>
      </div>
      <div className="flex-grow flex items-center justify-center">
        <div className="w-full max-h-full overflow-y-auto pr-2 py-2">
          {goals.length === 0 ? (
            <p className="text-bright-green text-lg text-center">No goals added.</p>
          ) : (
            <div className="space-y-2">
              {goals.map((goal, index) => {
                const goalText =
                  typeof goal === 'string'
                    ? goal
                    : typeof goal === 'object' && 'text' in goal
                      ? goal.text
                      : JSON.stringify(goal)

                return (
                  <div
                    key={index}
                    className="bg-macdonalds-shit bg-opacity-75 rounded-lg p-2 shadow-sm flex items-center justify-between w-full"
                  >
                    <p
                      className="text-black text-lg flex-grow"
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
              })}
            </div>
          )}
        </div>
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
  const nodeRef = useRef(null)

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
    <Draggable handle=".handle" nodeRef={nodeRef}>
      <div
        ref={nodeRef}
        className={`fixed ${
          isLarge
            ? 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1/2 max-h-[80vh]'
            : 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-12'
        } bg-side-window-green rounded-lg shadow-lg z-50 flex flex-col`}
      >
        {isLarge ? (
          <div className="flex flex-col h-full overflow-hidden">
            <div className="flex-grow overflow-auto">
              <LargeGoalsView onShrink={toggleSize} />
            </div>
          </div>
        ) : (
          <div className="flex-grow flex items-center">
            <div className="w-full h-full handle cursor-move rounded-lg flex flex-row items-center justify-between px-2">
              <button
                onClick={toggleSize}
                className="w-6 h-6 text-bright-green bg-transparent flex items-center justify-center"
                aria-label={isLarge ? 'Switch to small window' : 'Switch to large overview'}
              >
                {isLarge ? <SlArrowRight size={16} /> : <SlArrowLeft size={16} />}
              </button>
              <div className="text-sm whitespace-nowrap">
                {String(time.minutes).padStart(2, '0')}:{String(time.seconds).padStart(2, '0')} left
              </div>
              <div className="flex items-center space-x-1">
                <GiDistraction className="text-bright-green opacity-50" size={16} />
                <span className="text-sm font-bold">{distractions.length}</span>
              </div>
              <form onSubmit={handleSubmit} className="flex-grow max-w-[40%]">
                <input
                  type="text"
                  value={currentDistraction}
                  onChange={handleInputChange}
                  placeholder="Distractions.."
                  className="w-full p-1 text-sm rounded bg-white bg-opacity-5"
                />
              </form>
            </div>
          </div>
        )}
      </div>
    </Draggable>
  )
}

export default MovableGoalsWindow
