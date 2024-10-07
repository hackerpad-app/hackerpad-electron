import * as React from 'react'
import { useTimer } from '../context/TimeContext'
import { useSessionGoals } from '../context/SessionGoalsContext'
import { VscDebugStart, VscDebugStop } from 'react-icons/vsc'
import { GrPowerReset } from 'react-icons/gr'
import { useEffect } from 'react'

const SessionTimer: React.FC = () => {
  const {
    time,
    isBreak,
    sessionClockTicking,
    sessionInProgress,
    startTimer,
    stopTimer,
    resetTimer
  } = useTimer()

  const { setShowGoalsWindow, setShowMovableGoalsWindow } = useSessionGoals()

  const startSession = () => {
    startTimer()
    if (!isBreak) {
      setShowGoalsWindow(true)
    }
  }
  useEffect(() => {
    if (!sessionClockTicking) {
      setShowGoalsWindow(false)
      setShowMovableGoalsWindow(false)
    }
  }, [sessionClockTicking])

  return (
    <div className="p-5 mt-5 flex flex-row items-center justify-center space-x-4 rounded-md border-2 border-bright-green">
      <div className="flex items-center justify-center">
        <div className="flex space-x-2 p-2 rounded">
          <button
            onClick={!sessionClockTicking ? startSession : undefined}
            className={`cursor-pointer bg-transparent p-1 rounded ${sessionClockTicking ? 'text-gray-400' : 'hover:text-bright-green'}`}
          >
            <VscDebugStart style={{ fontSize: '24px' }} />
          </button>
          <button
            onClick={sessionClockTicking ? stopTimer : undefined}
            className={`cursor-pointer bg-transparent p-1 rounded ${!sessionClockTicking ? 'text-gray-400' : 'hover:text-bright-green'}`}
          >
            <VscDebugStop style={{ fontSize: '24px' }} />
          </button>
          <button
            onClick={sessionInProgress ? resetTimer : undefined}
            className={`cursor-pointer bg-transparent p-1 rounded ${!sessionInProgress ? 'text-gray-400' : 'hover:text-bright-green'}`}
          >
            <GrPowerReset style={{ fontSize: '24px' }} />
          </button>
        </div>
      </div>
      <div className="text-2xl p-1 rounded font-mono tabular-nums w-20 text-center">
        {String(time.minutes).padStart(2, '0')}:{String(time.seconds).padStart(2, '0')}
      </div>
    </div>
  )
}

export default SessionTimer
