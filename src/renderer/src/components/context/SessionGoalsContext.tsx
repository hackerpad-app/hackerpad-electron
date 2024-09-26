import React, { createContext, useState, useContext, ReactNode } from 'react'

interface SessionGoalsContextType {
  goals: string[]
  setGoals: React.Dispatch<React.SetStateAction<string[]>>
  showGoalsWindow: boolean
  setShowGoalsWindow: React.Dispatch<React.SetStateAction<boolean>>
  showMovableGoalsWindow: boolean
  setShowMovableGoalsWindow: React.Dispatch<React.SetStateAction<boolean>>
}

const SessionGoalsContext = createContext<SessionGoalsContextType | undefined>(undefined)

export const SessionGoalsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [goals, setGoals] = useState<string[]>([])
  const [showGoalsWindow, setShowGoalsWindow] = useState(false)
  const [showMovableGoalsWindow, setShowMovableGoalsWindow] = useState(false)

  return (
    <SessionGoalsContext.Provider
      value={{
        goals,
        setGoals,
        showGoalsWindow,
        setShowGoalsWindow,
        showMovableGoalsWindow,
        setShowMovableGoalsWindow
      }}
    >
      {children}
    </SessionGoalsContext.Provider>
  )
}

export const useSessionGoals = () => {
  const context = useContext(SessionGoalsContext)
  if (context === undefined) {
    throw new Error('useSessionGoals must be used within a SessionGoalsProvider')
  }
  return context
}
