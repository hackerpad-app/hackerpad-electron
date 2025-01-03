import React, { useState } from 'react'
import { BubbleMenu } from '@tiptap/react'
import Note from './../../types/Note'
import { Editor } from '@tiptap/core'
import { Transaction } from 'prosemirror-state'
import { useNotesContext } from './../context/NotesContext'

interface HighlightMenuProps {
  editor: Editor
}

const HighlightMenu = ({ editor }: HighlightMenuProps): JSX.Element => {
  const { searchEditorNotes, editorSearchResults, updateNote } = useNotesContext()
  const [isSearching, setIsSearching] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const [isEstimateOpen, setIsEstimateOpen] = useState(false)

  const toggleEstimate = (): void => {
    setIsEstimateOpen(!isEstimateOpen)
    if (isSearching) {
      setIsSearching(false)
    }
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const query = event.target.value
    setSearchTerm(query)
    searchEditorNotes(query)
  }

  const toggleSearch = (): void => {
    setIsSearching(!isSearching)
    if (isEstimateOpen) {
      setIsEstimateOpen(false)
    }
  }

  const handleHeadlineClick = async (note: Note): Promise<void> => {
    if (!editor.state.selection.empty) {
      const { from, to } = editor.state.selection
      const highlightedText = editor.state.doc.textBetween(from, to, '')

      const currentDate = new Date()
      const dateTimeString = currentDate.toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })

      const noteTag = ` [${note.headline}]`
      const dateTimeTag = ` [${dateTimeString}]`

      // Update current editor with highlighted text and note tag
      editor
        .chain()
        .focus()
        .insertContentAt(to, noteTag)
        .setTextSelection({ from, to: to + noteTag.length })
        .run()

      editor.commands.setMark('highlight', { color: 'rgba(255, 255, 77, 0.25)' })

      const newContent = `${note.content.trimEnd()}<br>${highlightedText}${dateTimeTag}`

      try {
        updateNote(note.id, 'notes', note.headline, newContent, note.pinned)
      } catch (error) {
        console.error('Error updating note:', error)
      }
    } else {
      console.log('No text is highlighted.')
    }

    editor.commands.blur()
    setIsSearching(false)
    setSearchTerm('')
  }

  const addHighlightWithPrefix = (color: string): void => {
    let colorName
    switch (color) {
      case '#2b8a3e':
        colorName = '<5min'
        break
      case '#1864ab':
        colorName = '15-30m'
        break
      case '#f59f00':
        colorName = '1-2h'
        break
      case '#f50000':
        colorName = '2-4h'
        break
      default:
        colorName = ''
    }

    editor
      .chain()
      .focus()
      .command(({ tr, state }: { tr: Transaction; state: Editor['state'] }) => {
        const { from, to } = state.selection
        const text = state.doc.textBetween(from, to, '')
        if (text) {
          const prefixText = `[${colorName}] `
          tr.insertText(prefixText, from)
          tr.addMark(
            from,
            from + prefixText.length - 1, // Subtract 1 to exclude the space after the bracket
            editor.schema.marks.highlight.create({
              color
            })
          )
        }
        return true
      })
      .run()
    setIsSearching(false)
  }

  return (
    <BubbleMenu
      editor={editor}
      className="transform -translate-x-8 translate-y-11 absolute rounded-lg p-2 bg-gray-800 bg-opacity-90 shadow-lg backdrop-blur-sm transition-all duration-300 ease-in-out hover:bg-opacity-95"
    >
      <div className="flex flex-col">
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleEstimate}
            className={`text-gray-300 hover:text-white px-2 py-1 rounded transition duration-300 ease-in-out ${
              isEstimateOpen ? 'bg-gray-700' : 'hover:bg-gray-700'
            }`}
          >
            Estimate
          </button>
          <button
            onClick={toggleSearch}
            className={`text-gray-300 hover:text-white px-2 py-1 rounded transition duration-300 ease-in-out ${
              isSearching ? 'bg-gray-700' : 'hover:bg-gray-700'
            }`}
          >
            Notes
          </button>
          {isSearching && (
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="px-2 py-0.5 text-sm rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-gray-500 placeholder-gray-400 w-24"
            />
          )}
        </div>
        {isEstimateOpen && (
          <div className="mt-2 space-y-1">
            <button
              onClick={() => addHighlightWithPrefix('#2b8a3e')}
              className="px-2 py-1 w-full text-left rounded text-gray-300 hover:bg-green-700 hover:text-white transition duration-300 ease-in-out"
            >
              <div>&lt;5min.</div>{' '}
            </button>
            <button
              onClick={() => addHighlightWithPrefix('#1864ab')}
              className="px-2 py-1 w-full text-left rounded text-gray-300 hover:bg-blue-700 hover:text-white transition duration-300 ease-in-out"
            >
              15-30m.
            </button>
            <button
              onClick={() => addHighlightWithPrefix('#f59f00')}
              className="px-2 py-1 w-full text-left rounded text-gray-300 hover:bg-yellow-600 hover:text-white transition duration-300 ease-in-out"
            >
              1-2h
            </button>
            <button
              onClick={() => addHighlightWithPrefix('#f50000')}
              className="px-2 py-1 w-full text-left rounded text-gray-300 hover:bg-red-700 hover:text-white transition duration-300 ease-in-out"
            >
              2-4h
            </button>
          </div>
        )}
        {isSearching && searchTerm && (
          <div className="mt-2">
            <ul className="space-y-1">
              {editorSearchResults.slice(0, 5).map((note) => (
                <li key={note.id}>
                  <button
                    className="w-full text-left px-2 py-0.5 rounded-md transition duration-300 ease-in-out text-gray-300 hover:bg-gray-700 hover:text-white text-sm truncate"
                    onClick={() => handleHeadlineClick(note)}
                  >
                    {note.headline}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </BubbleMenu>
  )
}

export default HighlightMenu
