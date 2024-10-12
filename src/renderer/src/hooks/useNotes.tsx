import { useState, useEffect } from 'react'
import Note from './../types/Note'

interface UseNotesReturn {
  createNote: (pad: string, headline?: string) => void
  deleteNote: (pad: string) => void
  updateNote: (pad: string, id: string, headline: string, content: string, pinned: boolean) => void
  searchNotes: (query: string, pad: string) => Note[]
  allNotesDaybook: Note[]
  allNotesNotes: Note[]
  displayedNoteDaybook: Note | null
  displayedNoteNotes: Note | null
  setDisplayedNoteDaybook: React.Dispatch<React.SetStateAction<Note | null>>
  setDisplayedNoteNotes: React.Dispatch<React.SetStateAction<Note | null>>
  sidebarSearchQuery: string
  setSidebarSearchQuery: React.Dispatch<React.SetStateAction<string>>
  setSidebarSearchResults: React.Dispatch<React.SetStateAction<Note[]>>
  sidebarSearchResults: Note[]
  searchSidebarNotes: (query: string) => void
  editorSearchQuery: string
  setEditorSearchQuery: React.Dispatch<React.SetStateAction<string>>
  editorSearchResults: Note[]
  searchEditorNotes: (query: string) => void
  togglePinNote: (pad: string, id: string) => void
  isCurrentDaybookFinished: boolean
  setIsCurrentDaybookFinished: React.Dispatch<React.SetStateAction<boolean>>
}

export default function useNotes(pad: string): UseNotesReturn {
  const [allNotesDaybook, setAllNotesDaybook] = useState<Note[]>([])
  const [allNotesNotes, setAllNotesNotes] = useState<Note[]>([])

  const [displayedNoteNotes, setDisplayedNoteNotes] = useState<Note | null>(null)
  const [displayedNoteDaybook, setDisplayedNoteDaybook] = useState<Note | null>(null)

  const [sidebarSearchQuery, setSidebarSearchQuery] = useState('')
  const [sidebarSearchResults, setSidebarSearchResults] = useState<Note[]>([])
  const [editorSearchQuery, setEditorSearchQuery] = useState('')
  const [editorSearchResults, setEditorSearchResults] = useState<Note[]>([])

  const [isCurrentDaybookFinished, setIsCurrentDaybookFinished] = useState(false)

  useEffect(() => {
    readNotes('daybook')
    readNotes('notes')
  }, [])

  const setDefaultNote = (pad: string): Note => ({
    id: `temp-${Date.now()}`,
    headline: '👋 🌎 ',
    content: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    pad,
    pinned: false
  })

  const daybookTemplate = {
    id: `temp-${Date.now()}`,
    headline: `${new Date().toLocaleDateString()}`,
    content: "<h2>🧠 Keep in mind</h2><p><h2>✅ Today's tasks</h2><p><h2>🐥 Standup</h2><p>",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    pad: 'daybook',
    pinned: false
  }

  const notesTemplate = {
    id: `temp-${Date.now()}`,
    content: '<h2>🧠 Thoughts</h2><p>',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    pad: 'notes',
    pinned: false
  }

  const searchNotes = (query: string, pad: string): Note[] => {
    console.log('pad', pad)
    const allNotes = pad === 'daybook' ? allNotesDaybook : allNotesNotes
    return allNotes.filter(
      (note) =>
        note.headline.toLowerCase().includes(query.toLowerCase()) ||
        note.content.toLowerCase().includes(query.toLowerCase())
    )
  }

  const searchSidebarNotes = (query: string): void => {
    console.log('searching sidebar notes', query)
    const results = searchNotes(query, pad)
    setSidebarSearchResults(results)
    console.log('sidebarSearchResults usenotes', sidebarSearchResults)
    if (sidebarSearchResults.length > 0) {
      if (pad === 'daybook') {
        setDisplayedNoteDaybook(sidebarSearchResults[0])
      } else {
        setDisplayedNoteNotes(sidebarSearchResults[0])
      }
    }
  }

  const searchEditorNotes = (query: string): void => {
    console.log('searching editor notes', query)
    const results = searchNotes(query, 'notes') // Always search in 'notes' for editor
    setEditorSearchResults(results)
    console.log('editorSearchResults usenotes', editorSearchResults)
  }

  const createNote = (pad: string, headline: string = ''): void => {
    const newNote: Note =
      pad === 'daybook'
        ? { ...daybookTemplate, id: `note_${Date.now()}` }
        : { ...notesTemplate, headline, id: `note_${Date.now()}` }

    console.log('newNote', newNote)
    const storedNotes = localStorage.getItem(`notes_${pad}`)
    const NotesArray = storedNotes ? JSON.parse(storedNotes) : []
    NotesArray.unshift(newNote) // Add new note to the top of the array
    localStorage.setItem(`notes_${pad}`, JSON.stringify(NotesArray))
    if (pad === 'daybook') {
      setIsCurrentDaybookFinished(false)
    }
    readNotes(pad)
  }

  const readNotes = (pad: string): void => {
    const storedNotes = localStorage.getItem(`notes_${pad}`)
    const NotesArray = storedNotes ? JSON.parse(storedNotes) : []
    handleNotesArray(pad, NotesArray)
  }

  const updateNote = (
    id: string,
    pad: string,
    headline: string,
    content: string,
    pinned: boolean
  ): void => {
    const storedNotes = localStorage.getItem(`notes_${pad}`)
    const NotesArray = storedNotes ? JSON.parse(storedNotes) : []
    const updatedNotes = NotesArray.map((note: Note) =>
      note.id === id
        ? {
            ...note,
            headline,
            content,
            updated_at: new Date().toISOString(),
            pinned
          }
        : note
    )
    localStorage.setItem(`notes_${pad}`, JSON.stringify(updatedNotes))

    if (pad === 'notes') {
      setAllNotesNotes(updatedNotes)
    } else {
      setAllNotesDaybook(updatedNotes)
    }
  }

  const deleteNote = (pad: string): void => {
    console.log('Deleting a note')
    const displayed = pad === 'daybook' ? displayedNoteDaybook : displayedNoteNotes
    if (displayed === null) return

    const storedNotes = localStorage.getItem(`notes_${pad}`)
    let NotesArray = storedNotes ? JSON.parse(storedNotes) : []
    NotesArray = NotesArray.filter((note: Note) => note.id !== displayed.id)
    localStorage.setItem(`notes_${pad}`, JSON.stringify(NotesArray))
    readNotes(pad)
  }

  const togglePinNote = (pad: string, id: string): void => {
    const storedNotes = localStorage.getItem(`notes_${pad}`)
    const NotesArray = storedNotes ? JSON.parse(storedNotes) : []
    const updatedNotes = NotesArray.map((note: Note) =>
      note.id === id ? { ...note, pinned: !note.pinned } : note
    )
    localStorage.setItem(`notes_${pad}`, JSON.stringify(updatedNotes))

    if (pad === 'notes') {
      setAllNotesNotes(updatedNotes)
    } else {
      setAllNotesDaybook(updatedNotes)
    }
  }

  const handleNotesArray = (pad: string, NotesArray: Note[]): void => {
    const setNote = pad === 'daybook' ? setDisplayedNoteDaybook : setDisplayedNoteNotes
    const setAllNotes = pad === 'daybook' ? setAllNotesDaybook : setAllNotesNotes

    if (NotesArray.length > 0) {
      setNote(NotesArray[0])
    } else {
      setNote(setDefaultNote(pad))
    }
    setAllNotes(NotesArray)
  }

  return {
    createNote,
    deleteNote,
    updateNote,
    searchNotes,
    allNotesDaybook,
    allNotesNotes,
    displayedNoteDaybook,
    displayedNoteNotes,
    setDisplayedNoteDaybook,
    setDisplayedNoteNotes,
    sidebarSearchQuery,
    setSidebarSearchQuery,
    setSidebarSearchResults,
    sidebarSearchResults,
    searchSidebarNotes,
    editorSearchQuery,
    setEditorSearchQuery,
    editorSearchResults,
    searchEditorNotes,
    togglePinNote,
    isCurrentDaybookFinished,
    setIsCurrentDaybookFinished
  }
}
