import React, { useState } from 'react'
import { PiNotePencilLight } from 'react-icons/pi'
import { AiOutlineDelete } from 'react-icons/ai'
import { useNotesContext } from './../context/NotesContext'

interface ToolsProps {
  pad: string
}

const Tools = ({ pad }: ToolsProps) => {
  const { createNote, deleteNote, searchSidebarNotes } = useNotesContext()
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [headlineInput, setHeadlineInput] = useState('')

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
      <div className="flex justify-between">
        <div className="flex ml-2">
          <button onClick={handleCreateNote} className="mr-3 bg-transparent">
            <div className="py-4 text-bright-green" style={{ fontSize: '2rem' }}>
              <PiNotePencilLight />
            </div>
          </button>
          <button onClick={() => deleteNote(pad)} className="bg-transparent">
            <div className="py-4 text-bright-green" style={{ fontSize: '2rem' }}>
              <AiOutlineDelete />
            </div>
          </button>
        </div>
        <div className="flex items-center">
          <input
            type="text"
            placeholder="Search..."
            onChange={handleSearchChange}
            className="bg-transparent border-b border-bright-green text-bright-green px-2 py-1 mr-2 focus:outline-none"
          />
        </div>
      </div>
    </div>
  )
}

export default Tools
