/* eslint-disable */
import { createContext, useContext, useState, useCallback } from 'react'
import * as React from 'react'
import { supabase } from '../../lib/supabaseClient'
import type Session from '../../types/Session'
import { useNotesContext } from './NotesContext'

interface SessionContextType {
  currentSessionId: string | null
  createSession: () => Promise<string>
  updateSession: (data: Partial<Session>) => Promise<void>
}

const SessionContext = createContext<SessionContextType | undefined>(undefined)

export const useSession = (): SessionContextType => {
  const context = useContext(SessionContext)
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider')
  }
  return context
}

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { displayedNoteDaybook } = useNotesContext()
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)

  // Create a new session and set the currentSessionId
  const createSession = useCallback(async () => {
    const { data, error } = await supabase.from('sessions').insert({
      note_id: displayedNoteDaybook?.id,
      started_at: new Date().toISOString(),
      finished_at: null,
      distractions: []
    }).select('id').single()
    if (error) throw error
    setCurrentSessionId(data.id)
    return data.id
  }, [displayedNoteDaybook?.id])

  // Update the current session with new data, use currentSessionId to find the session
  const updateSession = useCallback(async (data: Partial<Session>) => {
    if (!currentSessionId) {
      throw new Error('No session ID found in current session')
    }
    const { error } = await supabase
      .from('sessions')
      .update(data)
      .eq('id', currentSessionId)

    if (error) throw error
  }, [currentSessionId])

  const value = {
    currentSessionId,
    createSession,
    updateSession
  }

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}