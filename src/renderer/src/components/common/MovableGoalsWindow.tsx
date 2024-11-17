import * as React from 'react'
import { useState, useEffect } from 'react'
import { useTimer } from '../context/TimeContext'
import { useSessionGoals } from '../context/SessionGoalsContext'
import { SlArrowRight, SlArrowLeft } from 'react-icons/sl'
import { GiDistraction } from 'react-icons/gi'
import { IoCheckmarkDoneCircleOutline, IoCheckmarkDoneCircleSharp } from 'react-icons/io5'
import dingSound from '../../assets/ding.mp3'

const LargeGoalsView: React.FC<{ onShrink: () => void; goalWidth: string }> = ({
  onShrink,
  goalWidth
}) => {
  const { currentSession } = useSessionGoals()
  // Create a map to track seen IDs
  const seenIds = new Set<string>()

  // Filter out duplicates while maintaining order
  const uniqueGoals =
    currentSession?.goals.filter((goal) => {
      if (seenIds.has(goal.id)) {
        console.warn('Duplicate goal ID detected:', goal.id)
        return false
      }
      seenIds.add(goal.id)
      return true
    }) || []

  const handleGoalToggle = (goalId: string): void => {
    try {
      const goal = currentSession?.goals.find((g) => g.id === goalId)

      if (goal && !goal.finished) {
        const audio = new Audio(dingSound)
        audio.volume = 1.0
        audio.play().catch((error) => alert('Sound error: ' + error))
      }

      window.electron.ipcRenderer.send('update-goals-state', {
        type: 'change-goal-status',
        goalId: goalId
      })
    } catch (error) {
      alert('Error: ' + error)
    }
  }

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
        <div
          className="w-full max-h-full overflow-y-auto pr-2 py-2"
          style={{ minWidth: goalWidth }}
        >
          {!currentSession || uniqueGoals.length === 0 ? (
            <p className="text-bright-green text-lg text-center">No goals added.</p>
          ) : (
            <div className="space-y-1">
              {uniqueGoals.map((goal) => (
                <div
                  key={goal.id}
                  className="bg-macdonalds-shit bg-opacity-75 rounded-lg p-1 shadow-sm flex items-center justify-between w-full"
                >
                  <p
                    className="text-black text-lg flex-grow"
                    style={{
                      textDecorationLine: goal.finished ? 'line-through' : 'none',
                      textDecorationColor: 'currentColor',
                      textDecorationThickness: '1px'
                    }}
                  >
                    {goal.text}
                  </p>
                  <button
                    onClick={() => handleGoalToggle(goal.id)}
                    className="ml-3 bg-transparent text-bright-green hover:text-green-600 transition-colors duration-200"
                  >
                    {goal.finished ? (
                      <IoCheckmarkDoneCircleSharp size={24} />
                    ) : (
                      <IoCheckmarkDoneCircleOutline size={24} />
                    )}
                  </button>
                </div>
              ))}
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
  const { currentSession, setCurrentSession } = useSessionGoals()

  useEffect(() => {
    // On the event of a goals state update, update the list of goals

    window.electron.ipcRenderer.on('goals-state-update', (data: any) => {
      console.log('Received goals state update:', data)

      if (data.distractions) setDistractions(data.distractions)
      if (data.goals && currentSession) {
        console.log('Updating existing session with goals:', data.goals)
        const updatedSession = {
          ...currentSession,
          goals: data.goals
        }
        setCurrentSession(updatedSession)
      } else if (data.goals && !currentSession) {
        console.log('Creating new session with goals:', data.goals)
        setCurrentSession({
          id: 'temp-id',
          noteId: 'temp-note-id',
          startTime: new Date().toISOString(),
          endTime: null,
          goals: data.goals,
          distractions: data.distractions || []
        })
      }
    })

    // Request initial state when component mounts
    window.electron.ipcRenderer.send('request-goals-state')
  }, [currentSession?.goals, distractions])

  const toggleSize = (): void => {
    setIsLarge(!isLarge)
    window.electron.ipcRenderer.send('change-goals-window-size', !isLarge)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setCurrentDistraction(e.target.value)
  }

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()
    if (currentDistraction.trim()) {
      const newDistraction = currentDistraction.trim()
      setDistractions([...distractions, newDistraction])
      window.electron.ipcRenderer.send('update-goals-state', {
        type: 'add-distraction',
        distraction: newDistraction
      })
      setCurrentDistraction('')
    }
  }

  const maxGoalLength =
    currentSession?.goals.reduce((max, goal) => Math.max(max, goal.text.length), 0) || 0
  const goalWidth = maxGoalLength > 0 ? `${Math.max(maxGoalLength * 10 + 20, 300)}px` : '300px'

  return (
    <div
      style={{ WebkitAppRegion: 'drag' }}
      className={`${
        isLarge ? `w-[${goalWidth}]` : 'w-96 h-12'
      } bg-side-window-green rounded-lg shadow-lg z-50 flex flex-col`}
    >
      {isLarge ? (
        <div className="flex flex-col h-full overflow-hidden">
          <div className="flex-grow overflow-auto">
            <LargeGoalsView onShrink={toggleSize} goalWidth={goalWidth} />
          </div>
        </div>
      ) : (
        <div className="flex-grow flex items-center">
          <div className="w-full h-full flex flex-row items-center justify-between px-2">
            <button
              style={{ WebkitAppRegion: 'no-drag' }}
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
            <form
              onSubmit={handleSubmit}
              className="flex-grow max-w-[40%]"
              style={{ WebkitAppRegion: 'no-drag' }}
            >
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
  )
}

export default MovableGoalsWindow
