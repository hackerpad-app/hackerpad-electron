import React from 'react'

interface DeleteNoteModalProps {
  isOpen: boolean
  onClose: () => void
  onDelete: () => void
}

const DeleteNoteModal: React.FC<DeleteNoteModalProps> = ({ isOpen, onClose, onDelete }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-dark-mode-bg text-white p-6 rounded-lg w-96">
        <h2 className="text-xl text-center font-bold mb-4">Confirm Deletion</h2>
        <p className="mb-4">Are you sure you want to delete displayed note?</p>
        <div className="flex justify-center">
          <button className="bg-gray-500 text-white px-4 py-2 rounded mr-2" onClick={onClose}>
            Cancel
          </button>
          <button className="bg-bright-red text-white px-4 py-2 rounded" onClick={onDelete}>
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeleteNoteModal
