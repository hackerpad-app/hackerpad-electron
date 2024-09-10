import React, { useEffect, useRef, useCallback, useState } from 'react'
import { VscDebugStart, VscDebugStop } from 'react-icons/vsc'
import { GrPowerReset } from 'react-icons/gr'

import { useTimer } from '../context/TimeContext'

import { WORK_SESSION_SECONDS, BREAK_SESSION_SECONDS } from '../../config/timerConfig'

interface SessionTimerProps {}

const SessionTimer: React.FC<SessionTimerProps> = ({}) => {
  const {
    time,
    setTime,
    sessionActive,
    setSessionActive,
    sessionInProgress,
    setSessionInProgress
  } = useTimer()
  const intervalRef = useRef<number | null>(null)
  const [isBreak, setIsBreak] = useState(false)

  const startTimer = useCallback(() => {
    if (!sessionActive) {
      setSessionActive(true)
    } else {
      console.log('2nd condition; start a brand new session')
    }
  }, [sessionInProgress, setSessionInProgress, setSessionActive])

  const stopTimer = useCallback(() => {
    if (sessionActive) {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      setSessionActive(false) // Stop counting down
    }
  }, [sessionActive, setSessionActive])

  const resetTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setSessionInProgress(false)
    setSessionActive(false)
    const newSessionSeconds = isBreak ? BREAK_SESSION_SECONDS : WORK_SESSION_SECONDS
    setTime({
      minutes: Math.floor(newSessionSeconds / 60),
      seconds: newSessionSeconds % 60
    })
  }, [setSessionActive, setSessionInProgress, setTime, isBreak])

  useEffect(() => {
    if (!sessionActive) return

    // Handle tics of the timer (either focus or break)
    const tick = () => {
      setTime((prevTime) => {
        if (prevTime.seconds === 0 && prevTime.minutes === 0) {
          const newIsBreak = !isBreak
          const newSessionSeconds = newIsBreak ? BREAK_SESSION_SECONDS : WORK_SESSION_SECONDS
          setIsBreak(newIsBreak)
          setSessionActive(false)
          return {
            minutes: Math.floor(newSessionSeconds / 60),
            seconds: newSessionSeconds % 60
          }
        } else if (prevTime.seconds === 0) {
          // Decrement the minutes
          return { minutes: prevTime.minutes - 1, seconds: 59 }
        } else {
          // Decrement the seconds
          return { ...prevTime, seconds: prevTime.seconds - 1 }
        }
      })
    }

    intervalRef.current = window.setInterval(tick, 1000)

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [sessionActive, setTime, isBreak, setIsBreak])

  const timerMinutes = time.minutes.toString().padStart(2, '0')
  const timerSeconds = time.seconds.toString().padStart(2, '0')

  return (
    <>
      <div
        style={{
          borderColor: 'rgba(28, 248, 110, 1.0)',
          borderWidth: '2px',
          borderStyle: 'solid',
          zIndex: 0
        }}
        className="p-5 mt-5 space-x-5 flex flex-row items-center justify-center rounded-md"
      >
        <div className="flex justify-center space-x-3 p-59">
          <VscDebugStart
            className={`cursor-pointer ${
              sessionActive ? 'text-gray-400' : 'hover:text-bright-green'
            }`}
            onClick={sessionActive ? undefined : startTimer}
            style={{ fontSize: '24px' }}
          />
          <VscDebugStop
            className={`cursor-pointer ${
              !sessionActive ? 'text-gray-400' : 'hover:text-bright-green'
            }`}
            onClick={sessionActive ? stopTimer : undefined}
            style={{ fontSize: '24px' }}
          />
          <GrPowerReset
            className={`cursor-pointer ${
              !sessionInProgress && !sessionActive ? 'text-gray-400' : 'hover:text-bright-green'
            }`}
            onClick={sessionInProgress || sessionActive ? resetTimer : undefined}
            style={{ fontSize: '24px' }}
          />
        </div>
        <div className="flex items-center justify-center text-4xl text-center h-full">
          <p>
            {timerMinutes}:{timerSeconds}
          </p>
        </div>
      </div>
    </>
  )
}

export default SessionTimer
