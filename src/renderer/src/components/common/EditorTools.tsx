import React, { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useNotesContext } from '../context/NotesContext'
import type Note from '../../types/NoteNew'

import { GiPlasticDuck } from 'react-icons/gi'
import { CiSquarePlus, CiViewList, CiPlay1, CiStop1, CiUndo } from 'react-icons/ci'
import { createClient } from '@/utils/supabase/server';

interface ToolsProps {
  pad: string
}

const Tools = ({ pad }: ToolsProps): React.ReactNode => {

  const [isHovering, setIsHovering] = useState(false)
  const [isControlsHovering, setIsControlsHovering] = useState(false)

  const { setDisplayedNoteDaybook, setDisplayedNoteNotes } = useNotesContext()
  const setDisplayedNote = pad === 'daybook' ? setDisplayedNoteDaybook : setDisplayedNoteNotes

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

      // Update the displayed note with the newly created one
      setDisplayedNote(data)
      console.log('Note created:', data)
    } catch (error) {
      console.error('Error creating note:', error)
    }
  }

  const handleOpenListView = (): void => {
    // TODO: Implement open list view
  }

  return (
    <div
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className="flex justify-between titlebar"
    >
      <div className="flex justify-between w-full titlebar">
        <div className="w-[90px]"></div> 
        <div className="flex-1 text-center text-white opacity-50 font-bold pt-1">
          <span className={`transition-opacity duration-300 ease-in-out ${isHovering ? 'opacity-100' : 'opacity-0'}`}>
            Some Title
          </span>
        </div>
        <div className="flex flex-row items-center">
          <div 
            className="border-border flex items-center"
            onMouseEnter={() => setIsControlsHovering(true)}
            onMouseLeave={() => setIsControlsHovering(false)}
          >
            <button className="mr-2 bg-transparent non-draggable">
              <div className={`py-2 text-bright-green/85 text-base transition-opacity duration-300 ease-in-out ${isControlsHovering ? 'opacity-100' : 'opacity-0'}`}>
                <CiPlay1 />
              </div>
            </button>
            <button className="mr-2 bg-transparent non-draggable">
              <div className={`py-2 text-bright-green/85 text-base transition-opacity duration-300 ease-in-out ${isControlsHovering ? 'opacity-100' : 'opacity-0'}`}>
                <CiStop1 />
              </div>
            </button>
            <button className="mr-1 bg-transparent non-draggable">
              <div className={`py-2 text-bright-green/85 text-base transition-opacity duration-300 ease-in-out ${isControlsHovering ? 'opacity-100' : 'opacity-0'}`}>
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
  )
}

export default Tools
