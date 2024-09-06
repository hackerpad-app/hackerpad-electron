import React, { useState, useEffect } from 'react'
import { PiNotePencilLight } from 'react-icons/pi'
import { AiOutlineDelete } from 'react-icons/ai'
import Note from '../../types/Note'

interface ToolsProps {
  pad: string
  createNote: (pad: string, headline?: string) => Promise<void>
  removeNote: (pad: string) => Promise<void>
  updateNote: (pad: string, headline: string, content: string) => Promise<void>
  displayedNote: Note | null
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>
}

const Tools = ({
  pad,
  removeNote,
  createNote,
  updateNote,
  displayedNote,
  setSearchQuery
}: ToolsProps): React.ReactNode => {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [headlineInput, setHeadlineInput] = useState('')

  useEffect((): (() => void) => {
    const saveInterval = setInterval(() => {
      if (displayedNote) {
        updateNote(pad, displayedNote.headline, displayedNote.content)
      }
    }, 5000)

    return () => clearInterval(saveInterval)
  }, [pad, displayedNote, updateNote])

  const handleCreateNote = async (): Promise<void> => {
    if (pad === 'issues') {
      setIsModalVisible(true)
    } else {
      try {
        await createNote(pad)
        if (displayedNote) {
          await updateNote(pad, displayedNote.headline, displayedNote.content)
        }
      } catch (error) {
        console.error(error)
      }
    }
  }

  const handleModalSubmit = async (): Promise<void> => {
    try {
      await createNote(pad, headlineInput)
      setIsModalVisible(false) // Close the modal after submission
    } catch (error) {
      console.error(error)
    }
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    console.log('search set with', event.target.value)
    setSearchQuery(event.target.value)
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
          <button onClick={() => removeNote(pad)} className="bg-transparent">
            <div className="py-4 text-bright-green" style={{ fontSize: '2rem' }}>
              <AiOutlineDelete />
            </div>
          </button>
        </div>
        <div className="py-4 w-1/4">
          <input
            type="text"
            placeholder="Search"
            className="border rounded text- h-8 p-2 w-full bg-transparent"
            onChange={handleSearchChange}
          />
        </div>
      </div>
    </div>
  )
}

export default Tools
