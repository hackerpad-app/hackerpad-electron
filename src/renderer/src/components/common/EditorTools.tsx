import React, { useState } from 'react'
import { PiNotePencilLight } from 'react-icons/pi'
import { AiOutlineDelete } from 'react-icons/ai'
import { useNotesContext } from './../context/NotesContext'

import DaybookSummaryModal from './DaybookSummaryModal'
import { useSessionGoals } from '../context/SessionGoalsContext'
import { PiCalendarCheckThin } from 'react-icons/pi'
import DeleteNoteModal from './DeleteNoteModal'
import NoteStartModal from './modals/NoteStartModal'

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
  const [isHovering, setIsHovering] = useState(false)

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

  return (
    <div
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className="flex justify-between titlebar"
    >
      <NoteStartModal
        isVisible={isModalVisible}
        headlineInput={headlineInput}
        onHeadlineChange={(value) => setHeadlineInput(value)}
        onSubmit={handleModalSubmit}
        onClose={() => setIsModalVisible(false)}
      />
      {isDeleteModalOpen && (
        <DeleteNoteModal
          isOpen={isDeleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onDelete={handleDeleteNote}
        />
      )}
      <div className="flex justify-between w-full titlebar">
        <div className="w-[70px]"></div>
        <div className="flex-1 text-center text-bright-green pt-2">
          <span style={{ opacity: isHovering ? '1' : '0', transition: 'opacity 0.3s ease-in-out' }}>
            Some Title
          </span>
        </div>
        <div className="flex flex-row items-center border border-white">
          <button onClick={handleCreateNote} className="mr-2 bg-transparent non-draggable">
            <div className="py-2 text-bright-green" style={{ fontSize: '16px', opacity: isHovering ? '1' : '0', transition: 'opacity 0.3s ease-in-out' }}>
              <PiNotePencilLight />
            </div>
          </button>
          <button onClick={() => setDeleteModalOpen(true)} className="mr-2 bg-transparent non-draggable">
            <div className="py-2 text-bright-green" style={{ fontSize: '16px', opacity: isHovering ? '1' : '0', transition: 'opacity 0.3s ease-in-out' }}>
              <AiOutlineDelete />
            </div>
          </button>
          <button
            onClick={handleFinishDaybook}
            className="bg-transparent text-bright-green mr-2"
            title="Mark daybook as finished"
          >
            <div className="flex items-center" style={{ fontSize: '16px', opacity: isHovering ? '1' : '0', transition: 'opacity 0.3s ease-in-out' }}>
              <PiCalendarCheckThin />
            </div>
          </button>
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
