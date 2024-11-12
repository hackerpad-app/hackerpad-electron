import React, { useState } from 'react'
// import { useSessionGoals } from '../context/SessionGoalsContext'
import { useNotesContext } from '../context/NotesContext'
interface DaybookSummaryModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (summary: string) => void
}

const DaybookSummaryModal: React.FC<DaybookSummaryModalProps> = ({ isOpen, onClose, onSave }) => {
  const [summary, setSummary] = useState('')
  const { setIsCurrentDaybookFinished } = useNotesContext()

  if (!isOpen) return null

  const handleSave = (): void => {
    setIsCurrentDaybookFinished(true)
    onSave(summary)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-dark-mode-bg text-white p-6 rounded-lg w-96">
        <h2 className="text-xl text-center font-bold mb-4">End of Day Reflection</h2>
        <textarea
          className="w-full h-32 p-2 mb-4 bg-dark-mode-lighter text-black rounded"
          placeholder="What are the highlights of your day?"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
        />
        <div className="flex justify-center">
          <button className="bg-gray-500 text-white px-4 py-2 rounded mr-2" onClick={onClose}>
            Cancel
          </button>
          <button className="bg-bright-green text-black px-4 py-2 rounded" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

export default DaybookSummaryModal
