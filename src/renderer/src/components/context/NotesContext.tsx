import React, { createContext, useContext, ReactNode } from 'react'
import useNotes from '../../hooks/useNotes'
import Note from '../../types/NoteNew'

interface NotesContextType {
  createNote: (pad: string, headline?: string) => void
  deleteNote: (pad: string) => void
  updateNote: (pad: string, id: string, headline: string, content: string, pinned: boolean) => void
  sidebarSearchQuery: string
  setSidebarSearchQuery: React.Dispatch<React.SetStateAction<string>>
  setSidebarSearchResults: React.Dispatch<React.SetStateAction<Note[]>>
  sidebarSearchResults: Note[]
  searchSidebarNotes: (query: string) => void
  setEditorSearchQuery: React.Dispatch<React.SetStateAction<string>>
  editorSearchResults: Note[]
  searchEditorNotes: (query: string) => void
  allNotesDaybook: Note[]
  allNotesNotes: Note[]
  setAllNotesDaybook: React.Dispatch<React.SetStateAction<Note[]>>
  setAllNotesNotes: React.Dispatch<React.SetStateAction<Note[]>>
  displayedNoteDaybook: Note | null
  displayedNoteNotes: Note | null
  setDisplayedNoteDaybook: React.Dispatch<React.SetStateAction<Note | null>>
  setDisplayedNoteNotes: React.Dispatch<React.SetStateAction<Note | null>>
  togglePinNote: (pad: string, id: string) => void
  isCurrentDaybookFinished: boolean
  setIsCurrentDaybookFinished: React.Dispatch<React.SetStateAction<boolean>>
}

const NotesContext = createContext<NotesContextType | undefined>(undefined)

export const NotesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const notesData = useNotes() as NotesContextType

  return <NotesContext.Provider value={notesData}>{children}</NotesContext.Provider>
}

export const useNotesContext = (): NotesContextType => {
  const context = useContext(NotesContext)
  if (context === undefined) {
    throw new Error('useNotesContext must be used within a NotesProvider')
  }
  return context
}
