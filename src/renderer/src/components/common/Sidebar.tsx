import React, { useState, useEffect, useMemo } from 'react'
import {
  PiCalendarCheckThin,
  PiPencilCircleThin,
  PiPushPinThin,
  PiPushPinFill
} from 'react-icons/pi'

import { useNotesContext } from '../context/NotesContext'
import Note from '../../types/Note'
import SessionTimer from './SessionTimer'
import SessionGoalsWindow from './SessionGoalsWindow'
import MovableGoalsWindow from './MovableGoalsWindow'
import { useSessionGoals } from '../context/SessionGoalsContext'

interface SidebarProps {
  pad: string
  setPad: React.Dispatch<React.SetStateAction<string | null>>
}

interface NoteListProps {
  pad: string
  searchResults: Note[]
  allNotes: Note[]
  updateNote: (
    id: string,
    pad: string,
    headline: string,
    content: string,
    pinned: boolean,
  ) => void
  displayedNote: Note | null
  setDisplayedNote: React.Dispatch<React.SetStateAction<Note | null>>
  togglePinNote: (pad: string, id: string) => void
}

interface NoteItemProps {
  pad: string
  note: Note
  isSelected: boolean
  updateNote: (
    id: string,
    pad: string,
    headline: string,
    content: string,
    pinned: boolean,
  ) => void
  displayedNote: Note | null
  setDisplayedNote: React.Dispatch<React.SetStateAction<Note | null>>
  handleSelectNote: (note: Note) => void
  togglePinNote: (pad: string, id: string) => void
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
  isSelected,
  togglePinNote
}: NoteItemProps): JSX.Element => {
  const handleClick = async (): Promise<void> => {
    if (displayedNote && displayedNote.id !== note.id) {
      await updateNote(
        displayedNote.id,
        displayedNote.pad,
        displayedNote.headline,
        displayedNote.content,
        displayedNote.pinned,
      )
    }
    handleSelectNote(note)
    setDisplayedNote(note)
  }

  const handlePinClick = (e: React.MouseEvent): void => {
    e.stopPropagation()
    togglePinNote(pad, note.id)
  }

  return (
    <div
      className={`cursor-pointer p-2 flex flex-row bg-transparent border ${
        isSelected ? 'border-bright-green' : 'border-transparent'
      } hover:border-bright-green transition-colors duration-100 justify-between items-center rounded-lg`}
      onClick={handleClick}
    >
      <div className="p-2 flex-grow">
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
      <div onClick={handlePinClick} className="text-xl text-bright-green cursor-pointer">
        {note.pinned ? <PiPushPinFill /> : <PiPushPinThin />}
      </div>
    </div>
  )
}

function NoteList({
  pad,
  searchResults,
  allNotes,
  setDisplayedNote,
  updateNote,
  displayedNote,
  togglePinNote
}: NoteListProps): JSX.Element {
  const handleSelectNote = (note: Note): void => {
    setDisplayedNote(note)
  }

  const displayName = pad === 'daybook' ? 'Daybook' : 'Notes'

  const sortedNotes = (notes: Note[]): { pinnedNotes: Note[]; unpinnedNotes: Note[] } => {
    const pinnedNotes = notes
      .filter((note) => note.pinned)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    const unpinnedNotes = notes
      .filter((note) => !note.pinned)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    return { pinnedNotes, unpinnedNotes }
  }

  const { pinnedNotes, unpinnedNotes } = sortedNotes(
    searchResults?.length > 0 ? searchResults : allNotes
  )

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
        {pinnedNotes.map((note: Note) => (
          <NoteItem
            pad={pad}
            key={note.id}
            note={note}
            isSelected={note.id === displayedNote?.id}
            updateNote={updateNote}
            displayedNote={displayedNote}
            setDisplayedNote={setDisplayedNote}
            handleSelectNote={handleSelectNote}
            togglePinNote={togglePinNote}
          />
        ))}
        {pinnedNotes.length > 0 && unpinnedNotes.length > 0 && (
          <div className="flex justify-center my-2">
            <div className="border-t-2 border-bright-green opacity-30 w-3/4"></div>
          </div>
        )}
        {unpinnedNotes.map((note: Note) => (
          <NoteItem
            pad={pad}
            key={note.id}
            note={note}
            isSelected={note.id === displayedNote?.id}
            updateNote={updateNote}
            displayedNote={displayedNote}
            setDisplayedNote={setDisplayedNote}
            handleSelectNote={handleSelectNote}
            togglePinNote={togglePinNote}
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

  const handlePadChange = (newPad: string): void => {
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
    sidebarSearchResults,
    togglePinNote
  } = useNotesContext()

  const allNotes = pad === 'daybook' ? allNotesDaybook : allNotesNotes
  const displayedNote = pad === 'daybook' ? displayedNoteDaybook : displayedNoteNotes
  const setDisplayedNote = pad === 'daybook' ? setDisplayedNoteDaybook : setDisplayedNoteNotes

  const [showPadsPanel, setPadsPanel] = useState(false)
  const [isMouseOverPanel, setIsMouseOverPanel] = useState(false)

  useEffect((): (() => void) => {
    const handleMouseMove = (e: MouseEvent): void => {
      setPadsPanel(e.clientX < 1 || isMouseOverPanel)
    }

    window.addEventListener('mousemove', handleMouseMove)

    return (): void => {
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [isMouseOverPanel])

  const { showGoalsWindow, showMovableGoalsWindow } = useSessionGoals()

  const mostRecentDaybookNote = useMemo(() => {
    return allNotesDaybook.reduce(
      (latest, current) =>
        new Date(current.created_at) > new Date(latest.created_at) ? current : latest,
      allNotesDaybook[0]
    )
  }, [allNotesDaybook])

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
          togglePinNote={togglePinNote}
        />
        <SessionTimer
          pad={pad}
          displayedNoteDaybook={displayedNoteDaybook}
          mostRecentDaybookNote={mostRecentDaybookNote}
        />
      </div>
      {showGoalsWindow && <SessionGoalsWindow />}
      {showMovableGoalsWindow && <MovableGoalsWindow />}
    </div>
  )
}
