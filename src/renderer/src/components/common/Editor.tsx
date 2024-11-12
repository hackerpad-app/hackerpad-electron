import { useRef, useEffect, useState } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import { useNotesContext } from './../context/NotesContext'
import { useSessionGoals } from './../context/SessionGoalsContext'
import { useTimer } from './../context/TimeContext' // Add this import
import Highlight from '@tiptap/extension-highlight'
import Typography from '@tiptap/extension-typography'
import StarterKit from '@tiptap/starter-kit'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Strike from '@tiptap/extension-strike'
import confetti from 'canvas-confetti'
import Tools from './EditorTools'
import HighlightMenu from './HighlightMenu'
import BulletList from '@tiptap/extension-bullet-list'
import ListItem from '@tiptap/extension-list-item'
import CompletedSessionGoals from './CompletedSessionGoals'

interface EditorProps {
  pad: string
}

export default function Editor({ pad }: EditorProps): React.ReactElement {
  const {
    displayedNoteDaybook,
    displayedNoteNotes,
    setDisplayedNoteDaybook,
    setDisplayedNoteNotes
  } = useNotesContext()

  const displayedNote = pad === 'daybook' ? displayedNoteDaybook : displayedNoteNotes
  const setDisplayedNote = pad === 'daybook' ? setDisplayedNoteDaybook : setDisplayedNoteNotes

  const [previousContent, setPreviousContent] = useState('')

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const { currentSession, endCurrentSession } = useSessionGoals()
  const { isBreak } = useTimer()

  useEffect(() => {
    return (): void => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])

  const headlineEditor = useEditor({
    extensions: [StarterKit, Highlight.configure({ multicolor: true }), Typography],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose max-w-none h-full w-full'
      }
    },
    onUpdate: () => {
      const newHeadline = headlineEditor?.getHTML()
      if (newHeadline !== undefined && displayedNote) {
        let cleanedHeadline = newHeadline.replace(/<[^>]*>/g, '')
        if (cleanedHeadline.length > 45) {
          cleanedHeadline = cleanedHeadline.substring(0, 25)
          headlineEditor?.commands.setContent(`<h1>${cleanedHeadline}</h1>`)
        }

        const newNote = { ...displayedNote, headline: cleanedHeadline }
        setDisplayedNote(newNote)
      }
    }
  })

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: false, // Disable default bulletList to use custom configuration
        listItem: false // Disable default listItem to use custom configuration
      }),
      BulletList,
      ListItem,
      Highlight.configure({ multicolor: true }),
      Typography,
      Strike,
      TaskItem.configure({
        nested: true
      }),
      TaskList
    ],
    content: ``,
    editorProps: {
      attributes: {
        class: 'prose max-w-none h-1/2 w-full tiptap task-list-inline'
      }
    },
    onUpdate: ({ editor }) => {
      const newContent = editor.getHTML()
      if (newContent !== undefined && displayedNote) {
        const newNote = { ...displayedNote, content: newContent }
        setDisplayedNote(newNote)

        // Check if a task was just completed
        const prevCheckedCount = (previousContent.match(/data-checked="true"/g) || []).length
        const newCheckedCount = (newContent.match(/data-checked="true"/g) || []).length

        if (newCheckedCount > prevCheckedCount) {
          triggerConfetti()
        }

        setPreviousContent(newContent)
      }
    }
  })

  useEffect(() => {
    if (isBreak && currentSession) {
      endCurrentSession()
    }
  }, [isBreak, currentSession, endCurrentSession])

  const triggerConfetti = (): void => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#26a69a', '#00897b', '#00796b', '#00695c', '#004d40']
    })
  }

  useEffect(() => {
    if (displayedNote && headlineEditor && editor) {
      const wrappedHeadline = `<h1>${displayedNote.headline}</h1>`
      if (headlineEditor.getHTML() !== wrappedHeadline) {
        headlineEditor.commands.setContent(wrappedHeadline, false, {
          preserveWhitespace: true
        })
      }

      if (editor.getHTML() !== displayedNote.content) {
        editor.commands.setContent(displayedNote.content, false, {
          preserveWhitespace: true
        })
      }
    }
  }, [headlineEditor, editor, displayedNote])

  return (
    <div className="bg-dark-green relative h-screen w-full pr-5">
      <div className="relative">
        <Tools pad={pad} />
      </div>
      <div className="flex pb-3 items-center justify-between border-b border-green-900">
        <div className="-nowrap relative">
          <EditorContent editor={headlineEditor} />
        </div>
        <div className="mr-5 text-gray-400">
          {displayedNote?.updated_at
            ? `${new Date(displayedNote.updated_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              })}`
            : ''}
        </div>{' '}
      </div>
      <div className="mb-4">
        {pad === 'daybook' && displayedNote && <CompletedSessionGoals noteId={displayedNote.id} />}
      </div>
      <div className="h-3/4 w-full" style={{ minHeight: '75%', height: 'auto' }}>
        {editor && pad === 'daybook' && <HighlightMenu editor={editor} />}
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
