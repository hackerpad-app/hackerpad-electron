import * as React from 'react'
import { createContext, useState, useContext, ReactNode, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'

export interface Goal {
  id: string
  text: string
  finished: boolean
}

export interface Session {
  id: string
  goals: Goal[]
  startTime: number
  endTime: number | null
}

interface SessionGoalsContextType {
  currentSession: Session | null
  completedSessions: Session[]
  addGoal: (text: string) => void
  toggleGoalStatus: (id: string) => void
  showGoalsWindow: boolean
  setShowGoalsWindow: React.Dispatch<React.SetStateAction<boolean>>
  showMovableGoalsWindow: boolean
  setShowMovableGoalsWindow: React.Dispatch<React.SetStateAction<boolean>>
  transitionToMovableWindow: () => void
  startNewSession: () => void
  endCurrentSession: () => void
}

const SessionGoalsContext = createContext<SessionGoalsContextType | undefined>(undefined)

export const SessionGoalsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentSession, setCurrentSession] = useState<Session | null>(null)
  const [completedSessions, setCompletedSessions] = useState<Session[]>([])
  const [showGoalsWindow, setShowGoalsWindow] = useState(false)
  const [showMovableGoalsWindow, setShowMovableGoalsWindow] = useState(false)

  const addGoal = useCallback(
    (text: string): void => {
      if (currentSession) {
        const newGoal = { id: uuidv4(), text, finished: false }
        setCurrentSession((prevSession) => ({
          ...prevSession!,
          goals: [...prevSession!.goals, newGoal]
        }))
      }
    },
    [currentSession]
  )

  const toggleGoalStatus = useCallback(
    (id: string): void => {
      if (currentSession) {
        setCurrentSession((prevSession) => ({
          ...prevSession!,
          goals: prevSession!.goals.map((goal) =>
            goal.id === id ? { ...goal, finished: !goal.finished } : goal
          )
        }))
      }
    },
    [currentSession]
  )

  const transitionToMovableWindow = useCallback((): void => {
    setShowGoalsWindow(false)
    setShowMovableGoalsWindow(true)
  }, [])

  const startNewSession = useCallback((): void => {
    const newSession: Session = {
      id: uuidv4(),
      goals: [],
      startTime: Date.now(),
      endTime: null
    }
    console.log('newSession', newSession)
    setCurrentSession(newSession)
    console.log('currentSession', currentSession)
  }, [])

  const endCurrentSession = useCallback((): void => {
    if (currentSession) {
      const endedSession = { ...currentSession, endTime: Date.now() }
      setCompletedSessions((prevSessions) => [...prevSessions, endedSession])
      setCurrentSession(null)
    }
  }, [currentSession])

  return (
    <SessionGoalsContext.Provider
      value={{
        currentSession,
        completedSessions,
        addGoal,
        toggleGoalStatus,
        showGoalsWindow,
        setShowGoalsWindow,
        showMovableGoalsWindow,
        setShowMovableGoalsWindow,
        transitionToMovableWindow,
        startNewSession,
        endCurrentSession
      }}
    >
      {children}
    </SessionGoalsContext.Provider>
  )
}

export const useSessionGoals = (): SessionGoalsContextType => {
  const context = useContext(SessionGoalsContext)
  if (context === undefined) {
    throw new Error('useSessionGoals must be used within a SessionGoalsProvider')
  }
  return context
}
