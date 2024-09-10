import React, { createContext, useState, useContext, ReactNode } from 'react'
import { WORK_SESSION_SECONDS } from '../../config/timerConfig'

interface TimerContextType {
  time: { minutes: number; seconds: number }
  setTime: React.Dispatch<React.SetStateAction<{ minutes: number; seconds: number }>>
  sessionActive: boolean
  setSessionActive: React.Dispatch<React.SetStateAction<boolean>>
  sessionInProgress: boolean
  setSessionInProgress: React.Dispatch<React.SetStateAction<boolean>>
}

const TimerContext = createContext<TimerContextType | undefined>(undefined)

export const TimerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [time, setTime] = useState({
    minutes: Math.floor(WORK_SESSION_SECONDS / 60),
    seconds: WORK_SESSION_SECONDS % 60
  }) // By default, the timer is set to the work session time

  const [sessionActive, setSessionActive] = useState(false) // Counting down
  const [sessionInProgress, setSessionInProgress] = useState(false) // Session is in progress

  return (
    <TimerContext.Provider
      value={{
        time,
        setTime,
        sessionActive,
        setSessionActive,
        sessionInProgress,
        setSessionInProgress
      }}
    >
      {children}
    </TimerContext.Provider>
  )
}

export const useTimer = () => {
  const context = useContext(TimerContext)
  if (context === undefined) {
    throw new Error('useTimer must be used within a TimerProvider')
  }
  return context
}
