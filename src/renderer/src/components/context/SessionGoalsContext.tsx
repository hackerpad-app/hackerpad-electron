import * as React from 'react'
import { createContext, useState, useContext, ReactNode } from 'react'

export interface Goal {
  text: string
  finished: boolean
}

interface SessionGoalsContextType {
  goals: Goal[]
  setGoals: React.Dispatch<React.SetStateAction<Goal[]>>
  addGoal: (text: string) => void
  toggleGoalStatus: (index: number) => void
  showGoalsWindow: boolean
  setShowGoalsWindow: React.Dispatch<React.SetStateAction<boolean>>
  showMovableGoalsWindow: boolean
  setShowMovableGoalsWindow: React.Dispatch<React.SetStateAction<boolean>>
  transitionToMovableWindow: () => void
}

const SessionGoalsContext = createContext<SessionGoalsContextType | undefined>(undefined)

export const SessionGoalsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [goals, setGoals] = useState<Goal[]>([])
  const [showGoalsWindow, setShowGoalsWindow] = useState(false)
  const [showMovableGoalsWindow, setShowMovableGoalsWindow] = useState(false)

  const addGoal = (text: string): void => {
    setGoals((prevGoals) => [...prevGoals, { text, finished: false }])
  }

  const toggleGoalStatus = (index: number): void => {
    setGoals((prevGoals) =>
      prevGoals.map((goal, i) => {
        if (i === index) {
          if (typeof goal === 'string') {
            return { text: goal, finished: true }
          } else {
            return { ...goal, finished: !goal.finished }
          }
        }
        return goal
      })
    )
  }

  const transitionToMovableWindow = (): void => {
    setShowGoalsWindow(false)
    setShowMovableGoalsWindow(true)
  }

  return (
    <SessionGoalsContext.Provider
      value={{
        goals,
        setGoals,
        addGoal,
        toggleGoalStatus,
        showGoalsWindow,
        setShowGoalsWindow,
        showMovableGoalsWindow,
        setShowMovableGoalsWindow,
        transitionToMovableWindow
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
