import React, { useState, useEffect } from 'react'

import { PiCalendarCheckThin } from 'react-icons/pi'
import { PiPencilCircleThin } from 'react-icons/pi'

import { useTimer } from '../context/TimeContext'
import { useNotesContext } from '../context/NotesContext'
import Note from '../../types/Note'
import SessionTimer from './SessionTimer'

interface SidebarProps {
  pad: string
  setPad: React.Dispatch<React.SetStateAction<string | null>>
}

interface NoteListProps {
  pad: string
  searchResults: Note[]
  allNotes: Note[]
  updateNote: (pad: string, id: string, headline: string, content: string) => void
  displayedNote: Note | null
  setDisplayedNote: React.Dispatch<React.SetStateAction<Note | null>>
}

interface NoteItemProps {
  pad: string
  note: Note
  isSelected: boolean
  updateNote: (pad: string, id: string, headline: string, content: string) => void
  displayedNote: Note | null
  setDisplayedNote: React.Dispatch<React.SetStateAction<Note | null>>
  handleSelectNote: (note: Note) => void
}

interface PadsPanelProps {
  pad: string
  setPad: React.Dispatch<React.SetStateAction<string | null>>
  isVisible: boolean
}

const NoteItem = ({
  pad,
  note,
  updateNote,
  displayedNote,
  handleSelectNote,
  setDisplayedNote,
  isSelected
}: NoteItemProps): JSX.Element => {
  const handleClick = async (): Promise<void> => {
    if (displayedNote && displayedNote.id !== note.id) {
      await updateNote(pad, displayedNote.id, displayedNote.headline, displayedNote.content)
    }
    handleSelectNote(note)
    setDisplayedNote(note)
  }

  return (
    <div
      className={`cursor-pointer p-2 flex flex-row bg-transparent border ${
        isSelected ? 'border-bright-green' : 'border-transparent'
      } hover:border-bright-green transition-colors duration-100 justify-between items-center rounded-lg`}
      onClick={handleClick}
    >
      <div className="p-2">
        <div className="text-xs font-bold">
          {note.headline.length > 45
            ? note.headline.substring(0, 45).replace(/<[^>]*>/g, '') + '...'
            : note.headline.replace(/<[^>]*>/g, '')}
        </div>
      </div>
      {pad === 'daybook' && (
        <div className="text-xs text-center p-2 text-white opacity-25 self-start flex-shrink-0">
          {new Date(note.created_at).toLocaleDateString()}
        </div>
      )}
    </div>
  )
}

function NoteList({
  pad,
  searchResults,
  allNotes,
  setDisplayedNote,
  updateNote,
  displayedNote
}: NoteListProps): JSX.Element {
  const handleSelectNote = (note: Note): void => {
    setDisplayedNote(note)
  }

  // Quick fix to change the name to notes without messing with backend
  const displayName = pad === 'daybook' ? 'Daybook' : 'Notes'

  return (
    <div
      style={{
        borderColor: 'rgba(22, 163, 74, 0.5)',
        borderWidth: '2px',
        borderStyle: 'solid',
        zIndex: 0
      }}
      className="h-4/5 bg-transparent rounded-lg flex flex-col"
    >
      <div className="flex justify-center font-bold p-2" style={{ letterSpacing: '0.15em' }}>
        {displayName.charAt(0).toUpperCase() + displayName.slice(1).toLowerCase()}
      </div>
      <div className="flex-grow overflow-y-auto custom-scrollbar">
        {(searchResults?.length > 0
          ? searchResults
          : allNotes.length > 0
            ? allNotes.sort(
                (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
              )
            : []
        ).map((note: Note) => (
          <NoteItem
            pad={pad}
            key={note.id}
            note={note}
            isSelected={note.id === displayedNote?.id}
            updateNote={updateNote}
            displayedNote={displayedNote}
            setDisplayedNote={setDisplayedNote}
            handleSelectNote={handleSelectNote}
          />
        ))}
      </div>
    </div>
  )
}

const PadsPanel = ({
  pad,
  setPad,
  isVisible,
  onMouseEnter,
  onMouseLeave
}: PadsPanelProps & { onMouseEnter: () => void; onMouseLeave: () => void }): JSX.Element => {
  const { setSidebarSearchQuery, setSidebarSearchResults } = useNotesContext()

  const getActiveStyle = (currentPad: string): React.CSSProperties => ({
    color: pad === currentPad ? '#00FF00' : 'inherit',
    fontSize: '30px'
  })

  const handlePadChange = (newPad: string) => {
    setPad(newPad)
    setSidebarSearchResults([])
    setSidebarSearchQuery('')
  }

  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        transition: 'opacity 0.5s, visibility 0.1s',
        opacity: isVisible ? 1 : 0,
        zIndex: isVisible ? 10 : -1,
        visibility: isVisible ? 'visible' : 'hidden',
        background: 'linear-gradient(180deg,rgba(41, 71, 42, 0.9) 40%, rgba(41, 71, 42, 0.1) 100%)',
        pointerEvents: isVisible ? 'auto' : 'none'
      }}
      className="relative h-screen bg-bright-green opacity-50 flex flex-col justify-between items-center py-10 p-5"
    >
      <div
        style={{
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 0.2s',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}
      >
        <div
          onClick={() => handlePadChange('daybook')}
          className="py-4"
          style={getActiveStyle('daybook')}
        >
          <PiCalendarCheckThin />
        </div>
        <div
          onClick={() => handlePadChange('notes')}
          className="py-4"
          style={getActiveStyle('notes')}
        >
          <PiPencilCircleThin />
        </div>
      </div>
    </div>
  )
}

export default function Sidebar({ pad, setPad }: SidebarProps): JSX.Element {
  const {
    updateNote,
    allNotesDaybook,
    allNotesNotes,
    displayedNoteDaybook,
    displayedNoteNotes,
    setDisplayedNoteDaybook,
    setDisplayedNoteNotes,
    sidebarSearchResults
  } = useNotesContext()

  const allNotes = pad === 'daybook' ? allNotesDaybook : allNotesNotes
  const displayedNote = pad === 'daybook' ? displayedNoteDaybook : displayedNoteNotes
  const setDisplayedNote = pad === 'daybook' ? setDisplayedNoteDaybook : setDisplayedNoteNotes

  const [showPadsPanel, setPadsPanel] = useState(false)
  const [isMouseOverPanel, setIsMouseOverPanel] = useState(false)

  const [showNewSessionModal, setStartSessionShowModal] = useState(false)
  const [newTask, setNewTask] = useState('')

  const {
    tasks,
    setTasks,
    sessionActive,
    sessionInProgress,
    setSessionActive,
    setSessionInProgress,
    setTime
  } = useTimer()

  useEffect((): (() => void) => {
    const handleMouseMove = (e: MouseEvent): void => {
      setPadsPanel(e.clientX < 1 || isMouseOverPanel)
    }

    window.addEventListener('mousemove', handleMouseMove)

    return (): void => {
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [isMouseOverPanel])

  // Handling Modal buttons
  const handleNewSessionStart = (): void => {
    console.log('handleNewSessionStart')
    console.log('sessionActive', sessionActive)
    console.log('sessionInProgress', sessionInProgress)
    setStartSessionShowModal(true)
  }

  const handleAddTask = (): void => {
    if (newTask.trim()) {
      setTasks([...tasks, newTask.trim()])
      setNewTask('')
    }
  }

  const handleStartSessionModal = (): void => {
    console.log('handleStartSessionModal')
    console.log('sessionActive', sessionActive)
    console.log('sessionInProgress', sessionInProgress)

    setStartSessionShowModal(false)

    //
    setSessionActive(true)
    setSessionInProgress(true)
  }

  // Handling Sidebar buttons
  const handleStopSession = (): void => {
    console.log('handleStopSession')
    console.log('sessionActive', sessionActive)
    console.log('sessionInProgress', sessionInProgress)

    setSessionInProgress(false)
  }

  const handleContinueSession = (): void => {
    console.log('handleContinueSession')
    console.log('sessionActive', sessionActive)
    console.log('sessionInProgress', sessionInProgress)
    setSessionActive(true)
  }

  const handleResetSession = (): void => {
    // Reset all Timer states
    console.log('handleResetSession')
    console.log('sessionActive', sessionActive)
    console.log('sessionInProgress', sessionInProgress)

    setSessionInProgress(false)
    setSessionActive(false)
    setTasks([])
    setTime({ minutes: 50, seconds: 0 })
  }

  return (
    <div className="relative w-screen h-screen bg-dark-green">
      <div className="absolute top-0 left-0 h-full flex justify-start items-start">
        <PadsPanel
          pad={pad}
          setPad={setPad}
          isVisible={showPadsPanel}
          onMouseEnter={() => setIsMouseOverPanel(true)}
          onMouseLeave={() => setIsMouseOverPanel(false)}
        />
      </div>
      <div className="h-screen flex flex-col bg-dark-green p-5 mt-10">
        <NoteList
          pad={pad}
          searchResults={sidebarSearchResults}
          allNotes={allNotes}
          updateNote={updateNote}
          displayedNote={displayedNote}
          setDisplayedNote={setDisplayedNote}
        />
        <SessionTimer
          onRequestStart={handleNewSessionStart}
          onRequestStop={handleStopSession}
          onRequestContinue={handleContinueSession}
          onRequestReset={handleResetSession}
        />
      </div>
      {showNewSessionModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black opacity-50"></div>
          <div className="bg-transparent p-8 rounded-lg shadow-lg z-10 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-6 text-gray-300 text-center">Session Tasks</h2>
            <div className="flex mb-6">
              <input
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                className="flex-grow border border-gray-600 rounded-l px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Enter a task"
              />
              <button
                onClick={handleAddTask}
                className="bg-gray-500 text-white px-4 py-2 rounded-r hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-green-400"
              >
                Add
              </button>
            </div>
            <ul className="mb-6 space-y-2">
              {tasks.map((task, index) => (
                <li key={index} className="bg-slate-900 p-0.5 rounded text-gray-300">
                  {task}
                </li>
              ))}
            </ul>
            <button
              onClick={handleStartSessionModal}
              className="bg-gray-500 text-white w-full py-3 rounded hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-green-400"
            >
              Start Session
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
