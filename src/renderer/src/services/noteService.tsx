import Note from '../types/Note'

const generateId = (): string => Math.random().toString(36).substr(2, 9)

export const getNotes = (pad: string): Note[] => {
  const notes = localStorage.getItem(`notes_${pad}`)
  return notes ? JSON.parse(notes) : []
}

const saveNotes = (pad: string, notes: Note[]): void => {
  localStorage.setItem(`notes_${pad}`, JSON.stringify(notes))
}

export const createNote = (pad: string, headline?: string): Note => {
  const notes = getNotes(pad)
  const newNote: Note = {
    id: generateId(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    headline: headline || 'New Note',
    content: '',
    pinned: false,
    pad: pad === 'daybook' ? 'daybook' : 'notes'
  }
  notes.push(newNote)
  saveNotes(pad, notes)
  return newNote
}

// Delete a note
export const deleteNote = (pad: string, id: string): void => {
  const notes = getNotes(pad).filter((note) => note.id !== id)
  saveNotes(pad, notes)
}

export const updateNote = (
  pad: string,
  id: string,
  headline: string,
  content: string,
  pinned: boolean
): Note => {
  const notes = getNotes(pad)
  const updatedNotes = notes.map((note) => {
    if (note.id === id) {
      return {
        ...note,
        headline,
        content,
        updated_at: new Date().toISOString(),
        pinned
      }
    }
    return note
  })
  saveNotes(pad, updatedNotes)
  return updatedNotes.find((note) => note.id === id)!
}
