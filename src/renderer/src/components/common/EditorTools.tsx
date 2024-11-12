import React, { useState } from 'react'
import { PiNotePencilLight } from 'react-icons/pi'
import { PiCopySimpleThin } from 'react-icons/pi'
import { AiOutlineDelete } from 'react-icons/ai'
import { useNotesContext } from './../context/NotesContext'
import { FaSearch } from 'react-icons/fa'

import DaybookSummaryModal from './DaybookSummaryModal'
import { useSessionGoals } from '../context/SessionGoalsContext'
import { PiCalendarCheckThin } from 'react-icons/pi'
import DeleteNoteModal from './DeleteNoteModal'

interface ToolsProps {
  pad: string
}

const Tools = ({ pad }: ToolsProps): React.ReactNode => {
  const {
    createNote,
    deleteNote,
    searchSidebarNotes,
    displayedNoteDaybook,
    displayedNoteNotes,
    duplicateNote
  } = useNotesContext()

  const [isModalVisible, setIsModalVisible] = useState(false)
  const [headlineInput, setHeadlineInput] = useState('')
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false)
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false)
  const { setDaySummary } = useSessionGoals()

  const handleCreateNote = (): void => {
    if (pad === 'notes') {
      setIsModalVisible(true)
    } else {
      createNote(pad)
    }
  }

  const handleModalSubmit = async (): Promise<void> => {
    try {
      await createNote(pad, headlineInput)
      setIsModalVisible(false)
    } catch (error) {
      console.error(error)
    }
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    searchSidebarNotes(event.target.value)
  }

  const handleFinishDaybook = (): void => {
    if (displayedNoteDaybook) {
      setIsSummaryModalOpen(true)
    }
  }

  const handleSaveSummary = (summary: string): void => {
    setDaySummary(summary)
  }

  const handleDeleteNote = (): void => {
    deleteNote(pad)
    setDeleteModalOpen(false)
  }

  const handleDuplicateNote = (): void => {
    const displayedNote = pad === 'daybook' ? displayedNoteDaybook : displayedNoteNotes
    if (displayedNote) {
      duplicateNote(pad, displayedNote)
    }
  }

  return (
    <div>
      {isModalVisible && (
        <>
          <div className="overlay"></div>
          <div className="modal flex justify-between">
            <input
              type="text"
              placeholder="Heeadline"
              value={headlineInput}
              onChange={(e) => setHeadlineInput(e.target.value)}
              className="border p-2"
            />
            <button onClick={handleModalSubmit} className=" bg-blue-500 text-white p-2 rounded">
              Create
            </button>
          </div>
        </>
      )}
      {isDeleteModalOpen && (
        <DeleteNoteModal
          isOpen={isDeleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onDelete={handleDeleteNote}
        />
      )}
      <div className="flex justify-between">
        <div className="flex ml-2">
          <button onClick={handleCreateNote} className="mr-3 bg-transparent">
            <div className="py-4 text-bright-green" style={{ fontSize: '2rem' }}>
              <PiNotePencilLight />
            </div>
          </button>
          <button onClick={handleDuplicateNote} className="mr-3 bg-transparent">
            <div className="py-4 text-bright-green" style={{ fontSize: '2rem' }}>
              <PiCopySimpleThin />
            </div>
          </button>
          <button onClick={() => setDeleteModalOpen(true)} className="bg-transparent">
            <div className="py-4 text-bright-green" style={{ fontSize: '2rem' }}>
              <AiOutlineDelete />
            </div>
          </button>
        </div>
        <div className="flex flex-row">
          <button
            onClick={handleFinishDaybook}
            className="bg-transparent text-bright-green mr-2"
            title="Mark daybook as finished"
          >
            <div className="flex items-center" style={{ fontSize: '2.3rem' }}>
              <PiCalendarCheckThin />
            </div>
          </button>
          <div className="flex items-center relative">
            <input
              type="text"
              placeholder="Search..."
              onChange={handleSearchChange}
              className="bg-transparent rounded-md text-gray-400 pl-8 pr-3 py-1 mr-2 ring-gray-300 ring-1 focus:outline-none w-64"
            />
            <FaSearch className="absolute left-2 text-gray-400" />
          </div>
        </div>
      </div>
      <DaybookSummaryModal
        isOpen={isSummaryModalOpen}
        onClose={() => setIsSummaryModalOpen(false)}
        onSave={handleSaveSummary}
      />
    </div>
  )
}

export default Tools
