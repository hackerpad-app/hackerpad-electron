import * as React from 'react'
import { createContext, useState, useContext, ReactNode, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'

export interface Goal {
  id: string
  text: string
  finished: boolean
}

export interface Distraction {
  id: string
  text: string
}

export interface Session {
  id: string
  noteId: string
  startTime: string
  endTime: string | null
  goals: Goal[]
  distractions: Distraction[]
  daySummary?: string
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
  startNewSession: (noteId: string) => void
  endCurrentSession: () => void
  addDistraction: (text: string) => void
  setDaySummary: (summary: string) => void
}

const SessionGoalsContext = createContext<SessionGoalsContextType | undefined>(undefined)

export const SessionGoalsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentSession, setCurrentSession] = useState<Session | null>(null)
  const [completedSessions, setCompletedSessions] = useState<Session[]>([])
  const [showGoalsWindow, setShowGoalsWindow] = useState(false)
  const [showMovableGoalsWindow, setShowMovableGoalsWindow] = useState(false)

  const addGoal = useCallback(
    (text: string): void => {
      console.log('Adding goal:', text)
      if (currentSession) {
        console.log('to note-id', currentSession.noteId)
        const newGoal = { id: uuidv4(), text, finished: false }
        setCurrentSession((prevSession) => ({
          ...prevSession!,
          goals: [...prevSession!.goals, newGoal]
        }))
      } else {
        console.warn('Attempted to add a goal without an active session')
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

  const addDistraction = useCallback(
    (text: string): void => {
      if (currentSession) {
        const newDistraction: Distraction = { id: uuidv4(), text }
        setCurrentSession((prevSession) => ({
          ...prevSession!,
          distractions: [...prevSession!.distractions, newDistraction]
        }))
      }
    },
    [currentSession]
  )

  const transitionToMovableWindow = useCallback((): void => {
    setShowGoalsWindow(false)
    setShowMovableGoalsWindow(true)
  }, [])

  const startNewSession = useCallback((noteId: string) => {
    const newSession: Session = {
      id: uuidv4(),
      noteId,
      startTime: new Date().toISOString(),
      endTime: null,
      goals: [],
      distractions: []
    }
    setCurrentSession(newSession)
  }, [])

  const endCurrentSession = useCallback((): void => {
    if (currentSession) {
      const endedSession = {
        ...currentSession,
        endTime: new Date().toISOString()
      }
      setCompletedSessions((prevSessions) => [...prevSessions, endedSession])
      setCurrentSession(null)
    }
  }, [currentSession])

  const setDaySummary = useCallback((summary: string): void => {
    setCompletedSessions((prevSessions) => {
      const lastSession = prevSessions[prevSessions.length - 1]
      if (lastSession) {
        const updatedSession = { ...lastSession, daySummary: summary }
        return [...prevSessions.slice(0, -1), updatedSession]
      }
      return prevSessions
    })
  }, [])

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
        endCurrentSession,
        addDistraction,
        setDaySummary
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
