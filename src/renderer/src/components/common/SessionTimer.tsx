import * as React from 'react'
import { useTimer } from '../context/TimeContext'
import { VscDebugStart, VscDebugStop } from 'react-icons/vsc'
import { GrPowerReset } from 'react-icons/gr'
import { useEffect } from 'react'
import Note from '../../types/Note'
import { useNotesContext } from '../context/NotesContext'
import { useSessionGoals } from '../context/SessionGoalsContext'

interface SessionTimerProps {
  pad: string
  displayedNoteDaybook: Note | null
  mostRecentDaybookNote: Note | null
}

const SessionTimer: React.FC<SessionTimerProps> = ({
  pad,
  displayedNoteDaybook,
  mostRecentDaybookNote
}) => {
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
  const { isCurrentDaybookFinished } = useNotesContext()

  const canStartTimer =
    pad === 'daybook' &&
    displayedNoteDaybook?.id === mostRecentDaybookNote?.id &&
    !isCurrentDaybookFinished

  const startSession = (): void => {
    if (canStartTimer) {
      startTimer()
      if (!isBreak) {
        setShowGoalsWindow(true)
      }
    }
  }

  useEffect(() => {
    if (!sessionClockTicking) {
      setShowGoalsWindow(false)
      setShowMovableGoalsWindow(false)
    }
  }, [sessionClockTicking])

  const isButtonDisabled = !canStartTimer || isCurrentDaybookFinished

  return (
    <div className="p-5 mt-5 flex flex-row items-center justify-center space-x-4 rounded-md border-2 border-bright-green">
      <div className="flex items-center justify-center">
        <div className="flex space-x-2 p-2 rounded">
          <button
            onClick={!sessionClockTicking && canStartTimer ? startSession : undefined}
            className={`cursor-pointer bg-transparent p-1 rounded ${
              isButtonDisabled ? 'text-gray-400 cursor-not-allowed' : 'hover:text-bright-green'
            }`}
            disabled={isButtonDisabled}
          >
            <VscDebugStart style={{ fontSize: '24px' }} />
          </button>
          <button
            onClick={sessionClockTicking && !isButtonDisabled ? stopTimer : undefined}
            className={`cursor-pointer bg-transparent p-1 rounded ${
              !sessionClockTicking || isButtonDisabled
                ? 'text-gray-400 cursor-not-allowed'
                : 'hover:text-bright-green'
            }`}
            disabled={!sessionClockTicking || isButtonDisabled}
          >
            <VscDebugStop style={{ fontSize: '24px' }} />
          </button>
          <button
            onClick={sessionInProgress && !isButtonDisabled ? resetTimer : undefined}
            className={`cursor-pointer bg-transparent p-1 rounded ${
              !sessionInProgress || isButtonDisabled
                ? 'text-gray-400 cursor-not-allowed'
                : 'hover:text-bright-green'
            }`}
            disabled={!sessionInProgress || isButtonDisabled}
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
