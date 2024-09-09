import { useRef, useEffect, useState } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import { useNotesContext } from './../context/NotesContext'

import Highlight from '@tiptap/extension-highlight'
import Typography from '@tiptap/extension-typography'
import StarterKit from '@tiptap/starter-kit'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Strike from '@tiptap/extension-strike'
import Confetti from 'react-dom-confetti'
import Tools from './EditorTools'
import HighlightMenu from './HighlightMenu'
import BulletList from '@tiptap/extension-bullet-list'
import ListItem from '@tiptap/extension-list-item'

interface EditorProps {
  pad: string
}

export default function Editor({ pad }: EditorProps) {
  const {
    displayedNoteDaybook,
    displayedNoteNotes,
    setDisplayedNoteDaybook,
    setDisplayedNoteNotes
  } = useNotesContext()

  const displayedNote = pad === 'daybook' ? displayedNoteDaybook : displayedNoteNotes
  const setDisplayedNote = pad === 'daybook' ? setDisplayedNoteDaybook : setDisplayedNoteNotes

  const [confetti, setConfetti] = useState(false)
  const [checkedCount, setCheckedCount] = useState(0)

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
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
    onUpdate: () => {
      const newContent = editor?.getHTML()
      if (newContent !== undefined && displayedNote) {
        const newNote = { ...displayedNote, content: newContent }
        setDisplayedNote(newNote)

        // Handle strike-through logic and confetti
        const newCheckedCount = (newContent.match(/data-checked="true"/g) || []).length
        if (newCheckedCount > checkedCount) {
          setConfetti(true)
          setTimeout(() => setConfetti(false), 2000)
        }
        setCheckedCount(newCheckedCount)
      }
    }
  })

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
      <div className="relative ">
        <Tools pad={pad} />
      </div>
      <div className="flex pb-3 items-center justify-between border border-green-900 rounded-lg">
        <div className="-nowrap relative">
          <EditorContent editor={headlineEditor} />
        </div>
        <div className="mr-5">
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
      <div className="h-3/4 w-full" style={{ minHeight: '75%', height: 'auto' }}>
        {editor && pad === 'daybook' && <HighlightMenu editor={editor}></HighlightMenu>}{' '}
        <EditorContent editor={editor} />
        <Confetti active={confetti} />
      </div>
    </div>
  )
}
