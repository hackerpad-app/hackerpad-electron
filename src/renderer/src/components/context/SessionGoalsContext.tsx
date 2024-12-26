import * as React from 'react'
import { createContext, useState, useContext, ReactNode, useCallback } from 'react'

export interface Session {
  id: string
  noteId: string
  startTime: string
  endTime: string | null
  goals: Goal[]
  distractions: Distraction[]
  daySummary?: string
}

export interface Goal {
  id: string
  text: string
  finished: boolean
}

export interface Distraction {
  id: string
  text: string
}

interface SessionGoalsContextType {
  currentSession: Session | null
  completedSessions: Session[]
  showGoalsWindow: boolean
  setShowGoalsWindow: React.Dispatch<React.SetStateAction<boolean>>
  showMovableGoalsWindow: boolean
  setShowMovableGoalsWindow: React.Dispatch<React.SetStateAction<boolean>>
  transitionToMovableWindow: () => void
  setCurrentSession: React.Dispatch<React.SetStateAction<Session | null>>
}

const SessionGoalsContext = createContext<SessionGoalsContextType | undefined>(undefined)

export const SessionGoalsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentSession, setCurrentSession] = useState<Session | null>(null)
  const [completedSessions, setCompletedSessions] = useState<Session[]>([])
  const [showGoalsWindow, setShowGoalsWindow] = useState(false)
  const [showMovableGoalsWindow, setShowMovableGoalsWindow] = useState(false)

  // useEffect(() => {
  //   const handleGoalsUpdate = (data: { goals: Goal[]; distractions: Distraction[] }): void => {
  //     if (currentSession) {
  //       setCurrentSession((prev) => ({
  //         ...prev!,
  //         goals: data.goals || prev!.goals,
  //         distractions: data.distractions || prev!.distractions
  //       }))
  //     }
  //   }

  //   window.electron.ipcRenderer.on('goals-state-update', handleGoalsUpdate) [------------ IMPORTANT]

  //   return (): void => {
  //     window.electron.ipcRenderer.removeListener('goals-state-update', handleGoalsUpdate)
  //   }
  // }, [currentSession])

  // const addGoal = useCallback(
  //   (text: string): void => {
  //     if (currentSession) {
  //       const newGoal = { id: uuidv4(), text, finished: false }
  //       setCurrentSession((prevSession) => {
  //         const updatedSession = {
  //           ...prevSession!,
  //           goals: [...prevSession!.goals, newGoal]
  //         }

  //         window.electron.ipcRenderer.send('update-goals-state', {   [------------ IMPORTANT]
  //           type: 'add-goal',
  //           goals: updatedSession.goals
  //         })

  //         return updatedSession
  //       })
  //     }
  //   },
  //   [currentSession]
  // )

  const transitionToMovableWindow = useCallback((): void => {
    setShowGoalsWindow(false)
    setShowMovableGoalsWindow(true)
    window.electron.ipcRenderer.send('show-goals-window')
  }, [])

  // const startNewSession = useCallback((noteId: string) => {
  //   const newSession: Session = {
  //     id: uuidv4(),
  //     noteId,
  //     startTime: new Date().toISOString(),
  //     endTime: null,
  //     goals: [],
  //     distractions: []
  //   }
  //   setCurrentSession(newSession)

  //   window.electron.ipcRenderer.send('update-goals-state', {
  //     type: 'init-session'
  //   })
  // }, [])

  // const endCurrentSession = useCallback((): void => {
  //   if (currentSession) {
  //     const endedSession = {
  //       ...currentSession,
  //       endTime: new Date().toISOString()
  //     }
  //     setCompletedSessions((prevSessions) => [...prevSessions, endedSession])
  //     setCurrentSession(null)
  //   }
  // }, [currentSession])

  // const setDaySummary = useCallback((summary: string): void => {
  //   setCompletedSessions((prevSessions) => {
  //     const lastSession = prevSessions[prevSessions.length - 1]
  //     if (lastSession) {
  //       const updatedSession = { ...lastSession, daySummary: summary }
  //       return [...prevSessions.slice(0, -1), updatedSession]
  //     }
  //     return prevSessions
  //   })
  // }, [])

  return (
    <SessionGoalsContext.Provider
      value={{
        currentSession,
        completedSessions,
        showGoalsWindow,
        setShowGoalsWindow,
        showMovableGoalsWindow,
        setShowMovableGoalsWindow,
        transitionToMovableWindow,
        setCurrentSession
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
