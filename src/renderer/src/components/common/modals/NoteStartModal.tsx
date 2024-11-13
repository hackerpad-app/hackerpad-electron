import React from 'react'

interface NoteStartModalProps {
  isVisible: boolean
  headlineInput: string
  onHeadlineChange: (value: string) => void
  onSubmit: () => void
  onClose: () => void
}

const NoteStartModal = ({
  isVisible,
  headlineInput,
  onHeadlineChange,
  onSubmit,
  onClose
}: NoteStartModalProps): React.ReactNode => {
  if (!isVisible) return null

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-dark-mode-bg text-white p-6 rounded-lg w-96">
          <input
            type="text"
            placeholder="Headline"
            value={headlineInput} r 
            onChange={(e) => onHeadlineChange(e.target.value)}
            className="w-full p-2 mb-4 bg-dark-mode-lighter text-white rounded border border-white/20"
          />
          <div className="flex justify-center">
            <button onClick={onClose} className="bg-gray-500 text-white px-4 py-2 rounded mr-2">
              Cancel
            </button>
            <button onClick={onSubmit} className="bg-bright-green text-black px-4 py-2 rounded">
              Create
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default NoteStartModal
