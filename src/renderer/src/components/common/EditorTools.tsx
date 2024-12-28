import React, { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useNotesContext } from '../context/NotesContext'
import type Note from '../../types/NoteNew'
import NotesListModal from './modals/NotesListModal'
import { useTimer } from '../context/TimeContext'
import { useSessionGoals } from '../context/SessionGoalsContext'
import StartSessionModal from './modals/StartSessionModal'

import { GiPlasticDuck } from 'react-icons/gi'
import { CiSquarePlus, CiViewList, CiPlay1, CiStop1, CiUndo } from 'react-icons/ci'

const Tools = (): React.ReactNode => {
  const [isHovering, setIsHovering] = useState(false)
  const [isControlsHovering, setIsControlsHovering] = useState(false)
  const [isListModalOpen, setIsListModalOpen] = useState(false)
  const [notesList, setNotesList] = useState<Note[]>([])
  const [showStartSessionModal, setShowStartSessionModal] = useState(false)

  const { setShowGoalsWindow, setShowMovableGoalsWindow, transitionToMovableWindow } = useSessionGoals()

  const {
    sessionClockTicking,
    sessionInProgress,
    stopTimer,
    resetTimer,
  } = useTimer()

  const { displayedNoteDaybook, setDisplayedNoteDaybook } = useNotesContext()

  const handleNoteSelect = (note: Note): void => {
    setDisplayedNoteDaybook(note)
  }

  const handleStartTimer = (): void => {
    if (!sessionClockTicking) {
      setShowStartSessionModal(true)
    }
  }

  const handleStopTimer = (): void => {
    if (sessionClockTicking) {
      stopTimer()
      setShowStartSessionModal(false)
      setShowGoalsWindow(false)
      setShowMovableGoalsWindow(false)
      window.electron.ipcRenderer.send('hide-goals-window')
    }
  }

  const handleResetTimer = (): void => {
    if (sessionInProgress) {
      resetTimer()
      setShowGoalsWindow(false)
      setShowMovableGoalsWindow(false)
      window.electron.ipcRenderer.send('hide-goals-window')
    }
  }

  const handleDuck = (): void => {
    // TODO: Implement duck
  }

  const handleAddNote = async (): Promise<void> => {
    const newNote: Partial<Note> = {
      title: 'New Note',
      content: '<p>Start writing...</p>',
      is_pinned: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    try {
      const { data, error } = await supabase
        .from('notes')
        .insert(newNote)
        .select()
        .single()

      if (error) throw error
      setDisplayedNoteDaybook(data)
    } catch (error) {
      console.error('Error creating note:', error)
    }
  }

  const handleOpenListView = async (): Promise<void> => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('updated_at', { ascending: false })

      if (error) throw error

      setNotesList(data)
      setIsListModalOpen(true)
    } catch (error) {
      console.error('Error fetching notes:', error)
    }
  }

  return (
    <>
      <div
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        className="flex justify-between titlebar">
        <div className="flex justify-between w-full titlebar">
          <div className="w-[90px]"></div> 
          <div className="flex-1 text-center text-white opacity-50 font-bold pt-1">
            <span className={`transition-opacity duration-300 ease-in-out ${isHovering ? 'opacity-100' : 'opacity-0'}`}>
              {displayedNoteDaybook?.title || ''}
            </span>
          </div>
          <div className="flex flex-row items-center">
            <div 
              className="border-border flex items-center"
              onMouseEnter={() => setIsControlsHovering(true)}
              onMouseLeave={() => setIsControlsHovering(false)}
            >
              <button 
                onClick={() => {
                  console.log('Play button clicked');
                  if (!sessionClockTicking) handleStartTimer();
                }}
                className="mr-2 bg-transparent non-draggable"
                disabled={sessionClockTicking}>
                <div className={`py-2 text-bright-green/85 text-base transition-opacity duration-300 ease-in-out ${isControlsHovering ? 'opacity-100' : 'opacity-0'} ${sessionClockTicking ? 'opacity-30' : ''}`}>
                  <CiPlay1 />
                </div>
              </button>
              <button 
                onClick={() => {
                  console.log('Stop button clicked');
                  if (sessionClockTicking) handleStopTimer();
                }}
                className="mr-2 bg-transparent non-draggable"
                disabled={!sessionClockTicking}
              >
                <div className={`py-2 text-bright-green/85 text-base transition-opacity duration-300 ease-in-out ${
                  isControlsHovering ? 'opacity-100' : 'opacity-0'
                } ${!sessionClockTicking ? 'opacity-30' : ''}`}>
                  <CiStop1 />
                </div>
              </button>
              <button 
                onClick={() => {
                  console.log('Reset button clicked');
                  if (sessionInProgress) handleResetTimer();
                }}
                className="mr-1 bg-transparent non-draggable"
                disabled={!sessionInProgress}
              >
                <div className={`py-2 text-bright-green/85 text-base transition-opacity duration-300 ease-in-out ${
                  isControlsHovering ? 'opacity-100' : 'opacity-0'
                } ${!sessionInProgress ? 'opacity-30' : ''}`}>
                  <CiUndo />
                </div>
              </button>
            </div>
            <div className={`h-6 w-px mr-1 bg-bright-green transition-opacity duration-300 ease-in-out ${isControlsHovering ? 'opacity-50' : 'opacity-0'}`}></div>
            <div className="flex flex-row items-center">
              <button onClick={handleDuck} className="mr-2 bg-transparent non-draggable">
                <div className={`py-2 text-bright-green/85 text-base transition-opacity duration-300 ease-in-out ${isHovering ? 'opacity-100' : 'opacity-0'}`}>
                  <GiPlasticDuck />
                </div>
              </button>
              <button onClick={handleOpenListView} className="mr-2 bg-transparent non-draggable">
                <div className={`py-2 text-bright-green/85 text-base transition-opacity duration-300 ease-in-out ${isHovering ? 'opacity-100' : 'opacity-0'}`}>
                  <CiViewList />
                </div>
              </button>
              <button
                onClick={handleAddNote}
                className="bg-transparent text-bright-green/85"
                title="Mark daybook as finished"
              >
                <div className={`flex items-center text-base transition-opacity duration-300 ease-in-out ${isHovering ? 'opacity-100' : 'opacity-0'}`}>
                  <CiSquarePlus />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
      <NotesListModal
        isOpen={isListModalOpen}
        onClose={() => setIsListModalOpen(false)}
        notes={notesList}
        setNotes={setNotesList}
        onNoteSelect={handleNoteSelect}
      />
      {showStartSessionModal && <StartSessionModal />}
    </>
  )
}

export default Tools
