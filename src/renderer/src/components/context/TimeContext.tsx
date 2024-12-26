/* eslint-disable */
import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import * as React from 'react'
import { WORK_SESSION_SECONDS, BREAK_SESSION_SECONDS } from '../../config/timerConfig'
import magicSound from '../../assets/magic.wav'
import upliftSound from '../../assets/uplift.wav'

import { useSession } from './SessionContext'

interface Time {
  minutes: number
  seconds: number
}

interface TimerContextType {
  time: Time
  sessionClockTicking: boolean
  sessionInProgress: boolean
  isBreak: boolean
  sessionCompleted: boolean
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
  const [sessionCompleted, setSessionCompleted] = useState(false)
  const intervalRef = useRef<number | null>(null)
  const { createSession, updateSession } = useSession()

  const startTimer = useCallback(async () => {
    try {
      await createSession()
      setSessionClockTicking(true)
      setSessionInProgress(true)
    } catch (error) {
      console.error('Error creating session:', error)
    }
  }, [createSession])

  const stopTimer = useCallback(() => {
    setSessionClockTicking(false)
  }, [])

  const resetTimer = useCallback(() => {
    setSessionClockTicking(false)
    setSessionInProgress(false)
    setSessionCompleted(false)
    const newSessionSeconds = isBreak ? BREAK_SESSION_SECONDS : WORK_SESSION_SECONDS
    setTime({
      minutes: Math.floor(newSessionSeconds / 60),
      seconds: newSessionSeconds % 60
    })
    setIsBreak(false)
  }, [isBreak])


  // Timer logic together with updating the session after it's finished
  useEffect(() => {
    if (sessionClockTicking) {
      intervalRef.current = window.setInterval(() => {
        setTime((prevTime) => {
          if (prevTime.seconds === 0 && prevTime.minutes === 0) {
            const newIsBreak = !isBreak
            const newSessionSeconds = newIsBreak ? BREAK_SESSION_SECONDS : WORK_SESSION_SECONDS

            const audio = new Audio(isBreak ? upliftSound : magicSound)
            audio.volume = 0.05
            audio.play().catch((error) => console.error('Error playing sound:', error))

            if (!isBreak) {
              updateSession({
                finished_at: new Date().toISOString()
              }).catch(error => console.error('Error updating session:', error))
              setSessionCompleted(true)
            }

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
    sessionCompleted,
    startTimer,
    stopTimer,
    resetTimer
  }

  return <TimerContext.Provider value={value}>{children}</TimerContext.Provider>
}
