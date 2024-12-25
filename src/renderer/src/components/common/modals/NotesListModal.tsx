import React, { useState } from 'react'
import type Note from '../../../types/NoteNew'
import { supabase } from '../../../lib/supabaseClient'
import { FaThumbtack, FaTrash } from 'react-icons/fa'

interface NotesListModalProps {
  isOpen: boolean
  onClose: () => void
  notes: Note[]
  setNotes: (notes: Note[]) => void
  onNoteSelect: (note: Note) => void
}

const NotesListModal: React.FC<NotesListModalProps> = ({ isOpen, onClose, notes, setNotes, onNoteSelect }) => {
  const [searchQuery, setSearchQuery] = useState('')

  if (!isOpen) return null

  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const pinnedNotes = filteredNotes.filter(note => note.is_pinned)
  const unpinnedNotes = filteredNotes.filter(note => !note.is_pinned)

  const handlePinToggle = async (note: Note, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent note selection when clicking pin
    try {
      const { error } = await supabase
        .from('notes')
        .update({ is_pinned: !note.is_pinned })
        .eq('id', note.id)

      if (error) throw error

      // Update the local state immediately
      const updatedNotes = notes.map(n => 
        n.id === note.id ? { ...n, is_pinned: !n.is_pinned } : n
      )
      setNotes(updatedNotes)
    } catch (error) {
      console.error('Error updating pin status:', error)
    }
  }

  const handleDelete = async (note: Note, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!window.confirm('Are you sure you want to delete this note?')) return

    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', note.id)

      if (error) throw error

      // Update local state to remove the deleted note
      const updatedNotes = notes.filter(n => n.id !== note.id)
      setNotes(updatedNotes)
    } catch (error) {
      console.error('Error deleting note:', error)
    }
  }

  const NoteItem = ({ note }: { note: Note }) => (
    <button
      key={note.id}
      onClick={() => {
        onNoteSelect(note)
        onClose()
      }}
      className="w-full text-left p-2 rounded hover:bg-gray-700 text-white/85"
    >
      <div className="flex justify-between items-center">
        <div className="font-medium">{note.title}</div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-white/50">
            {new Date(note.updated_at).toLocaleDateString()}
          </div>
          <button
            onClick={(e) => handlePinToggle(note, e)}
            className={`text-white/50 hover:text-white/85 transition-colors ${
              note.is_pinned ? 'text-white/85' : ''
            }`}
          >
            <FaThumbtack className={note.is_pinned ? 'rotate-45' : ''} />
          </button>
          <button
            onClick={(e) => handleDelete(note, e)}
            className="text-white/50 hover:text-red-500 transition-colors"
          >
            <FaTrash size={14} />
          </button>
        </div>
      </div>
    </button>
  )

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-gray-800 rounded-lg p-4 w-96 max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      > 
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2 rounded bg-gray-700 text-white/85 placeholder-white/50 
                     border border-white/20 focus:border-white/50 outline-none"
          />
        </div>

        <div className="space-y-4">
          {pinnedNotes.length > 0 && (
            <div>
              <h3 className="text-white/50 text-sm mb-2">Pinned</h3>
              <div className="space-y-2">
                {pinnedNotes.map((note) => (
                  <NoteItem key={note.id} note={note} />
                ))}
              </div>
            </div>
          )}
          
          <div>
            <h3 className="text-white/50 text-sm mb-2">
              {'Notes'}
            </h3>
            <div className="space-y-2">
              {unpinnedNotes.map((note) => (
                <NoteItem key={note.id} note={note} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotesListModal