import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'

import * as React from 'react'
import { WORK_SESSION_SECONDS, BREAK_SESSION_SECONDS } from '../../config/timerConfig'

interface Time {
  minutes: number
  seconds: number
}

interface TimerContextType {
  time: Time
  sessionClockTicking: boolean
  sessionInProgress: boolean
  isBreak: boolean
  startTimer: () => void
  stopTimer: () => void
  resetTimer: () => void
}

const TimerContext = createContext<TimerContextType | undefined>(undefined)

export const useTimer = (): TimerContextType => {
  const context = useContext(TimerContext)
  if (context === undefined) {
    throw new Error('useTimer must be used within a TimerProvider')
  }
  return context
}

export const TimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [time, setTime] = useState<Time>({
    minutes: Math.floor(WORK_SESSION_SECONDS / 60),
    seconds: WORK_SESSION_SECONDS % 60
  })
  const [sessionClockTicking, setSessionClockTicking] = useState(false)
  const [sessionInProgress, setSessionInProgress] = useState(false)
  const [isBreak, setIsBreak] = useState(false)
  const intervalRef = useRef<number | null>(null)

  const startTimer = useCallback(() => {
    setSessionClockTicking(true)
    setSessionInProgress(true)
  }, [])

  const stopTimer = useCallback(() => {
    setSessionClockTicking(false)
  }, [])

  const resetTimer = useCallback(() => {
    setSessionClockTicking(false)
    setSessionInProgress(false)
    const newSessionSeconds = isBreak ? BREAK_SESSION_SECONDS : WORK_SESSION_SECONDS
    setTime({
      minutes: Math.floor(newSessionSeconds / 60),
      seconds: newSessionSeconds % 60
    })
    setIsBreak(false)
  }, [isBreak])

  useEffect(() => {
    if (sessionClockTicking) {
      intervalRef.current = window.setInterval(() => {
        setTime((prevTime) => {
          if (prevTime.seconds === 0 && prevTime.minutes === 0) {
            const newIsBreak = !isBreak
            const newSessionSeconds = newIsBreak ? BREAK_SESSION_SECONDS : WORK_SESSION_SECONDS
            setIsBreak(newIsBreak)
            setSessionClockTicking(false)
            return {
              minutes: Math.floor(newSessionSeconds / 60),
              seconds: newSessionSeconds % 60
            }
          } else if (prevTime.seconds === 0) {
            return { minutes: prevTime.minutes - 1, seconds: 59 }
          } else {
            return { ...prevTime, seconds: prevTime.seconds - 1 }
          }
        })
      }, 1000)
    } else if (intervalRef.current !== null) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    return (): void => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [sessionClockTicking, isBreak])

  const value = {
    time,
    sessionClockTicking,
    sessionInProgress,
    isBreak,
    startTimer,
    stopTimer,
    resetTimer
  }

  return <TimerContext.Provider value={value}>{children}</TimerContext.Provider>
}
